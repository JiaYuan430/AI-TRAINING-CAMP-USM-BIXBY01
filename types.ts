export interface DeliveryData {
  '地址': string;
  '数量': number;
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
  F: number;
  G: number;
  A1: number;
  A2: number;
  A3: number;
  A4: number;
  Distance_km: number;
  Traffic_factor: number;
  Weight_kg: number;
  Delivery_time_min: number;
  lat: number;
  lng: number;
  cluster?: number;
}

export type PredictionFeatures = Omit<DeliveryData, 'Delivery_time_min' | 'lat' | 'lng' | 'cluster'>;

export interface Driver {
  id: number;
  name: string;
  status: 'available' | 'on-delivery' | 'offline';
  currentLocation: {
    lat: number;
    lng: number;
  };
  workload: number;
}

export interface DeliveryHistoryItem {
  id: string;
  address: string;
  date: string;
  timeTaken: number; // in minutes
}

export interface PerformanceMetrics {
  completionRate: number; // as a percentage
  avgDeliveryTime: number; // in minutes
  totalDeliveries: number;
}
