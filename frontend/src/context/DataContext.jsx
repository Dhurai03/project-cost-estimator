import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useEstimates } from '../hooks/useEstimates';

const DataContext = createContext({});

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimeoutRef = useRef(null);
  
  // Initialize hooks
  const projects = useProjects();
  const estimates = useEstimates();

  const refreshAllData = useCallback(async () => {
    // Prevent multiple simultaneous refreshes
    if (isRefreshing) {
      console.log('⏳ Refresh already in progress, skipping...');
      return;
    }

    setIsRefreshing(true);
    console.log('🔄 Refreshing all dashboard data...');
    
    try {
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
    } finally {
      setIsRefreshing(false);
    }
  }, [projects, estimates, isRefreshing]);

  // Auto-refresh every 30 seconds - but with cleanup
  useEffect(() => {
    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const interval = setInterval(() => {
      refreshAllData();
    }, 30000); // 30 seconds
    
    return () => {
      clearInterval(interval);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [refreshAllData]);

  const value = {
    ...projects,
    ...estimates,
    refreshAllData,
    lastUpdated,
    isRefreshing,
    projectsStats: projects.stats,
    estimatesStats: estimates.stats
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};