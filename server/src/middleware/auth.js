import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { supabase } from '../config/db.js';

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, ENV.JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please log in again.',
      });
    }

    // Verify user exists in database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, phone, created_at')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or has been removed.',
      });
    }

    req.user = user;

    // If pharmacy user, attach pharmacy record
    if (user.role === 'pharmacy') {
      const { data: pharmacy } = await supabase
        .from('pharmacies')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      req.pharmacy = pharmacy || null;
      req.pharmacyId = pharmacy ? pharmacy.id : null;
    }

    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        const { data: user } = await supabase
          .from('users')
          .select('id, name, email, role')
          .eq('id', decoded.id)
          .single();
        if (user) {
          req.user = user;
          if (user.role === 'pharmacy') {
            const { data: pharmacy } = await supabase
              .from('pharmacies')
              .select('id')
              .eq('user_id', user.id)
              .maybeSingle();
            req.pharmacyId = pharmacy ? pharmacy.id : null;
          }
        }
      } catch (e) {
        // Ignore token error for optional auth
      }
    }
    next();
  } catch (error) {
    next(error);
  }
}
