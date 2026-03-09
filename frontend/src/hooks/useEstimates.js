import { useState, useEffect, useCallback } from 'react';
import { estimateService } from '../services/estimate.service';
import toast from 'react-hot-toast';

export const useEstimates = () => {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [stats, setStats] = useState({
    summary: {
      totalEstimates: 0,
      totalCost: 0,
      averageCost: 0
    },
    byStatus: []
  });

  const fetchEstimates = useCallback(async (page = 1, status = '') => {
    setLoading(true);
    try {
      const response = await estimateService.getEstimates(page, 10, status);
      if (response.success) {
        setEstimates(response.data || []);
        setPagination(response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch estimates:', error);
      toast.error('Failed to fetch estimates');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await estimateService.getEstimateStats();
      if (response.success && response.data) {
        setStats({
          summary: response.data.summary || {
            totalEstimates: 0,
            totalCost: 0,
            averageCost: 0
          },
          byStatus: response.data.byStatus || []
        });
      }
    } catch (error) {
      console.error('Failed to fetch estimate stats:', error);
    }
  }, []);

  // ✅ THIS FUNCTION MUST EXIST AND BE RETURNED
const createEstimate = useCallback(async (projectId, notes = '') => {
  try {
    console.log('📝 Creating estimate for project:', projectId);
    // The backend expects projectId, notes, and status
    const response = await estimateService.createEstimate(projectId, notes);
    console.log('✅ Estimate created:', response.data);
    
    toast.success('Estimate created successfully!');
    
    await Promise.all([
      fetchEstimates(pagination.page, ''),
      fetchStats()
    ]);
    
    return response.data;
  } catch (error) {
    console.error('Failed to create estimate:', error);
    toast.error(error.response?.data?.message || 'Failed to create estimate');
    throw error;
  }
}, [pagination.page, fetchEstimates, fetchStats]);

  const deleteEstimate = useCallback(async (id) => {
    try {
      await estimateService.deleteEstimate(id);
      toast.success('Estimate deleted successfully!');
      
      await Promise.all([
        fetchEstimates(pagination.page, ''),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Failed to delete estimate:', error);
      toast.error(error.response?.data?.message || 'Failed to delete estimate');
      throw error;
    }
  }, [pagination.page, fetchEstimates, fetchStats]);

  const exportPDF = useCallback(async (id) => {
    try {
      await estimateService.exportPDF(id);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Failed to export PDF:', error);
      toast.error('Failed to export PDF');
    }
  }, []);

  const exportCSV = useCallback(async (id) => {
    try {
      await estimateService.exportCSV(id);
      toast.success('CSV downloaded successfully!');
    } catch (error) {
      console.error('Failed to export CSV:', error);
      toast.error('Failed to export CSV');
    }
  }, []);

  useEffect(() => {
    fetchEstimates();
    fetchStats();
  }, [fetchEstimates, fetchStats]);

  // ✅ MAKE SURE ALL FUNCTIONS ARE RETURNED
  return {
    estimates,
    loading,
    pagination,
    stats,
    fetchEstimates,
    createEstimate,    // ← THIS MUST BE HERE
    deleteEstimate,
    exportPDF,
    exportCSV,
    fetchStats
  };
};