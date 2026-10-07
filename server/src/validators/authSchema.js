import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['patient', 'pharmacy', 'admin'], {
    errorMap: () => ({ message: 'Role must be patient, pharmacy, or admin' }),
  }),
  phone: z.string().optional(),
  pharmacy_details: z
    .object({
      name: z.string().min(2, 'Pharmacy name must be at least 2 characters'),
      address: z.string().min(5, 'Pharmacy address is required'),
      phone: z.string().min(5, 'Pharmacy phone is required'),
      license_number: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      opening_hours: z.string().optional(),
    })
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().optional(),
  pharmacy: z
    .object({
      name: z.string().min(2).optional(),
      address: z.string().min(5).optional(),
      phone: z.string().min(5).optional(),
      opening_hours: z.string().optional(),
      license_number: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    })
    .optional(),
});
