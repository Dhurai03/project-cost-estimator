import { useState, useEffect, useCallback } from 'react';
import { projectService } from '../services/project.service';
import toast from 'react-hot-toast';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [stats, setStats] = useState(null);

  const fetchProjects = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      console.log(`📁 Fetching projects - Page: ${page}`);
      const response = await projectService.getProjects(page);
      console.log('📁 Projects fetched:', response.data?.length || 0);
      setProjects(response.data || []);
      setPagination(response.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      });
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      console.log('📁 Fetching project stats...');
      const response = await projectService.getProjectStats();
      console.log('📁 Stats fetched:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch project stats:', error);
    }
  }, []);

  const createProject = async (projectData) => {
    try {
      console.log('📝 Creating project:', projectData.name);
      const response = await projectService.createProject(projectData);
      console.log('✅ Project created:', response.data);
      
      toast.success('Project created successfully!');
      
      // Force refresh data immediately
      await Promise.all([
        fetchProjects(pagination.page),
        fetchStats()
      ]);
      
      return response.data;
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error(error.response?.data?.message || 'Failed to create project');
      throw error;
    }
  };

  const deleteProject = async (id) => {
    try {
      console.log('🗑️ Deleting project:', id);
      await projectService.deleteProject(id);
      toast.success('Project deleted successfully!');
      
      // Force refresh data immediately
      await Promise.all([
        fetchProjects(pagination.page),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error(error.response?.data?.message || 'Failed to delete project');
      throw error;
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, [fetchProjects, fetchStats]);

  return {
    projects,
    loading,
    pagination,
    stats,
    fetchProjects,
    createProject,
    deleteProject,
    fetchStats
  };
};