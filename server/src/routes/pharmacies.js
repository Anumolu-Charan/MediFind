import { Router } from 'express';
import { supabase } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import {
  calculateDistanceKm,
  generateDirectionsUrl,
  fetchGooglePlacesNearby,
  geocodeAddressOrCity,
} from '../services/mapsService.js';
import { ENV } from '../config/env.js';

const router = Router();

// GET /api/pharmacies - List all registered pharmacies
router.get('/', async (req, res, next) => {
  try {
    const { data: pharmacies, error } = await supabase
      .from('pharmacies')
      .select('*, inventory(id, status, quantity)')
      .order('name', { ascending: true });

    if (error) throw error;

    const formatted = (pharmacies || []).map((p) => {
      const inv = p.inventory || [];
      return {
        ...p,
        total_medicines: inv.length,
        in_stock_count: inv.filter((i) => i.status === 'In Stock').length,
        low_stock_count: inv.filter((i) => i.status === 'Low Stock').length,
        out_of_stock_count: inv.filter((i) => i.status === 'Out of Stock').length,
      };
    });

    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/pharmacies/nearby - Find pharmacies near dynamic user geolocation or manual city fallback
router.get('/nearby', async (req, res, next) => {
  try {
    const { lat, lng, city, location_query, radius = 50, medicine_id, q } = req.query;

    let userLat = lat ? parseFloat(lat) : null;
    let userLng = lng ? parseFloat(lng) : null;
    let geocodedArea = null;

    // If GPS coordinates are not provided, dynamically geocode manual city / area fallback
    const manualQuery = (city || location_query || '').trim();
    if ((!userLat || !userLng) && manualQuery) {
      const geocoded = await geocodeAddressOrCity(manualQuery);
      if (geocoded) {
        userLat = geocoded.latitude;
        userLng = geocoded.longitude;
        geocodedArea = geocoded.display_name;
      }
    }

    const maxRadiusKm = parseFloat(radius) || 50;

    // Fetch registered pharmacies with inventory and medicines from Supabase (source of truth)
    let query = supabase.from('pharmacies').select(`
      id,
      name,
      address,
      phone,
      email,
      latitude,
      longitude,
      opening_hours,
      license_number,
      is_demo,
      inventory (
        id,
        quantity,
        price,
        status,
        updated_at,
        is_demo,
        medicines (
          id,
          name,
          generic_name,
          dosage_form,
          strength,
          category
        )
      )
    `);

    const { data: pharmacies, error } = await query;
    if (error) throw error;

    // Query Google Places / Maps integration if coordinates are available
    let placesInfo = null;
    if (userLat && userLng) {
      placesInfo = await fetchGooglePlacesNearby(userLat, userLng, maxRadiusKm * 1000);
    }

    // Process and augment pharmacies with distance & inventory matching
    let processed = (pharmacies || []).map((p) => {
      const distanceKm = userLat && userLng
        ? calculateDistanceKm(userLat, userLng, p.latitude, p.longitude)
        : null;

      // Filter inventory if specific medicine requested
      let relevantInventory = p.inventory || [];
      if (medicine_id) {
        relevantInventory = relevantInventory.filter(
          (inv) => inv.medicines && inv.medicines.id === medicine_id
        );
      } else if (q) {
        const queryLower = q.toLowerCase();
        relevantInventory = relevantInventory.filter(
          (inv) =>
            inv.medicines &&
            (inv.medicines.name.toLowerCase().includes(queryLower) ||
              inv.medicines.generic_name.toLowerCase().includes(queryLower))
        );
      }

      const directionsUrl = generateDirectionsUrl(
        userLat,
        userLng,
        p.latitude,
        p.longitude,
        p.name
      );

      return {
        ...p,
        distance_km: distanceKm,
        distance_display: distanceKm !== null ? `${distanceKm} km` : 'Location not set',
        estimated_travel_time_mins: distanceKm !== null ? Math.max(5, Math.round(distanceKm * 2.5)) : null,
        directions_url: directionsUrl,
        matched_inventory: relevantInventory,
        has_requested_medicine: relevantInventory.length > 0,
        in_stock: relevantInventory.some((i) => i.status === 'In Stock'),
      };
    });

    // If searching for specific medicine, prioritize pharmacies that have it
    if (medicine_id || q) {
      processed = processed.filter((p) => p.matched_inventory.length > 0);
    }

    // Sort by distance if user coordinates were provided
    if (userLat && userLng) {
      // Prioritize proximity
      processed.sort((a, b) => {
        if (a.distance_km === null) return 1;
        if (b.distance_km === null) return -1;
        return a.distance_km - b.distance_km;
      });
    }

    res.json({
      success: true,
      google_maps_configured: Boolean(ENV.GOOGLE_MAPS_API_KEY),
      configuration_notice: !ENV.GOOGLE_MAPS_API_KEY
        ? 'Using dynamic user coordinates for Haversine distance calculations and Google Maps directions.'
        : null,
      user_location: userLat && userLng ? { lat: userLat, lng: userLng } : null,
      geocoded_area: geocodedArea,
      location_source: userLat && userLng ? (manualQuery ? 'manual_city_search' : 'browser_gps') : 'none',
      places_results: placesInfo?.results || [],
      count: processed.length,
      data: processed,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/pharmacies/:id - Get pharmacy detail with all inventory
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: pharmacy, error } = await supabase
      .from('pharmacies')
      .select(`
        *,
        inventory (
          id,
          quantity,
          price,
          status,
          updated_at,
          is_demo,
          medicines (
            id,
            name,
            generic_name,
            dosage_form,
            strength,
            category,
            manufacturer,
            description,
            requires_prescription
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error || !pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found.',
      });
    }

    res.json({
      success: true,
      data: pharmacy,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/pharmacies/:id - Update pharmacy profile
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check ownership or admin
    if (req.user.role !== 'admin') {
      const { data: existing } = await supabase
        .from('pharmacies')
        .select('user_id')
        .eq('id', id)
        .single();

      if (!existing || existing.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You can only update your own pharmacy profile.',
        });
      }
    }

    const { name, address, phone, email, opening_hours, latitude, longitude, license_number } = req.body;

    const updatePayload = {
      ...(name && { name }),
      ...(address && { address }),
      ...(phone && { phone }),
      ...(email && { email }),
      ...(opening_hours && { opening_hours }),
      ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
      ...(longitude !== undefined && { longitude: parseFloat(longitude) }),
      ...(license_number && { license_number }),
      updated_at: new Date().toISOString(),
    };

    const { data: updated, error } = await supabase
      .from('pharmacies')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Pharmacy profile updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
