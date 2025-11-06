import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ServiceStatusCard from './components/ServiceStatusCard';
import LoadingSpinner from './components/LoadingSpinner';
import Footer from './components/Footer';
import { fetchServiceStatuses } from './services/geminiService';
import type { ServiceStatus } from './types';
import { ServiceStatusEnum } from './types';
import { CLOUD_SERVICES } from './constants';

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

const App: React.FC = () => {
  const [statuses, setStatuses] = useState<ServiceStatus[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [expandedCardName, setExpandedCardName] = useState<string | null>(null);

  const handleToggleExpand = (serviceName: string) => {
    setExpandedCardName(prev => (prev === serviceName ? null : serviceName));
  };

  const getInitialStatuses = () => {
    return CLOUD_SERVICES.map(name => ({
      name,
      status: ServiceStatusEnum.UNKNOWN,
      summary: 'Awaiting first check...',
    }));
  };
  
  const updateStatuses = useCallback(async () => {
    // On manual refresh, don't clear the screen, just show loading indicators.
    if (!isLoading) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const fetchedStatuses = await fetchServiceStatuses(CLOUD_SERVICES);
      
      // Create a map for quick lookups
      const fetchedMap = new Map(fetchedStatuses.map(s => [s.name, s]));
      
      // Update existing or add new, preserving order of CLOUD_SERVICES
      const updated = CLOUD_SERVICES.map(name => 
        fetchedMap.get(name) || {
          name,
          status: ServiceStatusEnum.UNKNOWN,
          summary: `Could not retrieve status for ${name}.`,
        }
      );

      setStatuses(updated);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError('Failed to fetch service statuses from the AI. The API may be unavailable or the response was invalid.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    setStatuses(getInitialStatuses());
    updateStatuses();
    const intervalId = setInterval(updateStatuses, REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-black/60 text-text-light font-sans">
      <Header 
        lastUpdated={lastUpdated} 
        onRefresh={updateStatuses}
        isRefreshing={isLoading}
      />
      <main className="flex-grow w-full p-4 sm:p-6 md:p-8">
        {error && (
          <div className="bg-red-900/80 border border-red-500 text-red-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {isLoading && statuses.length === 0 && (
           <div className="flex justify-center items-center h-64">
             <LoadingSpinner />
           </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {statuses.map((service) => (
            <ServiceStatusCard 
              key={service.name} 
              service={service}
              isExpanded={expandedCardName === service.name}
              onToggleExpand={() => handleToggleExpand(service.name)}
            />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;