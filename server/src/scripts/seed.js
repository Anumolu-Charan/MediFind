import bcrypt from 'bcryptjs';
import { supabase } from '../config/db.js';

async function seed() {
  console.log('🌱 Starting MediFind database seeder...');

  // 1. Password Hashes
  const salt = 10;
  const adminHash = await bcrypt.hash('Admin@123', salt);
  const pharmacyHash = await bcrypt.hash('Pharmacy@123', salt);
  const patientHash = await bcrypt.hash('Patient@123', salt);

  // 2. Clear old demo data
  console.log('🧹 Cleaning existing data...');
  await supabase.from('inventory').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('pharmacies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('medicines').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('ai_outputs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // 3. Seed Users
  console.log('👤 Seeding users...');
  const usersToInsert = [
    {
      name: 'MediFind System Admin',
      email: 'admin@medifind.com',
      password_hash: adminHash,
      role: 'admin',
      phone: '+1 800-555-0100',
    },
    {
      name: 'CarePlus Manager',
      email: 'careplus@medifind.com',
      password_hash: pharmacyHash,
      role: 'pharmacy',
      phone: '+91 98490 12345',
    },
    {
      name: 'MediHealth Manager',
      email: 'medihealth@medifind.com',
      password_hash: pharmacyHash,
      role: 'pharmacy',
      phone: '+91 98490 23456',
    },
    {
      name: 'LifeLine Manager',
      email: 'lifeline@medifind.com',
      password_hash: pharmacyHash,
      role: 'pharmacy',
      phone: '+91 98490 34567',
    },
    {
      name: 'MetroCare Manager',
      email: 'metrocare@medifind.com',
      password_hash: pharmacyHash,
      role: 'pharmacy',
      phone: '+91 98490 45678',
    },
    {
      name: 'WellnessCorner Manager',
      email: 'wellness@medifind.com',
      password_hash: pharmacyHash,
      role: 'pharmacy',
      phone: '+91 98490 56789',
    },
    {
      name: 'John Patient',
      email: 'patient@medifind.com',
      password_hash: patientHash,
      role: 'patient',
      phone: '+91 99887 76655',
    },
  ];

  const { data: createdUsers, error: usersErr } = await supabase
    .from('users')
    .insert(usersToInsert)
    .select('id, email, name, role');

  if (usersErr) throw usersErr;
  console.log(`✅ Seeded ${createdUsers.length} users.`);

  const userMap = new Map(createdUsers.map((u) => [u.email, u.id]));

  // 4. Seed 5 Fictional Pharmacies
  console.log('🏥 Seeding 5 fictional pharmacies...');
  const pharmaciesToInsert = [
    {
      user_id: userMap.get('careplus@medifind.com'),
      name: 'CarePlus 24/7 Pharmacy (DEMO)',
      license_number: 'TS-PHARM-2024-001',
      address: 'Plot 42, Road No. 12, Banjara Hills, Hyderabad',
      phone: '+91 98490 12345',
      email: 'careplus@medifind.com',
      latitude: 17.4156,
      longitude: 78.435,
      opening_hours: 'Open 24 Hours / 7 Days',
      is_demo: true,
    },
    {
      user_id: userMap.get('medihealth@medifind.com'),
      name: 'MediHealth Chemist & Superstore (DEMO)',
      license_number: 'TS-PHARM-2024-002',
      address: 'Road No. 36, Near Metro Station, Jubilee Hills, Hyderabad',
      phone: '+91 98490 23456',
      email: 'medihealth@medifind.com',
      latitude: 17.4325,
      longitude: 78.4071,
      opening_hours: '8:00 AM - 11:30 PM',
      is_demo: true,
    },
    {
      user_id: userMap.get('lifeline@medifind.com'),
      name: 'LifeLine Wellness Drugs (DEMO)',
      license_number: 'TS-PHARM-2024-003',
      address: 'Cyber Towers Junction, Hitec City, Hyderabad',
      phone: '+91 98490 34567',
      email: 'lifeline@medifind.com',
      latitude: 17.4435,
      longitude: 78.3772,
      opening_hours: '7:30 AM - 11:00 PM',
      is_demo: true,
    },
    {
      user_id: userMap.get('metrocare@medifind.com'),
      name: 'Metro Care Pharmacy & Surgical (DEMO)',
      license_number: 'TS-PHARM-2024-004',
      address: 'Shop 14, Commercial Center, Abids Circle, Hyderabad',
      phone: '+91 98490 45678',
      email: 'metrocare@medifind.com',
      latitude: 17.398,
      longitude: 78.473,
      opening_hours: '9:00 AM - 10:00 PM',
      is_demo: true,
    },
    {
      user_id: userMap.get('wellness@medifind.com'),
      name: 'Wellness Corner Chemist (DEMO)',
      license_number: 'TS-PHARM-2024-005',
      address: 'Greenlands Crossing, Somajiguda, Hyderabad',
      phone: '+91 98490 56789',
      email: 'wellness@medifind.com',
      latitude: 17.426,
      longitude: 78.452,
      opening_hours: '8:30 AM - 10:30 PM',
      is_demo: true,
    },
  ];

  const { data: createdPharmacies, error: pharmErr } = await supabase
    .from('pharmacies')
    .insert(pharmaciesToInsert)
    .select('id, name');

  if (pharmErr) throw pharmErr;
  console.log(`✅ Seeded ${createdPharmacies.length} pharmacies.`);

  // 5. Seed 15 Common Medicines
  console.log('💊 Seeding 15 common medicines...');
  const medicinesToInsert = [
    {
      name: 'Paracetamol',
      generic_name: 'Acetaminophen',
      dosage_form: 'Tablet',
      strength: '500mg',
      manufacturer: 'GSK Consumer Healthcare',
      category: 'Analgesic / Antipyretic',
      description: 'Used for relieving mild to moderate pain and reducing fever.',
      requires_prescription: false,
      is_demo: true,
    },
    {
      name: 'Dolo 650',
      generic_name: 'Paracetamol',
      dosage_form: 'Tablet',
      strength: '650mg',
      manufacturer: 'Micro Labs Ltd.',
      category: 'Analgesic / Antipyretic',
      description: 'Fast-acting relief from fever, body ache, and persistent headache.',
      requires_prescription: false,
      is_demo: true,
    },
    {
      name: 'Amoxicillin',
      generic_name: 'Amoxicillin Trihydrate',
      dosage_form: 'Capsule',
      strength: '500mg',
      manufacturer: 'Pfizer Inc.',
      category: 'Antibiotic',
      description: 'Penicillin-type antibiotic used to treat bacterial infections of ear, nose, throat, and skin.',
      requires_prescription: true,
      is_demo: true,
    },
    {
      name: 'Ibuprofen',
      generic_name: 'Ibuprofen',
      dosage_form: 'Tablet',
      strength: '400mg',
      manufacturer: 'Abbott Healthcare',
      category: 'NSAID / Anti-inflammatory',
      description: 'Relieves inflammation, dental pain, arthritis symptoms, and muscle soreness.',
      requires_prescription: false,
      is_demo: true,
    },
    {
      name: 'Metformin',
      generic_name: 'Metformin Hydrochloride',
      dosage_form: 'Tablet',
      strength: '500mg',
      manufacturer: 'USV Pvt Ltd.',
      category: 'Antidiabetic',
      description: 'First-line medication for the treatment of type 2 diabetes mellitus.',
      requires_prescription: true,
      is_demo: true,
    },
    {
      name: 'Cetirizine',
      generic_name: 'Cetirizine Dihydrochloride',
      dosage_form: 'Tablet',
      strength: '10mg',
      manufacturer: "Dr. Reddy's Laboratories",
      category: 'Antihistamine / Allergy',
      description: 'Relieves allergy symptoms like watery eyes, runny nose, itching, and sneezing.',
      requires_prescription: false,
      is_demo: true,
    },
    {
      name: 'Azithromycin',
      generic_name: 'Azithromycin Dihydrate',
      dosage_form: 'Tablet',
      strength: '500mg',
      manufacturer: 'Cipla Ltd.',
      category: 'Macrolide Antibiotic',
      description: 'Broad-spectrum antibiotic used to treat respiratory infections, bronchitis, and pneumonia.',
      requires_prescription: true,
      is_demo: true,
    },
    {
      name: 'Omeprazole',
      generic_name: 'Omeprazole Magnesium',
      dosage_form: 'Capsule',
      strength: '20mg',
      manufacturer: 'Sun Pharmaceutical',
      category: 'Antacid / PPI',
      description: 'Proton-pump inhibitor that reduces stomach acid for GERD and heartburn relief.',
      requires_prescription: false,
      is_demo: true,
    },
    {
      name: 'Pantoprazole',
      generic_name: 'Pantoprazole Sodium',
      dosage_form: 'Tablet',
      strength: '40mg',
      manufacturer: 'Alkem Laboratories',
      category: 'Antacid / PPI',
      description: 'Treats acid reflux, erosive esophagitis, and ulcers by reducing gastric acid production.',
      requires_prescription: false,
      is_demo: true,
    },
    {
      name: 'Atorvastatin',
      generic_name: 'Atorvastatin Calcium',
      dosage_form: 'Tablet',
      strength: '20mg',
      manufacturer: 'Torrent Pharmaceuticals',
      category: 'Lipid-lowering / Statin',
      description: 'Used to lower bad cholesterol (LDL) and triglycerides in the blood.',
      requires_prescription: true,
      is_demo: true,
    },
    {
      name: 'Losartan',
      generic_name: 'Losartan Potassium',
      dosage_form: 'Tablet',
      strength: '50mg',
      manufacturer: 'Zydus Cadila',
      category: 'Antihypertensive',
      description: 'Angiotensin II receptor blocker used to lower blood pressure and protect kidneys.',
      requires_prescription: true,
      is_demo: true,
    },
    {
      name: 'Amlodipine',
      generic_name: 'Amlodipine Besylate',
      dosage_form: 'Tablet',
      strength: '5mg',
      manufacturer: 'Lupin Pharmaceuticals',
      category: 'Antihypertensive',
      description: 'Calcium channel blocker used to treat high blood pressure and chest pain (angina).',
      requires_prescription: true,
      is_demo: true,
    },
    {
      name: 'Salbutamol Inhaler',
      generic_name: 'Albuterol / Salbutamol',
      dosage_form: 'Inhaler',
      strength: '100mcg/dose',
      manufacturer: 'Cipla Ltd.',
      category: 'Bronchodilator / Asthma',
      description: 'Quick-relief rescue inhaler that opens airways for asthma and COPD patients.',
      requires_prescription: true,
      is_demo: true,
    },
    {
      name: 'Montelukast',
      generic_name: 'Montelukast Sodium',
      dosage_form: 'Tablet',
      strength: '10mg',
      manufacturer: 'Glenmark Pharmaceuticals',
      category: 'Antiasthmatic / Leukotriene Blocker',
      description: 'Used to prevent asthma attacks and treat seasonal allergic rhinitis.',
      requires_prescription: true,
      is_demo: true,
    },
    {
      name: 'Ciprofloxacin',
      generic_name: 'Ciprofloxacin Hydrochloride',
      dosage_form: 'Tablet',
      strength: '500mg',
      manufacturer: 'Bayer Pharmaceuticals',
      category: 'Fluoroquinolone Antibiotic',
      description: 'Antibiotic used to treat bacterial infections of skin, lungs, bones, joints, and UTIs.',
      requires_prescription: true,
      is_demo: true,
    },
  ];

  const { data: createdMedicines, error: medErr } = await supabase
    .from('medicines')
    .insert(medicinesToInsert)
    .select('id, name');

  if (medErr) throw medErr;
  console.log(`✅ Seeded ${createdMedicines.length} medicines.`);

  // 6. Seed Demo Inventory across pharmacies
  console.log('📦 Seeding inventory with demo stock levels...');
  const inventoryToInsert = [];

  const stockDistributions = [
    // Pharmacy 1: CarePlus (has almost everything in stock)
    [
      { qty: 45, price: 15.0, status: 'In Stock' },
      { qty: 60, price: 30.0, status: 'In Stock' },
      { qty: 25, price: 85.0, status: 'In Stock' },
      { qty: 35, price: 22.0, status: 'In Stock' },
      { qty: 50, price: 40.0, status: 'In Stock' },
      { qty: 30, price: 18.0, status: 'In Stock' },
      { qty: 15, price: 120.0, status: 'In Stock' },
      { qty: 40, price: 55.0, status: 'In Stock' },
      { qty: 28, price: 68.0, status: 'In Stock' },
      { qty: 32, price: 95.0, status: 'In Stock' },
      { qty: 20, price: 48.0, status: 'In Stock' },
      { qty: 35, price: 32.0, status: 'In Stock' },
      { qty: 12, price: 180.0, status: 'In Stock' },
      { qty: 18, price: 75.0, status: 'In Stock' },
      { qty: 22, price: 60.0, status: 'In Stock' },
    ],
    // Pharmacy 2: MediHealth (mix of in stock, low stock, out of stock)
    [
      { qty: 3, price: 16.0, status: 'Low Stock' },
      { qty: 40, price: 32.0, status: 'In Stock' },
      { qty: 0, price: 82.0, status: 'Out of Stock' },
      { qty: 18, price: 21.0, status: 'In Stock' },
      { qty: 4, price: 42.0, status: 'Low Stock' },
      { qty: 25, price: 19.0, status: 'In Stock' },
      { qty: 2, price: 125.0, status: 'Low Stock' },
      { qty: 30, price: 52.0, status: 'In Stock' },
      { qty: 0, price: 70.0, status: 'Out of Stock' },
      { qty: 20, price: 92.0, status: 'In Stock' },
      { qty: 2, price: 50.0, status: 'Low Stock' },
      { qty: 25, price: 30.0, status: 'In Stock' },
      { qty: 8, price: 175.0, status: 'In Stock' },
      { qty: 0, price: 78.0, status: 'Out of Stock' },
      { qty: 15, price: 58.0, status: 'In Stock' },
    ],
    // Pharmacy 3: LifeLine (specializing in chronic & allergy)
    [
      { qty: 25, price: 14.5, status: 'In Stock' },
      { qty: 30, price: 29.0, status: 'In Stock' },
      { qty: 12, price: 88.0, status: 'In Stock' },
      { qty: 0, price: 24.0, status: 'Out of Stock' },
      { qty: 65, price: 38.0, status: 'In Stock' },
      { qty: 40, price: 17.5, status: 'In Stock' },
      { qty: 0, price: 118.0, status: 'Out of Stock' },
      { qty: 22, price: 58.0, status: 'In Stock' },
      { qty: 35, price: 65.0, status: 'In Stock' },
      { qty: 45, price: 89.0, status: 'In Stock' },
      { qty: 38, price: 46.0, status: 'In Stock' },
      { qty: 40, price: 29.0, status: 'In Stock' },
      { qty: 15, price: 190.0, status: 'In Stock' },
      { qty: 28, price: 72.0, status: 'In Stock' },
      { qty: 0, price: 62.0, status: 'Out of Stock' },
    ],
    // Pharmacy 4: Metro Care (surgical & central store)
    [
      { qty: 50, price: 15.0, status: 'In Stock' },
      { qty: 55, price: 28.0, status: 'In Stock' },
      { qty: 30, price: 80.0, status: 'In Stock' },
      { qty: 40, price: 20.0, status: 'In Stock' },
      { qty: 0, price: 41.0, status: 'Out of Stock' },
      { qty: 5, price: 18.0, status: 'Low Stock' },
      { qty: 20, price: 115.0, status: 'In Stock' },
      { qty: 0, price: 56.0, status: 'Out of Stock' },
      { qty: 15, price: 67.0, status: 'In Stock' },
      { qty: 0, price: 95.0, status: 'Out of Stock' },
      { qty: 18, price: 49.0, status: 'In Stock' },
      { qty: 0, price: 31.0, status: 'Out of Stock' },
      { qty: 4, price: 185.0, status: 'Low Stock' },
      { qty: 12, price: 76.0, status: 'In Stock' },
      { qty: 25, price: 59.0, status: 'In Stock' },
    ],
    // Pharmacy 5: Wellness Corner (neighborhood corner store)
    [
      { qty: 10, price: 16.5, status: 'In Stock' },
      { qty: 15, price: 31.0, status: 'In Stock' },
      { qty: 4, price: 86.0, status: 'Low Stock' },
      { qty: 12, price: 23.0, status: 'In Stock' },
      { qty: 15, price: 39.0, status: 'In Stock' },
      { qty: 8, price: 20.0, status: 'In Stock' },
      { qty: 5, price: 122.0, status: 'Low Stock' },
      { qty: 14, price: 54.0, status: 'In Stock' },
      { qty: 10, price: 66.0, status: 'In Stock' },
      { qty: 8, price: 94.0, status: 'In Stock' },
      { qty: 12, price: 47.0, status: 'In Stock' },
      { qty: 15, price: 33.0, status: 'In Stock' },
      { qty: 0, price: 195.0, status: 'Out of Stock' },
      { qty: 6, price: 74.0, status: 'In Stock' },
      { qty: 8, price: 61.0, status: 'In Stock' },
    ],
  ];

  for (let pIdx = 0; pIdx < createdPharmacies.length; pIdx++) {
    const pharmacy = createdPharmacies[pIdx];
    const distribution = stockDistributions[pIdx];

    for (let mIdx = 0; mIdx < createdMedicines.length; mIdx++) {
      const medicine = createdMedicines[mIdx];
      const stock = distribution[mIdx] || { qty: 10, price: 25.0, status: 'In Stock' };

      inventoryToInsert.push({
        pharmacy_id: pharmacy.id,
        medicine_id: medicine.id,
        quantity: stock.qty,
        price: stock.price,
        status: stock.status,
        is_demo: true, // CLEARLY MARKED AS DEMO DATA
        updated_at: new Date().toISOString(),
      });
    }
  }

  const { data: createdInventory, error: invErr } = await supabase
    .from('inventory')
    .insert(inventoryToInsert)
    .select('id');

  if (invErr) throw invErr;
  console.log(`✅ Seeded ${createdInventory.length} inventory records (ALL MARKED DEMO DATA).`);

  console.log('\n===========================================');
  console.log('🎉 MediFind Seeding Completed Successfully!');
  console.log('===========================================');
  console.log('Demo Credentials:');
  console.log('1. Admin:    admin@medifind.com      / Admin@123');
  console.log('2. Pharmacy: careplus@medifind.com   / Pharmacy@123');
  console.log('             medihealth@medifind.com / Pharmacy@123');
  console.log('             lifeline@medifind.com   / Pharmacy@123');
  console.log('             metrocare@medifind.com  / Pharmacy@123');
  console.log('             wellness@medifind.com   / Pharmacy@123');
  console.log('3. Patient:  patient@medifind.com    / Patient@123');
  console.log('===========================================\n');
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
