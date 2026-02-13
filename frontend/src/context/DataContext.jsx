import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useEstimates } from '../hooks/useEstimates';

const DataContext = createContext({});

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshCounter, setRefreshCounter] = useState(0); // Add counter to force refresh
  
  // Initialize hooks
  const projects = useProjects();
  const estimates = useEstimates();

  const refreshAllData = useCallback(async () => {
    console.log('🔄 Refreshing all dashboard data...');
    try {
      // Increment counter to force re-fetch
      setRefreshCounter(prev => prev + 1);
      
      // Fetch all data in parallel
      await Promise.all([
        projects.fetchStats(),
        estimates.fetchStats(),
        projects.fetchProjects(projects.pagination?.page || 1),
        estimates.fetchEstimates(estimates.pagination?.page || 1, '')
      ]);
      
      setLastUpdated(new Date());
      console.log('✅ Dashboard data refreshed at:', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('❌ Failed to refresh data:', error);
    }
  }, [projects, estimates]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAllData();
    }, 10000); // 10 seconds
    
    return () => clearInterval(interval);
  }, [refreshAllData]);

  const value = {
    ...projects,
    ...estimates,
    refreshAllData,
    lastUpdated,
    refreshCounter,
    projectsStats: projects.stats,
    estimatesStats: estimates.stats
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};