import { ENV } from '../config/env.js';

async function test() {
  console.log('Testing dynamic geocoding for "Rajampet"...');
  const geoRes = await fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent('Rajampet'), {
    headers: { 'User-Agent': 'MediFind-App/1.0' },
  });
  const geo = await geoRes.json();
  console.log('Geocoded result:', geo[0]?.display_name, 'Coordinates:', geo[0]?.lat, geo[0]?.lon);

  if (geo[0]) {
    const lat = geo[0].lat;
    const lon = geo[0].lon;
    const overpassQuery = `[out:json][timeout:10];(node["amenity"="pharmacy"](around:15000,${lat},${lon});way["amenity"="pharmacy"](around:15000,${lat},${lon}););out center 5;`;
    try {
      const opRes = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'MediFind-App/1.0' },
        body: 'data=' + encodeURIComponent(overpassQuery),
      });
      const op = await opRes.json();
      console.log('Overpass found', op.elements?.length, 'pharmacies nearby');
    } catch (e) {
      console.log('Overpass query error:', e.message);
    }
  }
}

test();
