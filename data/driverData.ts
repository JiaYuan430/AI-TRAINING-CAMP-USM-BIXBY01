import { Driver } from '../types';

export const WAREHOUSE_LOCATION = { lat: 5.336, lng: 100.276 }; // Central warehouse location at Sierra Vista, Bukit Jambul

export const drivers: Driver[] = [
    { id: 1, name: 'Ahmad', status: 'available', currentLocation: { lat: 5.416, lng: 100.332 }, workload: 0 },
    { id: 2, name: 'Boon', status: 'available', currentLocation: { lat: 5.355, lng: 100.297 }, workload: 0 },
    { id: 3, name: 'Chandra', status: 'on-delivery', currentLocation: { lat: 5.462, lng: 100.310 }, workload: 2 },
    { id: 4, name: 'David', status: 'available', currentLocation: { lat: 5.333, lng: 100.291 }, workload: 0 },
    { id: 5, name: 'Eliza', status: 'on-delivery', currentLocation: { lat: 5.388, lng: 100.315 }, workload: 3 },
    { id: 6, name: 'Farah', status: 'offline', currentLocation: { lat: 5.438, lng: 100.310 }, workload: 0 },
];