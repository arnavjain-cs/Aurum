/**
 * GridShield OS — Vehicle Simulation
 * Simulates EMS vehicles moving around major Texas cities.
 */

export interface Vehicle {
  id: string;
  position: [number, number]; // [lng, lat]
  target: [number, number];
  heading: number;
  status: 'moving' | 'stopped';
  waitTime: number;
  speed: number;
}

const TEXAS_CITIES = [
  { name: 'Austin', lat: 30.2672, lng: -97.7431 },
  { name: 'Dallas', lat: 32.7767, lng: -96.7970 },
  { name: 'Houston', lat: 29.7604, lng: -95.3698 },
  { name: 'San Antonio', lat: 29.4241, lng: -98.4936 },
  { name: 'El Paso', lat: 31.7619, lng: -106.4850 },
  { name: 'Fort Worth', lat: 32.7555, lng: -97.3308 },
  { name: 'Corpus Christi', lat: 27.8005, lng: -97.3964 },
  { name: 'Laredo', lat: 27.5306, lng: -99.4803 },
  { name: 'Lubbock', lat: 33.5779, lng: -101.8552 },
  { name: 'Amarillo', lat: 35.2210, lng: -101.8313 },
  { name: 'Midland', lat: 31.9973, lng: -102.0779 },
  { name: 'Brownsville', lat: 25.9017, lng: -97.4975 },
];

function getRandomCity() {
  return TEXAS_CITIES[Math.floor(Math.random() * TEXAS_CITIES.length)];
}

function getRandomPositionNear(city: { lat: number, lng: number }, radius: number = 0.5) {
  return [
    city.lng + (Math.random() - 0.5) * radius * 2,
    city.lat + (Math.random() - 0.5) * radius * 2,
  ] as [number, number];
}

export function createInitialVehicles(count: number = 20): Vehicle[] {
  const vehicles: Vehicle[] = [];
  for (let i = 0; i < count; i++) {
    const city = getRandomCity();
    const pos = getRandomPositionNear(city);
    const target = getRandomPositionNear(city);
    vehicles.push({
      id: `ems-${i.toString().padStart(2, '0')}`,
      position: pos,
      target: target,
      heading: Math.random() * 360,
      status: 'moving',
      waitTime: 0,
      speed: 0.00003 + Math.random() * 0.00005, // Drastically reduced for slow crawl
    });
  }
  return vehicles;
}

export function updateVehicles(vehicles: Vehicle[]): Vehicle[] {
  return vehicles.map(v => {
    if (v.status === 'stopped') {
      if (v.waitTime > 0) {
        return { ...v, waitTime: v.waitTime - 1 };
      } else {
        const city = TEXAS_CITIES.find(c => 
          Math.abs(c.lng - v.position[0]) < 2 && Math.abs(c.lat - v.position[1]) < 2
        ) || getRandomCity();
        return { 
          ...v, 
          status: 'moving', 
          target: getRandomPositionNear(city),
          speed: 0.00003 + Math.random() * 0.00005 // Drastically reduced speed
        };
      }
    }

    // Moving
    const [currLng, currLat] = v.position;
    const [targetLng, targetLat] = v.target;
    
    const dLng = targetLng - currLng;
    const dLat = targetLat - currLat;
    const dist = Math.sqrt(dLng * dLng + dLat * dLat);

    if (dist < v.speed) {
      // Arrived
      return { 
        ...v, 
        position: v.target, 
        status: 'stopped', 
        waitTime: Math.floor(Math.random() * 300) + 150 // Increased wait time
      };
    }

    const angle = Math.atan2(dLat, dLng);
    const newLng = currLng + Math.cos(angle) * v.speed;
    const newLat = currLat + Math.sin(angle) * v.speed;
    const newHeading = (angle * 180 / Math.PI) * -1 + 90; // Mapbox heading

    return {
      ...v,
      position: [newLng, newLat],
      heading: newHeading,
    };
  });
}
