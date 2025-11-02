import React, { useState, useCallback, useEffect } from 'react';
import { DeliveryData, PredictionFeatures, Driver } from './types';
import { deliveryData, deliveryDataCSV } from './data/deliveryData';
import { drivers as initialDrivers, WAREHOUSE_LOCATION } from './data/driverData';
import { predictDeliveryTime } from './services/geminiService';
import { findOptimalDriver } from './services/driverService';
import { runKMeans } from './services/clusteringService';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import PredictionForm from './components/PredictionForm';
import PredictionResult from './components/PredictionResult';
import DataVisualizations from './components/DataVisualizations';
import Map from './components/Map';
import DriverSuggestion from './components/DriverSuggestion';
import DispatchMap from './components/DispatchMap';
import DriverManagement from './components/DriverManagement';
import { InfoIcon, LoaderIcon, TruckIcon, ChartPieIcon, UsersIcon } from './components/Icons';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dispatch' | 'analytics' | 'drivers'>('dispatch');
  const [selectedAddressData, setSelectedAddressData] = useState<PredictionFeatures | null>(null);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedDriver, setSuggestedDriver] = useState<Driver | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{lat: number, lng: number} | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [clusteredData, setClusteredData] = useState<DeliveryData[]>([]);
  const [pendingOrder, setPendingOrder] = useState<{features: PredictionFeatures, predictedTime: number} | null>(null);

  useEffect(() => {
    // Run clustering on initial data load for the analytics map
    const dataWithClusters = runKMeans(deliveryData, 6); // Group into 6 clusters
    setClusteredData(dataWithClusters);
  }, []);

  // Simulate real-time driver location tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setDrivers(prevDrivers => 
        prevDrivers.map(driver => {
          // Only move drivers who are 'on-delivery'
          if (driver.status === 'on-delivery') {
            const latMovement = (Math.random() - 0.5) * 0.005; // Simulate small movement
            const lngMovement = (Math.random() - 0.5) * 0.005;
            return {
              ...driver,
              currentLocation: {
                lat: driver.currentLocation.lat + latMovement,
                lng: driver.currentLocation.lng + lngMovement,
              },
            };
          }
          return driver;
        })
      );
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  const handleAddressSelect = useCallback((address: DeliveryData) => {
    const { Delivery_time_min, cluster, ...features } = address;
    setSelectedAddressData(features);
    setPrediction(null);
    setError(null);
    setSuggestedDriver(null);
    setPendingOrder(null);
    setDestinationCoords({ lat: address.lat, lng: address.lng });
  }, []);

  const handlePrediction = useCallback(async (features: PredictionFeatures, coords?: {lat: number, lng: number}) => {
    setIsLoading(true);
    setError(null);
    setPrediction(null);
    setSuggestedDriver(null);
    setPendingOrder(null);
    
    const currentDestination = coords || destinationCoords;

    try {
      const predictedTime = await predictDeliveryTime(features, deliveryDataCSV);
      setPrediction(predictedTime);

      if (currentDestination) {
          setDestinationCoords(currentDestination);
          const bestDriver = findOptimalDriver(drivers);
          setSuggestedDriver(bestDriver);
          setPendingOrder({ features, predictedTime });
      } else {
        setError("Please provide coordinates for new addresses to get driver suggestions.");
      }
    } catch (e) {
      setError('Failed to get prediction. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [destinationCoords, drivers]);

  const handleFormClear = useCallback(() => {
    setSelectedAddressData(null);
    setPrediction(null);
    setError(null);
    setSuggestedDriver(null);
    setDestinationCoords(null);
    setPendingOrder(null);
  }, []);

  const handleAssignDriver = (driverId: number) => {
    setDrivers(prevDrivers => 
        prevDrivers.map(driver => {
            if (driver.id === driverId) {
                const newWorkload = driver.workload + 1;
                return { 
                    ...driver, 
                    workload: newWorkload, 
                    status: 'on-delivery' // Always set to on-delivery when assigned
                };
            }
            return driver;
        })
    );
    setPendingOrder(null);
    alert(`Order assigned to driver!`);
  };
  
  const handleUpdateDriverStatus = (driverId: number, status: Driver['status']) => {
    setDrivers(prevDrivers => 
        prevDrivers.map(driver => 
            driver.id === driverId ? { ...driver, status: status } : driver
        )
    );
  };

  const renderDispatchCenter = () => (
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-background-secondary p-6 rounded-xl shadow-lg">
                <SearchBar data={deliveryData} onSelect={handleAddressSelect} onClear={handleFormClear} />
            </div>
            
            <div className="bg-background-secondary p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-brand-primary">New Delivery Order</h2>
              <PredictionForm
                initialData={selectedAddressData}
                onSubmit={handlePrediction}
                isLoading={isLoading}
              />
            </div>
            
            {isLoading && (
              <div className="flex items-center justify-center bg-background-secondary p-6 rounded-xl shadow-lg">
                <LoaderIcon className="animate-spin h-8 w-8 text-brand-primary" />
                <span className="ml-4 text-lg text-text-secondary">Generating prediction...</span>
              </div>
            )}
            {error && (
              <div className="flex items-center bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-xl">
                <InfoIcon className="h-6 w-6 mr-3" />
                <span>{error}</span>
              </div>
            )}
            {prediction !== null && <PredictionResult time={prediction} />}
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
            {suggestedDriver && destinationCoords ? (
                <>
                    <DriverSuggestion drivers={drivers} suggestedDriver={suggestedDriver} />
                    <DispatchMap 
                        warehouse={WAREHOUSE_LOCATION}
                        destination={destinationCoords}
                        driver={suggestedDriver.currentLocation}
                    />
                </>
            ) : (
                <div className="bg-background-secondary p-6 rounded-xl shadow-lg h-full flex flex-col justify-center">
                    <div className="text-center">
                        <TruckIcon className="mx-auto h-12 w-12 text-slate-600" />
                        <h2 className="mt-4 text-2xl font-bold text-text-secondary">Dispatch Control</h2>
                        <p className="mt-2 text-slate-400">
                            Predict a delivery time to view driver suggestions and route map here.
                        </p>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
  
  const renderAnalyticsDashboard = () => (
    <div className="flex flex-col gap-6">
        <div className="bg-background-secondary p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-brand-primary">Delivery Location Clusters</h3>
            <Map data={clusteredData} />
        </div>
        <DataVisualizations data={deliveryData} />
    </div>
  );

  const renderDriverManagement = () => (
    <DriverManagement 
        drivers={drivers}
        pendingOrder={pendingOrder}
        onAssign={handleAssignDriver}
        onUpdateStatus={handleUpdateDriverStatus}
    />
  );

  return (
    <div className="min-h-screen bg-background-primary text-text-primary font-sans">
      <Header />
      <main className="container mx-auto p-4 lg:p-6">
        <div className="mb-6">
          <div className="border-b border-slate-700">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('dispatch')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'dispatch'
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-slate-500'
                }`}
              >
                <TruckIcon className="h-5 w-5" />
                <span>Dispatch Center</span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'analytics'
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-slate-500'
                }`}
              >
                <ChartPieIcon className="h-5 w-5" />
                <span>Analytics Dashboard</span>
              </button>
               <button
                onClick={() => setActiveTab('drivers')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'drivers'
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-slate-500'
                }`}
              >
                <UsersIcon className="h-5 w-5" />
                <span>Driver Management</span>
              </button>
            </nav>
          </div>
        </div>
        
        <div>
          {activeTab === 'dispatch' && renderDispatchCenter()}
          {activeTab === 'analytics' && renderAnalyticsDashboard()}
          {activeTab === 'drivers' && renderDriverManagement()}
        </div>
      </main>
    </div>
  );
};

export default App;
