import { Driver } from '../types';
import { WAREHOUSE_LOCATION } from '../data/driverData';

// Haversine formula to calculate distance between two lat/lng points in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findOptimalDriver(drivers: Driver[]): Driver | null {
  if (!drivers || drivers.length === 0) return null;

  const activeDrivers = drivers.filter(d => d.status !== 'offline');
  if (activeDrivers.length === 0) {
    return null;
  }

  // Each point of workload adds an effective distance penalty (in km).
  // This helps balance proximity with how busy a driver is.
  const WORKLOAD_PENALTY_FACTOR_KM = 10; 

  const driversWithCost = activeDrivers.map(driver => {
    const distanceToWarehouse = calculateDistance(
      driver.currentLocation.lat,
      driver.currentLocation.lng,
      WAREHOUSE_LOCATION.lat,
      WAREHOUSE_LOCATION.lng
    );

    // 'available' drivers have a workload of 0, so their penalty is 0.
    const workloadPenalty = driver.workload * WORKLOAD_PENALTY_FACTOR_KM;
    
    const cost = distanceToWarehouse + workloadPenalty;

    return { ...driver, cost };
  });

  // Sort drivers by cost in ascending order. The driver with the lowest cost is the best option.
  const bestDriverWithCost = driversWithCost.sort((a, b) => a.cost - b.cost)[0];
  
  // Return the original driver object without the temporary 'cost' property.
  return drivers.find(d => d.id === bestDriverWithCost.id) || null;
}