import React, { useEffect, useRef, useState } from 'react';
import { Driver } from '../types';
import { UserCircleIcon } from './Icons';
import DriverDetailsModal from './DriverDetailsModal';
import { driverHistoryData } from '../data/driverHistory';


interface DriverManagementProps {
    drivers: Driver[];
    pendingOrder: { features: any, predictedTime: number } | null;
    onAssign: (driverId: number) => void;
    onUpdateStatus: (driverId: number, status: Driver['status']) => void;
}

const statusStyles: { [key in Driver['status']]: { bg: string, text: string } } = {
  available: { bg: 'bg-green-500/20', text: 'text-green-400' },
  'on-delivery': { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  offline: { bg: 'bg-slate-500/20', text: 'text-slate-400' }
};

const DriverManagement: React.FC<DriverManagementProps> = ({ drivers, pendingOrder, onAssign, onUpdateStatus }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markersRef = useRef<{[key: number]: any}>({});
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

    const handleDriverClick = (driver: Driver) => {
        setSelectedDriver(driver);
    };

    const handleCloseModal = () => {
        setSelectedDriver(null);
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const L = (window as any).L;
        if (!L || !mapRef.current) return;

        if (!mapInstance.current) {
            mapInstance.current = L.map(mapRef.current).setView([5.38, 100.29], 11); // Center on Penang
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; CARTO',
            }).addTo(mapInstance.current);
        }

        const iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-amber-400"><path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`;
        const driverIcon = L.divIcon({
            html: iconHtml,
            className: 'bg-transparent border-0',
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        });
        
        // Update markers based on driver status and location
        drivers.forEach(driver => {
            const marker = markersRef.current[driver.id];
            if (driver.status === 'offline') {
                if(marker) {
                    marker.remove();
                    delete markersRef.current[driver.id];
                }
            } else {
                 if (marker) {
                    // Animate marker movement
                    marker.setLatLng([driver.currentLocation.lat, driver.currentLocation.lng]);
                 } else {
                    const newMarker = L.marker([driver.currentLocation.lat, driver.currentLocation.lng], { icon: driverIcon });
                    newMarker.bindPopup(`<b>${driver.name}</b><br>Workload: ${driver.workload}`);
                    newMarker.addTo(mapInstance.current);
                    markersRef.current[driver.id] = newMarker;
                 }
            }
        });
        
    }, [drivers]);


    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 flex flex-col gap-6">
                    {pendingOrder && (
                        <div className="bg-background-secondary p-6 rounded-xl shadow-lg border border-brand-primary animate-pulse">
                            <h3 className="text-lg font-bold text-brand-primary mb-2">Pending Assignment</h3>
                            <p className="text-text-secondary">Address: <span className="text-text-primary font-medium">{pendingOrder.features['地址']}</span></p>
                            <p className="text-text-secondary">Predicted Time: <span className="text-text-primary font-medium">{pendingOrder.predictedTime.toFixed(1)} min</span></p>
                        </div>
                    )}

                    <div className="bg-background-secondary p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold mb-4 text-brand-primary">Driver Roster</h2>
                        <div className="space-y-3">
                            {drivers.map(driver => (
                                <div key={driver.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                                    <div className="flex items-center">
                                        <UserCircleIcon className="h-10 w-10 text-text-secondary"/>
                                        <div className="ml-3">
                                            <p onClick={() => handleDriverClick(driver)} className="font-semibold text-text-primary cursor-pointer hover:text-brand-primary transition-colors">{driver.name}</p>
                                            <p className="text-sm capitalize text-text-secondary">Workload: {driver.workload} orders</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={driver.status}
                                            onChange={(e) => onUpdateStatus(driver.id, e.target.value as Driver['status'])}
                                            className={`capitalize text-xs font-medium border-none rounded-md appearance-none text-center outline-none focus:ring-2 focus:ring-brand-primary ${statusStyles[driver.status].bg} ${statusStyles[driver.status].text}`}
                                        >
                                            <option value="available">Available</option>
                                            <option value="on-delivery">On-Delivery</option>
                                            <option value="offline">Offline</option>
                                        </select>
                                        {pendingOrder && driver.status === 'available' && (
                                            <button onClick={() => onAssign(driver.id)} className="px-3 py-1 text-xs font-medium text-white bg-brand-primary rounded-md hover:bg-brand-secondary transition-colors">
                                                Assign
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-background-secondary p-6 rounded-xl shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-2xl font-bold text-brand-primary">Driver Locations</h2>
                        <div className="flex items-center text-xs text-green-400">
                        <span className="relative flex h-2 w-2 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Live Tracking
                        </div>
                    </div>
                    <div ref={mapRef} style={{ height: '500px', width: '100%', borderRadius: '0.75rem', backgroundColor: '#1e2b3b' }} />
                </div>
            </div>
            {selectedDriver && (
                <DriverDetailsModal 
                    driver={selectedDriver}
                    history={driverHistoryData[selectedDriver.id]?.history || []}
                    metrics={driverHistoryData[selectedDriver.id]?.metrics || { completionRate: 0, avgDeliveryTime: 0, totalDeliveries: 0 }}
                    pendingOrder={pendingOrder}
                    onClose={handleCloseModal}
                />
            )}
        </>
    );
};

export default DriverManagement;
