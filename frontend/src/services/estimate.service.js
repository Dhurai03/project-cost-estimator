import api from './api';

export const estimateService = {
  // Get all estimates with pagination
  getEstimates: async (page = 1, limit = 10, status = '') => {
    try {
      let url = `/estimates?page=${page}&limit=${limit}`;
      if (status) url += `&status=${status}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error in getEstimates:', error.response?.data || error.message);
      throw error;
    }
  },

  // Create estimate from project
  createEstimate: async (projectId, notes = '', status = 'Draft') => {
    try {
      const response = await api.post('/estimates', { 
        projectId, 
        notes, 
        status 
      });
      return response.data;
    } catch (error) {
      console.error('Error in createEstimate:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get estimate statistics - CRITICAL FOR DASHBOARD
  getEstimateStats: async () => {
    try {
      console.log('📊 Fetching estimate stats from API...');
      const response = await api.get('/estimates/stats/summary');
      console.log('📊 Estimate stats response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getEstimateStats:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete estimate
  deleteEstimate: async (id) => {
    try {
      const response = await api.delete(`/estimates/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in deleteEstimate:', error.response?.data || error.message);
      throw error;
    }
  },

  // Export estimate as PDF
  exportPDF: async (id) => {
    try {
      const response = await api.get(`/estimates/${id}/export/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `estimate-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response.data;
    } catch (error) {
      console.error('Error in exportPDF:', error.response?.data || error.message);
      throw error;
    }
  },

  // Export estimate as CSV
  exportCSV: async (id) => {
    try {
      const response = await api.get(`/estimates/${id}/export/csv`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `estimate-${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response.data;
    } catch (error) {
      console.error('Error in exportCSV:', error.response?.data || error.message);
      throw error;
    }
  }
};