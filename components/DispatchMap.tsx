import React, { useEffect, useRef } from 'react';

interface Location { lat: number; lng: number; }
interface DispatchMapProps {
  warehouse: Location;
  destination: Location;
  driver: Location;
}

const DispatchMap: React.FC<DispatchMapProps> = ({ warehouse, destination, driver }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const routingControlRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const fallbackPolylineRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    // Initialize map
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, { zoomControl: false });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
      }).addTo(mapInstance.current);
      L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);
      markersLayerRef.current = L.layerGroup().addTo(mapInstance.current);
    }

    // Cleanup previous layers from previous renders
    if (routingControlRef.current) {
      mapInstance.current.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }
    if (fallbackPolylineRef.current) {
        mapInstance.current.removeLayer(fallbackPolylineRef.current);
        fallbackPolylineRef.current = null;
    }
    markersLayerRef.current.clearLayers();

    // Create custom icons
    const createIcon = (svg: string) => L.divIcon({
      html: svg, className: 'bg-transparent border-0', iconSize: [32, 32], iconAnchor: [16, 32]
    });

    const warehouseIcon = createIcon(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-sky-400"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6M9 11.25h6M9 15.75h6" /></svg>`);
    const driverIcon = createIcon(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-amber-400"><path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`);
    const destinationIcon = createIcon(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-teal-400"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>`);

    // Add markers to the map regardless of routing success
    const driverMarker = L.marker([driver.lat, driver.lng], { icon: driverIcon }).bindPopup('Suggested Driver');
    const warehouseMarker = L.marker([warehouse.lat, warehouse.lng], { icon: warehouseIcon }).bindPopup('Pickup Point');
    const destinationMarker = L.marker([destination.lat, destination.lng], { icon: destinationIcon }).bindPopup('Destination');
    
    markersLayerRef.current.addLayer(driverMarker);
    markersLayerRef.current.addLayer(warehouseMarker);
    markersLayerRef.current.addLayer(destinationMarker);
    
    if (!L.Routing) {
        console.error("Leaflet Routing Machine is not loaded.");
        return;
    }
    
    // Attempt to create route
    routingControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(driver.lat, driver.lng),
        L.latLng(warehouse.lat, warehouse.lng),
        L.latLng(destination.lat, destination.lng)
      ],
      routeWhileDragging: false,
      show: false,
      addWaypoints: false,
      createMarker: () => false, // We handle markers separately now
      lineOptions: {
        styles: [{ color: '#14b8a6', opacity: 0.8, weight: 6 }],
        extendToWaypoints: true,
        missingRouteTolerance: 100
      }
    }).on('routesfound', (e) => {
        mapInstance.current.fitBounds(e.routes[0].bounds, { padding: [50, 50] });
    }).on('routingerror', () => {
        console.warn("Routing service failed. Displaying fallback straight lines.");
        // Fallback to drawing straight lines
        fallbackPolylineRef.current = L.polyline([
            [driver.lat, driver.lng],
            [warehouse.lat, warehouse.lng],
            [destination.lat, destination.lng],
        ], { color: '#ef4444', weight: 4, opacity: 0.7, dashArray: '10, 10' }).addTo(mapInstance.current);
        
        // Fit bounds to markers
        const bounds = L.latLngBounds([
            [driver.lat, driver.lng],
            [warehouse.lat, warehouse.lng],
            [destination.lat, destination.lng]
        ]);
        mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
    }).addTo(mapInstance.current);

  }, [warehouse, destination, driver]);

  // Increased height for better visibility of the multi-point route
  return <div ref={mapRef} style={{ height: '400px', width: '100%', borderRadius: '0.75rem', backgroundColor: '#1e2b3b' }} />;
};

export default DispatchMap;
