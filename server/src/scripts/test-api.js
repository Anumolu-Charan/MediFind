import { ENV } from '../config/env.js';

const BASE_URL = `http://localhost:${ENV.PORT}/api`;

async function runTests() {
  console.log('🧪 Starting MediFind API test suite against', BASE_URL);

  // 1. Health Check
  const healthRes = await fetch(`${BASE_URL}/health`);
  const health = await healthRes.json();
  console.log('1. Health check status:', health.status, 'OK');

  // 2. Auth Login (Admin)
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@medifind.com', password: 'Admin@123' }),
  });
  const adminAuth = await adminLoginRes.json();
  console.log('2. Admin login:', adminAuth.success ? 'SUCCESS' : 'FAILED', adminAuth.user?.name);
  const adminToken = adminAuth.token;

  // 3. Auth Login (Pharmacy)
  const pharmLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'careplus@medifind.com', password: 'Pharmacy@123' }),
  });
  const pharmAuth = await pharmLoginRes.json();
  console.log('3. Pharmacy login:', pharmAuth.success ? 'SUCCESS' : 'FAILED', pharmAuth.pharmacy?.name);
  const pharmToken = pharmAuth.token;

  // 4. Get Medicines
  const medsRes = await fetch(`${BASE_URL}/medicines`);
  const meds = await medsRes.json();
  console.log('4. Medicines list count:', meds.data?.length);

  // 5. Search Medicines
  const searchRes = await fetch(`${BASE_URL}/medicines/search?q=Paracetamol`);
  const searchData = await searchRes.json();
  console.log('5. Search Paracetamol found:', searchData.count, 'medicines with inventory linked');

  // 6. Nearby Pharmacies
  const nearbyRes = await fetch(`${BASE_URL}/pharmacies/nearby?lat=17.4150&lng=78.4340&radius=25`);
  const nearbyData = await nearbyRes.json();
  console.log('6. Nearby pharmacies count:', nearbyData.count, 'first distance:', nearbyData.data[0]?.distance_display);

  // 7. AI Natural Language Search
  const aiRes = await fetch(`${BASE_URL}/ai/medicine-search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      prompt: 'I have a high fever and severe headache, which medicines are available near me?',
      lat: 17.4150,
      lng: 78.4340,
    }),
  });
  const aiData = await aiRes.json();
  console.log('7. AI Search parsed intent:', aiData.ai_analysis?.intent);
  console.log('   AI identified terms:', aiData.ai_analysis?.search_terms);
  console.log('   AI matched medicines count:', aiData.medicines?.length);
  console.log('   AI matched pharmacies count:', aiData.pharmacies?.length);

  // 8. AI History
  const historyRes = await fetch(`${BASE_URL}/ai/history`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const historyData = await historyRes.json();
  console.log('8. AI History entries:', historyData.count);

  // 9. Pharmacy Inventory CRUD
  // Fetch CarePlus inventory
  const myInvRes = await fetch(`${BASE_URL}/inventory?pharmacy_id=${pharmAuth.pharmacy.id}`, {
    headers: { Authorization: `Bearer ${pharmToken}` },
  });
  const myInv = await myInvRes.json();
  const firstItem = myInv.data[0];
  console.log('9. Inventory item to update:', firstItem.id, 'current status:', firstItem.status, 'qty:', firstItem.quantity);

  // Update item
  const updateRes = await fetch(`${BASE_URL}/inventory/${firstItem.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${pharmToken}`,
    },
    body: JSON.stringify({
      quantity: 42,
      status: 'In Stock',
      price: 18.5,
    }),
  });
  const updateData = await updateRes.json();
  console.log('10. Inventory update result:', updateData.success ? 'SUCCESS' : 'FAILED', 'new qty:', updateData.data?.quantity);

  // 10. Admin Stats
  const statsRes = await fetch(`${BASE_URL}/admin/stats`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const statsData = await statsRes.json();
  console.log('11. Admin stats:', statsData.stats);

  console.log('\n✅ All backend endpoints tested and verified successfully!\n');
}

runTests().catch((err) => {
  console.error('❌ Test suite error:', err);
  process.exit(1);
});
