import { Router } from 'express';
import { supabase } from '../config/db.js';
import { optionalAuthMiddleware } from '../middleware/auth.js';
import { parseNaturalLanguageMedicineQuery } from '../services/geminiService.js';
import { calculateDistanceKm, generateDirectionsUrl, geocodeAddressOrCity } from '../services/mapsService.js';

const router = Router();

// POST /api/ai/medicine-search - Natural language AI search
router.post('/medicine-search', optionalAuthMiddleware, async (req, res, next) => {
  try {
    const { prompt, lat, lng, city, location_query, radius = 50 } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A search prompt is required.',
      });
    }

    let userLat = lat ? parseFloat(lat) : null;
    let userLng = lng ? parseFloat(lng) : null;

    const manual = (city || location_query || '').trim();
    if ((!userLat || !userLng) && manual) {
      const geocoded = await geocodeAddressOrCity(manual);
      if (geocoded) {
        userLat = geocoded.latitude;
        userLng = geocoded.longitude;
      }
    }

    // 1. Process query with Gemini AI (strictly validates output with Zod)
    const aiResult = await parseNaturalLanguageMedicineQuery(prompt);

    // 2. Search medicines database using search_terms and extracted names
    const searchTerms = Array.isArray(aiResult.search_terms) ? aiResult.search_terms : [];
    if (aiResult.medicine_name) searchTerms.push(aiResult.medicine_name);
    if (aiResult.generic_name) searchTerms.push(aiResult.generic_name);

    const uniqueTerms = [...new Set(searchTerms.filter((t) => Boolean(t && t.trim())))];

    // Build PostgREST OR filter for terms
    let matchedMedicines = [];
    if (uniqueTerms.length > 0) {
      const orConditions = uniqueTerms
        .map((t) => `name.ilike.%${t}%,generic_name.ilike.%${t}%,category.ilike.%${t}%`)
        .join(',');

      const { data: meds, error: medError } = await supabase
        .from('medicines')
        .select(`
          id,
          name,
          generic_name,
          dosage_form,
          strength,
          manufacturer,
          category,
          description,
          requires_prescription,
          is_demo,
          inventory (
            id,
            quantity,
            price,
            status,
            updated_at,
            is_demo,
            pharmacies (
              id,
              name,
              address,
              phone,
              email,
              latitude,
              longitude,
              opening_hours,
              is_demo
            )
          )
        `)
        .or(orConditions);

      if (!medError && meds) {
        matchedMedicines = meds;
      }
    }

    // If exact or conditions yielded no results, fallback to fetching all medicines and doing soft match
    if (matchedMedicines.length === 0) {
      const { data: allMeds } = await supabase.from('medicines').select(`
        *,
        inventory (
          id,
          quantity,
          price,
          status,
          updated_at,
          is_demo,
          pharmacies (*)
        )
      `).limit(20);

      matchedMedicines = (allMeds || []).filter((m) => {
        const text = `${m.name} ${m.generic_name} ${m.category}`.toLowerCase();
        return uniqueTerms.some((t) => text.includes(t.toLowerCase()));
      });

      // If still empty, return popular common medicines as recommendations
      if (matchedMedicines.length === 0 && allMeds && allMeds.length > 0) {
        matchedMedicines = allMeds.slice(0, 3);
      }
    }

    // 3. Compile matching pharmacies with distance calculations
    const pharmacyMap = new Map();
    matchedMedicines.forEach((med) => {
      (med.inventory || []).forEach((inv) => {
        if (!inv.pharmacies) return;
        const p = inv.pharmacies;
        if (!pharmacyMap.has(p.id)) {
          const distanceKm = userLat && userLng
            ? calculateDistanceKm(userLat, userLng, p.latitude, p.longitude)
            : null;

          pharmacyMap.set(p.id, {
            ...p,
            distance_km: distanceKm,
            distance_display: distanceKm !== null ? `${distanceKm} km` : 'Location not provided',
            estimated_travel_time_mins: distanceKm !== null ? Math.max(5, Math.round(distanceKm * 2.5)) : null,
            directions_url: generateDirectionsUrl(userLat, userLng, p.latitude, p.longitude, p.name),
            available_medicines: [],
          });
        }

        pharmacyMap.get(p.id).available_medicines.push({
          inventory_id: inv.id,
          medicine_id: med.id,
          name: med.name,
          generic_name: med.generic_name,
          strength: med.strength,
          dosage_form: med.dosage_form,
          quantity: inv.quantity,
          price: inv.price,
          status: inv.status,
          updated_at: inv.updated_at,
        });
      });
    });

    const nearbyPharmacies = Array.from(pharmacyMap.values());
    if (userLat && userLng) {
      nearbyPharmacies.sort((a, b) => (a.distance_km || 9999) - (b.distance_km || 9999));
    }

    // 4. Save to ai_outputs table
    try {
      await supabase.from('ai_outputs').insert({
        user_id: req.user?.id || null,
        raw_prompt: prompt.trim(),
        intent: aiResult.intent || 'medicine_search',
        medicine_name: aiResult.medicine_name || null,
        generic_name: aiResult.generic_name || null,
        search_terms: aiResult.search_terms || [],
        response_json: aiResult,
        results_count: matchedMedicines.length,
      });
    } catch (saveError) {
      console.warn('Failed to record AI search history:', saveError.message);
    }

    res.json({
      success: true,
      query: prompt,
      ai_analysis: {
        intent: aiResult.intent,
        medicine_name: aiResult.medicine_name,
        generic_name: aiResult.generic_name,
        search_terms: aiResult.search_terms,
        source: aiResult.source,
        safety_disclaimer:
          'Medical AI Safety Notice: This service only locates medicine inventory in registered pharmacies. It does not provide medical diagnoses, treatment advice, or dosage prescriptions. Always consult a licensed healthcare professional.',
      },
      results_count: matchedMedicines.length,
      medicines: matchedMedicines,
      pharmacies: nearbyPharmacies,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/ai/history - Get AI search history
router.get('/history', optionalAuthMiddleware, async (req, res, next) => {
  try {
    let query = supabase.from('ai_outputs').select('*').order('created_at', { ascending: false }).limit(50);

    if (req.user && req.user.role !== 'admin') {
      // Return queries by this user
      query = query.eq('user_id', req.user.id);
    }

    const { data: history, error } = await query;
    if (error) throw error;

    res.json({
      success: true,
      count: history ? history.length : 0,
      data: history || [],
    });
  } catch (error) {
    next(error);
  }
});

export default router;
