import { z } from 'zod';

export const createMedicineSchema = z.object({
  name: z.string().min(2, 'Medicine name is required'),
  generic_name: z.string().min(2, 'Generic name is required'),
  dosage_form: z.string().min(1, 'Dosage form is required (e.g. Tablet, Syrup, Capsule)'),
  strength: z.string().min(1, 'Strength is required (e.g. 500mg, 10mg)'),
  manufacturer: z.string().min(2, 'Manufacturer is required'),
  category: z.string().min(2, 'Category is required'),
  description: z.string().optional(),
  requires_prescription: z.boolean().default(false),
  is_demo: z.boolean().default(false),
});

export const updateMedicineSchema = createMedicineSchema.partial();
