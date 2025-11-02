import { DeliveryHistoryItem, PerformanceMetrics } from '../types';

interface DriverHistory {
  [driverId: number]: {
    history: DeliveryHistoryItem[];
    metrics: PerformanceMetrics;
  }
}

export const driverHistoryData: DriverHistory = {
  1: {
    history: [
      { id: 'd1h1', address: 'Quayside Penang', date: '2024-07-20', timeTaken: 85 },
      { id: 'd1h2', address: 'The View Condominium', date: '2024-07-20', timeTaken: 40 },
      { id: 'd1h3', address: 'Summerton', date: '2024-07-19', timeTaken: 62 },
    ],
    metrics: { completionRate: 98, avgDeliveryTime: 62.3, totalDeliveries: 154 },
  },
  2: {
    history: [
        { id: 'd2h1', address: 'N-Park Condominium', date: '2024-07-21', timeTaken: 70 },
        { id: 'd2h2', address: 'City of Dreams', date: '2024-07-21', timeTaken: 35 },
    ],
    metrics: { completionRate: 99, avgDeliveryTime: 55.1, totalDeliveries: 210 },
  },
  3: { 
    history: [
      { id: 'd3h1', address: 'Tropicana Bay Residences', date: '2024-07-22', timeTaken: 60 },
    ],
    metrics: { completionRate: 95, avgDeliveryTime: 71.4, totalDeliveries: 189 } 
  },
  4: { 
    history: [
      { id: 'd4h1', address: 'Artes', date: '2024-07-22', timeTaken: 92 },
      { id: 'd4h2', address: 'Starhill', date: '2024-07-21', timeTaken: 31 },
    ],
    metrics: { completionRate: 100, avgDeliveryTime: 58.9, totalDeliveries: 98 } 
  },
  5: { 
    history: [], 
    metrics: { completionRate: 96, avgDeliveryTime: 65.0, totalDeliveries: 251 } 
  },
  6: { 
    history: [], 
    metrics: { completionRate: 0, avgDeliveryTime: 0, totalDeliveries: 0 } 
  },
};
