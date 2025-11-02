import React, { useEffect, useRef } from 'react';
import { DeliveryData } from '../types';

interface MapProps {
  data: DeliveryData[];
}

const CLUSTER_COLORS = ['#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899'];

const Map: React.FC<MapProps> = ({ data }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null); // To hold Leaflet map instance
  const markersLayer = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const L = (window as any).L;
    if (!L) {
      console.error("Leaflet is not loaded");
      return;
    }

    if (mapRef.current && !mapInstance.current) {
      const initialCoords: [number, number] = [5.4164, 100.3327]; // Centered on Penang
      mapInstance.current = L.map(mapRef.current).setView(initialCoords, 11);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapInstance.current);

      markersLayer.current = L.layerGroup().addTo(mapInstance.current);
    }
    
    if (mapInstance.current && markersLayer.current && data.length > 0) {
        // Clear existing markers
        markersLayer.current.clearLayers();

        const newMarkers = data.map(item => {
            const color = item.cluster !== undefined ? CLUSTER_COLORS[item.cluster % CLUSTER_COLORS.length] : '#94a3b8';
            const markerHtml = `<div style="background-color: ${color}; width: 1rem; height: 1rem; border-radius: 50%; border: 2px solid white;"></div>`;
            
            const customIcon = L.divIcon({
              html: markerHtml,
              className: 'custom-map-marker',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            });

            const marker = L.marker([item.lat, item.lng], { icon: customIcon });
            marker.bindPopup(`<b>${item['地址']}</b><br>Quantity: ${item['数量']}<br>Cluster: ${item.cluster}`);
            return marker;
        });
        
        newMarkers.forEach(marker => marker.addTo(markersLayer.current));

        if (newMarkers.length > 0) {
            const group = L.featureGroup(newMarkers);
            mapInstance.current.fitBounds(group.getBounds().pad(0.1));
        }
    }

  }, [data]);

  return <div ref={mapRef} style={{ height: '500px', width: '100%', borderRadius: '0.75rem', backgroundColor: '#1e293b' }} />;
};

export default Map;