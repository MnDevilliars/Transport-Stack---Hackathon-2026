const fs = require('fs');
const path = require('path');
const http = require('http');

const DELHI_ROUTES = require('../data/delhiRoutes');
const DELHI_STOPS = require('../data/delhiStops');

const CACHE_FILE = path.join(__dirname, '../data/roadGeometries.json');

function fetchOsrmSegment(fromStop, toStop) {
  return new Promise((resolve) => {
    const url = `http://router.project-osrm.org/route/v1/driving/${fromStop.lng},${fromStop.lat};${toStop.lng},${toStop.lat}?overview=full&geometries=geojson`;

    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.code === 'Ok' && json.routes && json.routes[0]) {
            // OSRM returns [lng, lat], Leaflet needs [lat, lng]
            const coords = json.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
            const distanceMeters = json.routes[0].distance;
            resolve({ coords, distanceKm: Number((distanceMeters / 1000).toFixed(2)) });
            return;
          }
        } catch (e) {}
        // Fallback straight segment
        resolve({
          coords: [[fromStop.lat, fromStop.lng], [toStop.lat, toStop.lng]],
          distanceKm: 0
        });
      });
    }).on('error', () => {
      resolve({
        coords: [[fromStop.lat, fromStop.lng], [toStop.lat, toStop.lng]],
        distanceKm: 0
      });
    });
  });
}

async function run() {
  const geometries = {};
  const segmentPairs = new Set();

  for (const rId in DELHI_ROUTES) {
    const route = DELHI_ROUTES[rId];
    for (let i = 0; i < route.stops.length - 1; i++) {
      segmentPairs.add(`${route.stops[i]}::${route.stops[i+1]}`);
      segmentPairs.add(`${route.stops[i+1]}::${route.stops[i]}`);
    }
  }

  console.log(`Fetching road geometries for ${segmentPairs.size} road segments...`);

  for (const pair of segmentPairs) {
    const [s1, s2] = pair.split('::');
    const stop1 = DELHI_STOPS[s1];
    const stop2 = DELHI_STOPS[s2];
    if (stop1 && stop2) {
      const res = await fetchOsrmSegment(stop1, stop2);
      geometries[pair] = res.coords;
      console.log(`✓ Fetched road curve for: ${stop1.name} ➔ ${stop2.name} (${res.coords.length} road points)`);
      // polite delay
      await new Promise(r => setTimeout(r, 120));
    }
  }

  fs.writeFileSync(CACHE_FILE, JSON.stringify(geometries, null, 2));
  console.log(`Saved all road geometries to ${CACHE_FILE}`);
}

run();
