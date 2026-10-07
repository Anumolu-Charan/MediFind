import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/db.js';
import { ENV } from '../config/env.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/authSchema.js';

const router = Router();

// POST /api/auth/register
router.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password, role, phone, pharmacy_details } = req.body;

    // Check if email already registered
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password_hash,
        role,
        phone: phone ? phone.trim() : null,
      })
      .select('id, name, email, role, phone, created_at')
      .single();

    if (userError || !newUser) {
      throw new Error(`Failed to create user: ${userError?.message}`);
    }

    let pharmacyData = null;

    // If pharmacy user, create pharmacy profile
    if (role === 'pharmacy') {
      const details = pharmacy_details || {};
      const { data: createdPharmacy, error: pharmacyError } = await supabase
        .from('pharmacies')
        .insert({
          user_id: newUser.id,
          name: details.name || `${newUser.name}'s Pharmacy`,
          address: details.address || 'Address pending setup',
          phone: details.phone || newUser.phone || 'Phone pending setup',
          email: newUser.email,
          license_number: details.license_number || `LIC-${Date.now().toString().slice(-6)}`,
          latitude: details.latitude || 17.385044, // Default center coordinate
          longitude: details.longitude || 78.486671,
          opening_hours: details.opening_hours || '8:00 AM - 10:00 PM',
          is_demo: false,
        })
        .select('*')
        .single();

      if (pharmacyError) {
        console.warn('Pharmacy profile creation warning:', pharmacyError.message);
      } else {
        pharmacyData = createdPharmacy;
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: newUser,
      pharmacy: pharmacyData,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email, password_hash, role, phone, created_at')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (userError || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    let pharmacyData = null;
    if (user.role === 'pharmacy') {
      const { data: pharmacy } = await supabase
        .from('pharmacies')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      pharmacyData = pharmacy || null;
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      created_at: user.created_at,
    };

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: safeUser,
      pharmacy: pharmacyData,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  res.json({
    success: true,
    user: req.user,
    pharmacy: req.pharmacy || null,
  });
});

// PUT /api/auth/profile
router.put('/profile', authMiddleware, validateBody(updateProfileSchema), async (req, res, next) => {
  try {
    const { name, phone, pharmacy: pharmacyUpdate } = req.body;

    const userUpdates = {};
    if (name) userUpdates.name = name.trim();
    if (phone !== undefined) userUpdates.phone = phone ? phone.trim() : null;
    userUpdates.updated_at = new Date().toISOString();

    const { data: updatedUser, error: userError } = await supabase
      .from('users')
      .update(userUpdates)
      .eq('id', req.user.id)
      .select('id, name, email, role, phone, created_at, updated_at')
      .single();

    if (userError) throw userError;

    let updatedPharmacy = req.pharmacy || null;

    if (req.user.role === 'pharmacy' && pharmacyUpdate && req.pharmacy) {
      const pUpdate = { ...pharmacyUpdate, updated_at: new Date().toISOString() };
      const { data: pData, error: pError } = await supabase
        .from('pharmacies')
        .update(pUpdate)
        .eq('id', req.pharmacy.id)
        .select('*')
        .single();

      if (!pError) {
        updatedPharmacy = pData;
      }
    }

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser,
      pharmacy: updatedPharmacy,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
