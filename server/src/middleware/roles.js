import { supabase } from '../config/db.js';

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] role. Your role is ${req.user.role}.`,
      });
    }

    next();
  };
}

// Ensure the caller is an Admin OR the owner of the pharmacy/inventory item
export async function requireInventoryOwnership(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    // Admins have full access
    if (req.user.role === 'admin') {
      return next();
    }

    if (req.user.role !== 'pharmacy') {
      return res.status(403).json({ success: false, message: 'Forbidden. Pharmacy or admin access only.' });
    }

    const inventoryId = req.params.id;

    if (!inventoryId) {
      return res.status(400).json({ success: false, message: 'Inventory ID is required.' });
    }

    // Lookup inventory item
    const { data: item, error } = await supabase
      .from('inventory')
      .select('id, pharmacy_id, pharmacies(user_id)')
      .eq('id', inventoryId)
      .single();

    if (error || !item) {
      return res.status(404).json({ success: false, message: 'Inventory record not found.' });
    }

    if (item.pharmacies?.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only modify your own pharmacy inventory records.',
      });
    }

    req.inventoryItem = item;
    next();
  } catch (error) {
    next(error);
  }
}
