import { Router } from 'express';
import { supabase } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole, requireInventoryOwnership } from '../middleware/roles.js';
import { validateBody } from '../middleware/validate.js';
import { createInventorySchema, updateInventorySchema } from '../validators/inventorySchema.js';

const router = Router();

// GET /api/inventory - List inventory items
router.get('/', async (req, res, next) => {
  try {
    const { pharmacy_id, medicine_id, status } = req.query;

    let query = supabase.from('inventory').select(`
      id,
      quantity,
      price,
      status,
      is_demo,
      created_at,
      updated_at,
      pharmacies (
        id,
        name,
        address,
        phone,
        latitude,
        longitude,
        opening_hours,
        is_demo
      ),
      medicines (
        id,
        name,
        generic_name,
        dosage_form,
        strength,
        manufacturer,
        category,
        requires_prescription,
        is_demo
      )
    `);

    if (pharmacy_id) {
      query = query.eq('pharmacy_id', pharmacy_id);
    }

    if (medicine_id) {
      query = query.eq('medicine_id', medicine_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('updated_at', { ascending: false });

    const { data: items, error } = await query;
    if (error) throw error;

    res.json({
      success: true,
      count: items ? items.length : 0,
      data: items || [],
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/inventory - Create inventory record (Pharmacy or Admin)
router.post(
  '/',
  authMiddleware,
  requireRole('pharmacy', 'admin'),
  validateBody(createInventorySchema),
  async (req, res, next) => {
    try {
      let targetPharmacyId = req.body.pharmacy_id;

      if (req.user.role === 'pharmacy') {
        if (!req.pharmacyId) {
          return res.status(400).json({
            success: false,
            message: 'Your pharmacy profile is not yet configured. Please create or update your profile first.',
          });
        }
        targetPharmacyId = req.pharmacyId;
      }

      if (!targetPharmacyId) {
        return res.status(400).json({
          success: false,
          message: 'pharmacy_id is required.',
        });
      }

      const { medicine_id, quantity, price = 0, status } = req.body;

      // Check if medicine exists
      const { data: med, error: medError } = await supabase
        .from('medicines')
        .select('id, name')
        .eq('id', medicine_id)
        .single();

      if (medError || !med) {
        return res.status(404).json({
          success: false,
          message: 'Selected medicine not found in catalog.',
        });
      }

      // Check if inventory item already exists for this pharmacy & medicine
      const { data: existing } = await supabase
        .from('inventory')
        .select('id')
        .eq('pharmacy_id', targetPharmacyId)
        .eq('medicine_id', medicine_id)
        .maybeSingle();

      let result;
      if (existing) {
        // Update existing record
        const { data: updated, error: updateErr } = await supabase
          .from('inventory')
          .update({
            quantity,
            price,
            status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select(`
            *,
            medicines (*),
            pharmacies (*)
          `)
          .single();

        if (updateErr) throw updateErr;
        result = updated;
      } else {
        // Insert new record
        const { data: inserted, error: insertErr } = await supabase
          .from('inventory')
          .insert({
            pharmacy_id: targetPharmacyId,
            medicine_id,
            quantity,
            price,
            status,
            is_demo: false,
            updated_at: new Date().toISOString(),
          })
          .select(`
            *,
            medicines (*),
            pharmacies (*)
          `)
          .single();

        if (insertErr) throw insertErr;
        result = inserted;
      }

      res.status(201).json({
        success: true,
        message: 'Inventory updated successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/inventory/:id - Update inventory item (Pharmacy owner or Admin)
router.put(
  '/:id',
  authMiddleware,
  requireRole('pharmacy', 'admin'),
  requireInventoryOwnership,
  validateBody(updateInventorySchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { quantity, price, status } = req.body;

      const updates = {
        updated_at: new Date().toISOString(),
      };

      if (quantity !== undefined) {
        updates.quantity = quantity;
        // If status wasn't explicitly passed, auto-compute
        if (!status) {
          if (quantity === 0) updates.status = 'Out of Stock';
          else if (quantity <= 5) updates.status = 'Low Stock';
          else updates.status = 'In Stock';
        }
      }

      if (price !== undefined) updates.price = price;
      if (status) updates.status = status;

      const { data: updated, error } = await supabase
        .from('inventory')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          medicines (*),
          pharmacies (*)
        `)
        .single();

      if (error) throw error;

      res.json({
        success: true,
        message: 'Stock updated successfully. Realtime updates sent to patients.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/inventory/:id - Delete inventory item (Pharmacy owner or Admin)
router.delete(
  '/:id',
  authMiddleware,
  requireRole('pharmacy', 'admin'),
  requireInventoryOwnership,
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const { error } = await supabase.from('inventory').delete().eq('id', id);
      if (error) throw error;

      res.json({
        success: true,
        message: 'Item removed from inventory successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
