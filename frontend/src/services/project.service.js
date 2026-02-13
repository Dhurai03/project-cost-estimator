import api from './api';

export const projectService = {
  // Get all projects with pagination
  getProjects: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/projects?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single project
  getProject: async (id) => {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new project
  createProject: async (projectData) => {
    try {
      const response = await api.post('/projects', projectData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update project
  updateProject: async (id, projectData) => {
    try {
      const response = await api.put(`/projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete project
  deleteProject: async (id) => {
    try {
      const response = await api.delete(`/projects/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get project statistics
  getProjectStats: async () => {
    try {
      const response = await api.get('/projects/stats/summary');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};