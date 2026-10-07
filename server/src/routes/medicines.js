import { Router } from 'express';
import { supabase } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validateBody } from '../middleware/validate.js';
import { createMedicineSchema, updateMedicineSchema } from '../validators/medicineSchema.js';

const router = Router();

// GET /api/medicines - List all medicines
router.get('/', async (req, res, next) => {
  try {
    const { category, search, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('medicines')
      .select('*, inventory(id, quantity, status, price, pharmacy_id)', { count: 'exact' });

    if (category) {
      query = query.ilike('category', `%${category}%`);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,generic_name.ilike.%${search}%,category.ilike.%${search}%`);
    }

    query = query.order('name', { ascending: true }).range(Number(offset), Number(offset) + Number(limit) - 1);

    const { data: medicines, error, count } = await query;

    if (error) throw error;

    // Enhance each medicine with inventory summary
    const enhanced = (medicines || []).map((med) => {
      const invList = med.inventory || [];
      const inStockCount = invList.filter((i) => i.status === 'In Stock').length;
      const lowStockCount = invList.filter((i) => i.status === 'Low Stock').length;
      const totalPharmacies = invList.length;

      return {
        ...med,
        stock_summary: {
          total_pharmacies: totalPharmacies,
          in_stock_pharmacies: inStockCount,
          low_stock_pharmacies: lowStockCount,
          overall_status: inStockCount > 0 ? 'In Stock' : lowStockCount > 0 ? 'Low Stock' : 'Out of Stock',
        },
      };
    });

    res.json({
      success: true,
      total: count,
      data: enhanced,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/medicines/search - Dedicated search endpoint
router.get('/search', async (req, res, next) => {
  try {
    const { q, category, status } = req.query;
    const searchTerm = (q || '').trim();

    let query = supabase.from('medicines').select(`
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
          latitude,
          longitude,
          opening_hours,
          is_demo
        )
      )
    `);

    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,generic_name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
    }

    if (category) {
      query = query.ilike('category', `%${category}%`);
    }

    const { data: results, error } = await query;
    if (error) throw error;

    // Filter by stock status if requested
    let filtered = results || [];
    if (status) {
      filtered = filtered.filter((med) =>
        med.inventory?.some((inv) => inv.status.toLowerCase() === status.toLowerCase())
      );
    }

    res.json({
      success: true,
      query: searchTerm,
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/medicines/:id - Get specific medicine with pharmacies inventory
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: medicine, error } = await supabase
      .from('medicines')
      .select(`
        *,
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
      .eq('id', id)
      .single();

    if (error || !medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found.',
      });
    }

    res.json({
      success: true,
      data: medicine,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/medicines - Create medicine (Admin only)
router.post('/', authMiddleware, requireRole('admin'), validateBody(createMedicineSchema), async (req, res, next) => {
  try {
    const { data: newMed, error } = await supabase
      .from('medicines')
      .insert(req.body)
      .select('*')
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Medicine created successfully.',
      data: newMed,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/medicines/:id - Update medicine (Admin only)
router.put('/:id', authMiddleware, requireRole('admin'), validateBody(updateMedicineSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: updatedMed, error } = await supabase
      .from('medicines')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Medicine updated successfully.',
      data: updatedMed,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/medicines/:id - Delete medicine (Admin only)
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('medicines').delete().eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Medicine deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
