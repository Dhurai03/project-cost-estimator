import api from './api';

export const projectService = {
  // Get all projects with pagination
  getProjects: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/projects?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error in getProjects:', error.response?.data || error.message);
      throw error;
    }
  },

  // Create new project
  createProject: async (projectData) => {
    try {
      const response = await api.post('/projects', projectData);
      return response.data;
    } catch (error) {
      console.error('Error in createProject:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get project statistics - CRITICAL FOR DASHBOARD
  getProjectStats: async () => {
    try {
      console.log('📊 Fetching project stats from API...');
      const response = await api.get('/projects/stats/summary');
      console.log('📊 Project stats response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getProjectStats:', error.response?.data || error.message);
      throw error;
    }
  }
};