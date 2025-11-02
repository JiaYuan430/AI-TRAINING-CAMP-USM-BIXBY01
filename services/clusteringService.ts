import { DeliveryData } from '../types';

type Point = { lat: number; lng: number };

function calculateDistance(p1: Point, p2: Point): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (p2.lat - p1.lat) * Math.PI / 180;
  const dLng = (p2.lng - p1.lng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function runKMeans(data: DeliveryData[], k: number, maxIterations = 100): DeliveryData[] {
  if (data.length < k) return data;

  // 1. Initialize centroids by picking k random points from the data
  let centroids: Point[] = [];
  const usedIndices = new Set<number>();
  while (centroids.length < k) {
      const randomIndex = Math.floor(Math.random() * data.length);
      if (!usedIndices.has(randomIndex)) {
          centroids.push({ lat: data[randomIndex].lat, lng: data[randomIndex].lng });
          usedIndices.add(randomIndex);
      }
  }

  let assignments: number[] = new Array(data.length);
  let iterations = 0;

  while (iterations < maxIterations) {
    // 2. Assign each point to the closest centroid
    let changed = false;
    for (let i = 0; i < data.length; i++) {
      const point = { lat: data[i].lat, lng: data[i].lng };
      let minDistance = Infinity;
      let closestCentroidIndex = -1;

      for (let j = 0; j < centroids.length; j++) {
        const distance = calculateDistance(point, centroids[j]);
        if (distance < minDistance) {
          minDistance = distance;
          closestCentroidIndex = j;
        }
      }

      if (assignments[i] !== closestCentroidIndex) {
        changed = true;
      }
      assignments[i] = closestCentroidIndex;
    }
    
    // 3. Update centroids to be the mean of the points in their cluster
    const newCentroids: Point[] = [];
    const clusterCounts: number[] = new Array(k).fill(0);
    const clusterSums: Point[] = new Array(k).fill(0).map(() => ({ lat: 0, lng: 0 }));

    for (let i = 0; i < data.length; i++) {
        const clusterIndex = assignments[i];
        clusterCounts[clusterIndex]++;
        clusterSums[clusterIndex].lat += data[i].lat;
        clusterSums[clusterIndex].lng += data[i].lng;
    }

    for (let i = 0; i < k; i++) {
        if (clusterCounts[i] > 0) {
            newCentroids[i] = {
                lat: clusterSums[i].lat / clusterCounts[i],
                lng: clusterSums[i].lng / clusterCounts[i]
            };
        } else {
            // Re-initialize centroid if a cluster becomes empty
            const randomIndex = Math.floor(Math.random() * data.length);
            newCentroids[i] = { lat: data[randomIndex].lat, lng: data[randomIndex].lng };
        }
    }

    centroids = newCentroids;
    
    // 4. If no assignments changed, convergence is reached
    if (!changed) break;
    
    iterations++;
  }

  // Return data with cluster assignments
  return data.map((item, index) => ({ ...item, cluster: assignments[index] }));
}