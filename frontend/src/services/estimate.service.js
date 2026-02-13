import api from './api';

export const estimateService = {
  // Get all estimates with pagination
  getEstimates: async (page = 1, limit = 10, status = '') => {
    try {
      let url = `/estimates?page=${page}&limit=${limit}`;
      if (status) url += `&status=${status}`;
      
      console.log('Fetching estimates from:', url);
      const response = await api.get(url);
      console.log('Estimates response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getEstimates:', error.response?.data || error.message);
      throw error;
    }
  },

  // Create estimate from project
  createEstimate: async (projectId, notes = '', status = 'Draft') => {
    try {
      console.log('Creating estimate with:', { projectId, notes, status });
      const response = await api.post('/estimates', { 
        projectId, 
        notes, 
        status 
      });
      console.log('Create estimate response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in createEstimate:', error.response?.data || error.message);
      throw error;
    }
  },

  // Export estimate as PDF
  exportPDF: async (id) => {
    try {
      console.log('Exporting PDF for estimate:', id);
      const response = await api.get(`/estimates/${id}/export/pdf`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `estimate-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF downloaded successfully!');
      return response.data;
    } catch (error) {
      console.error('Error in exportPDF:', error.response?.data || error.message);
      toast.error('Failed to export PDF');
      throw error;
    }
  },

  // Export estimate as CSV
  exportCSV: async (id) => {
    try {
      console.log('Exporting CSV for estimate:', id);
      const response = await api.get(`/estimates/${id}/export/csv`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `estimate-${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('CSV downloaded successfully!');
      return response.data;
    } catch (error) {
      console.error('Error in exportCSV:', error.response?.data || error.message);
      toast.error('Failed to export CSV');
      throw error;
    }
  },

  // Delete estimate
  deleteEstimate: async (id) => {
    try {
      console.log('Deleting estimate:', id);
      const response = await api.delete(`/estimates/${id}`);
      console.log('Delete response:', response.data);
      toast.success('Estimate deleted successfully!');
      return response.data;
    } catch (error) {
      console.error('Error in deleteEstimate:', error.response?.data || error.message);
      toast.error('Failed to delete estimate');
      throw error;
    }
  },

  // Get estimate statistics
  getEstimateStats: async () => {
    try {
      const response = await api.get('/estimates/stats/summary');
      return response.data;
    } catch (error) {
      console.error('Error in getEstimateStats:', error.response?.data || error.message);
      throw error;
    }
  }
};