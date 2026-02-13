import { createContext, useContext, useState, useCallback } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useEstimates } from '../hooks/useEstimates';

const DataContext = createContext({});

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Initialize hooks
  const projects = useProjects();
  const estimates = useEstimates();

  const refreshAllData = useCallback(async () => {
    console.log('🔄 Refreshing all dashboard data...');
    try {
      await Promise.all([
        projects.fetchStats(),
        estimates.fetchStats(),
        projects.fetchProjects(projects.pagination.page),
        estimates.fetchEstimates(estimates.pagination.page)
      ]);
      setLastUpdated(new Date());
      console.log('✅ Dashboard data refreshed');
    } catch (error) {
      console.error('❌ Failed to refresh data:', error);
    }
  }, [projects, estimates]);

  const value = {
    ...projects,
    ...estimates,
    refreshAllData,
    lastUpdated,
    projectsStats: projects.stats,
    estimatesStats: estimates.stats
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};