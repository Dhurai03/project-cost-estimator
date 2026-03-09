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

  // ✅ THIS MUST EXIST
  createProject: async (projectData) => {
    try {
      const response = await api.post('/projects', projectData);
      return response.data;
    } catch (error) {
      console.error('Error in createProject:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get project statistics
  getProjectStats: async () => {
    try {
      const response = await api.get('/projects/stats/summary');
      return response.data;
    } catch (error) {
      console.error('Error in getProjectStats:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete project
  deleteProject: async (id) => {
    try {
      const response = await api.delete(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in deleteProject:', error.response?.data || error.message);
      throw error;
    }
  }
};