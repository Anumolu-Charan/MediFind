import { ENV } from '../config/env.js';

// Haversine formula to compute great-circle distance between two points in km
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined ||
      lat1 === null || lon1 === null || lat2 === null || lon2 === null) {
    return null;
  }
  const R = 6371; // Earth radius in kilometers
  const dLat = ((Number(lat2) - Number(lat1)) * Math.PI) / 180;
  const dLon = ((Number(lon2) - Number(lon1)) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((Number(lat1) * Math.PI) / 180) *
      Math.cos((Number(lat2) * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

export function generateDirectionsUrl(fromLat, fromLng, toLat, toLng, destinationName = '') {
  if (fromLat && fromLng && toLat && toLng) {
    return `https://www.google.com/maps/dir/?api=1&origin=${fromLat},${fromLng}&destination=${toLat},${toLng}`;
  }
  if (toLat && toLng) {
    return `https://www.google.com/maps/search/?api=1&query=${toLat},${toLng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destinationName)}`;
}

// Geocode any city or address dynamically without hard-coding any location
export async function geocodeAddressOrCity(query) {
  const clean = (query || '').trim();
  if (!clean) return null;

  // 1. If Google Maps API key is configured, use Google Geocoding API
  if (ENV.GOOGLE_MAPS_API_KEY) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(clean)}&key=${ENV.GOOGLE_MAPS_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 'OK' && Array.isArray(data.results) && data.results.length > 0) {
        const top = data.results[0];
        return {
          latitude: top.geometry.location.lat,
          longitude: top.geometry.location.lng,
          display_name: top.formatted_address,
          source: 'google_maps_geocoding',
        };
      }
    } catch (e) {
      console.warn('Google geocoding error:', e.message);
    }
  }

  // 2. Free universal geocoding via OpenStreetMap Nominatim (dynamic, works globally)
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(clean)}&limit=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'MediFind-Application/1.0' },
    });
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        display_name: data[0].display_name,
        source: 'nominatim_geocoding',
      };
    }
  } catch (e) {
    console.warn('Universal geocoding error:', e.message);
  }

  return null;
}

// Search real-world pharmacies nearby using Google Places / Maps integration
export async function fetchGooglePlacesNearby(lat, lng, radius = 5000) {
  if (!ENV.GOOGLE_MAPS_API_KEY) {
    return {
      success: false,
      isConfigured: false,
      message: 'GOOGLE_MAPS_API_KEY is not configured. Proximity calculations performed using dynamic user coordinates.',
      results: [],
    };
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=pharmacy&key=${ENV.GOOGLE_MAPS_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === 'OK' && Array.isArray(data.results)) {
      return {
        success: true,
        isConfigured: true,
        results: data.results.map((p) => ({
          place_id: p.place_id,
          name: p.name,
          address: p.vicinity,
          rating: p.rating,
          latitude: p.geometry?.location?.lat,
          longitude: p.geometry?.location?.lng,
          is_open: p.opening_hours?.open_now,
          directions_url: generateDirectionsUrl(lat, lng, p.geometry?.location?.lat, p.geometry?.location?.lng, p.name),
          google_maps_url: `https://www.google.com/maps/place/?q=place_id:${p.place_id}`,
        })),
      };
    }

    return {
      success: false,
      isConfigured: true,
      message: `Google Places API returned status: ${data.status}`,
      results: [],
    };
  } catch (error) {
    return {
      success: false,
      isConfigured: true,
      message: error.message,
      results: [],
    };
  }
}
