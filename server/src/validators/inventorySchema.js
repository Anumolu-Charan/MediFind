import { z } from 'zod';

export const createInventorySchema = z.object({
  pharmacy_id: z.string().uuid().optional(),
  medicine_id: z.string().uuid('Valid medicine ID required'),
  quantity: z.number().int().min(0, 'Quantity must be 0 or greater'),
  price: z.number().min(0, 'Price must be 0 or greater').default(0),
  status: z.enum(['In Stock', 'Low Stock', 'Out of Stock'], {
    errorMap: () => ({ message: 'Status must be In Stock, Low Stock, or Out of Stock' }),
  }),
});

export const updateInventorySchema = z.object({
  quantity: z.number().int().min(0, 'Quantity must be 0 or greater').optional(),
  price: z.number().min(0, 'Price must be 0 or greater').optional(),
  status: z.enum(['In Stock', 'Low Stock', 'Out of Stock']).optional(),
});
