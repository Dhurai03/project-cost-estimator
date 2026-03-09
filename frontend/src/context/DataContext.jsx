import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useProjects } from '../hooks/useProjects';
import { useEstimates } from '../hooks/useEstimates';

const DataContext = createContext({});

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef(null);

  const projects = useProjects();
  const estimates = useEstimates();

  const refreshAllData = useCallback(async () => {
    if (isRefreshing || !user) return;

    setIsRefreshing(true);
    try {
      await Promise.allSettled([
        projects.fetchStats(),
        estimates.fetchStats(),
        projects.fetchProjects(projects.pagination?.page || 1),
        estimates.fetchEstimates(estimates.pagination?.page || 1, '')
      ]);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [projects, estimates, isRefreshing, user]);

  // Only start auto-refresh when user is authenticated
  useEffect(() => {
    if (authLoading || !user) {
      // Clear any existing interval when not authenticated
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial load
    refreshAllData();

    // Auto-refresh every 30 seconds
    intervalRef.current = setInterval(refreshAllData, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user, authLoading]); // Only re-run when auth state changes

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