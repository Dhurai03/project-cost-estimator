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
  const [stats, setStats] = useState(null);

  const fetchEstimates = useCallback(async (page = 1, status = '') => {
    setLoading(true);
    try {
      console.log(`📊 Fetching estimates - Page: ${page}, Status: ${status || 'All'}`);
      const response = await estimateService.getEstimates(page, 10, status);
      console.log('📊 Estimates fetched:', response.data?.length || 0);
      setEstimates(response.data || []);
      setPagination(response.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      });
    } catch (error) {
      console.error('Failed to fetch estimates:', error);
      toast.error('Failed to fetch estimates');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      console.log('📊 Fetching estimate stats...');
      const response = await estimateService.getEstimateStats();
      console.log('📊 Stats fetched:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch estimate stats:', error);
    }
  }, []);

  const createEstimate = async (projectId, notes = '') => {
    try {
      console.log('📝 Creating estimate for project:', projectId);
      const response = await estimateService.createEstimate(projectId, notes);
      console.log('✅ Estimate created:', response.data);
      
      toast.success('Estimate created successfully!');
      
      // Force refresh data immediately
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
  };

  const deleteEstimate = async (id) => {
    try {
      console.log('🗑️ Deleting estimate:', id);
      await estimateService.deleteEstimate(id);
      toast.success('Estimate deleted successfully!');
      
      // Force refresh data immediately
      await Promise.all([
        fetchEstimates(pagination.page, ''),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Failed to delete estimate:', error);
      toast.error(error.response?.data?.message || 'Failed to delete estimate');
      throw error;
    }
  };

  const exportPDF = async (id) => {
    try {
      await estimateService.exportPDF(id);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Failed to export PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  const exportCSV = async (id) => {
    try {
      await estimateService.exportCSV(id);
      toast.success('CSV downloaded successfully!');
    } catch (error) {
      console.error('Failed to export CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchEstimates();
    fetchStats();
  }, [fetchEstimates, fetchStats]);

  return {
    estimates,
    loading,
    pagination,
    stats,
    fetchEstimates,
    createEstimate,
    deleteEstimate,
    exportPDF,
    exportCSV,
    fetchStats
  };
};