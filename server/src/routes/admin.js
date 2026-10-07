import { Router } from 'express';
import { supabase } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = Router();

// Enforce admin role for all routes in this router
router.use(authMiddleware, requireRole('admin'));

// GET /api/admin/stats - Overview statistics
router.get('/stats', async (req, res, next) => {
  try {
    const [
      { count: totalUsers },
      { count: totalPharmacies },
      { count: totalMedicines },
      { count: totalInventory },
      { count: totalAiSearches },
      { data: inStockItems },
      { data: lowStockItems },
      { data: outOfStockItems },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('pharmacies').select('*', { count: 'exact', head: true }),
      supabase.from('medicines').select('*', { count: 'exact', head: true }),
      supabase.from('inventory').select('*', { count: 'exact', head: true }),
      supabase.from('ai_outputs').select('*', { count: 'exact', head: true }),
      supabase.from('inventory').select('id').eq('status', 'In Stock'),
      supabase.from('inventory').select('id').eq('status', 'Low Stock'),
      supabase.from('inventory').select('id').eq('status', 'Out of Stock'),
    ]);

    res.json({
      success: true,
      stats: {
        total_users: totalUsers || 0,
        total_pharmacies: totalPharmacies || 0,
        total_medicines: totalMedicines || 0,
        total_inventory_items: totalInventory || 0,
        total_ai_searches: totalAiSearches || 0,
        stock_breakdown: {
          in_stock: inStockItems ? inStockItems.length : 0,
          low_stock: lowStockItems ? lowStockItems.length : 0,
          out_of_stock: outOfStockItems ? outOfStockItems.length : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/users - List users
router.get('/users', async (req, res, next) => {
  try {
    const { role } = req.query;
    let query = supabase
      .from('users')
      .select('id, name, email, role, phone, created_at, updated_at, pharmacies(id, name, address, phone)')
      .order('created_at', { ascending: false });

    if (role) {
      query = query.eq('role', role);
    }

    const { data: users, error } = await query;
    if (error) throw error;

    res.json({
      success: true,
      count: users ? users.length : 0,
      data: users || [],
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/users/:id - Delete a user
router.delete('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account.',
      });
    }

    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;

    res.json({
      success: true,
      message: 'User account and associated records deleted.',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/activity - Recent system activity
router.get('/activity', async (req, res, next) => {
  try {
    const [{ data: recentInventory, error: invErr }, { data: recentSearches, error: aiErr }] =
      await Promise.all([
        supabase
          .from('inventory')
          .select('id, quantity, status, updated_at, pharmacies(name), medicines(name)')
          .order('updated_at', { ascending: false })
          .limit(10),
        supabase
          .from('ai_outputs')
          .select('id, raw_prompt, intent, medicine_name, created_at, results_count')
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

    if (invErr) throw invErr;
    if (aiErr) throw aiErr;

    res.json({
      success: true,
      data: {
        recent_inventory_updates: recentInventory || [],
        recent_ai_searches: recentSearches || [],
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
