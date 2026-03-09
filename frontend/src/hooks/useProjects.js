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
  const [stats, setStats] = useState({
    summary: {
      totalProjects: 0,
      totalCost: 0,
      averageCost: 0,
      averageTeamSize: 0
    },
    byType: []
  });

  const fetchProjects = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await projectService.getProjects(page);
      if (response.success) {
        setProjects(response.data || []);
        setPagination(response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await projectService.getProjectStats();
      if (response.success && response.data) {
        setStats({
          summary: response.data.summary || {
            totalProjects: 0,
            totalCost: 0,
            averageCost: 0,
            averageTeamSize: 0
          },
          byType: response.data.byType || []
        });
      }
    } catch (error) {
      console.error('Failed to fetch project stats:', error);
    }
  }, []);

  // ✅ THIS FUNCTION MUST EXIST AND BE RETURNED
  const createProject = useCallback(async (projectData) => {
    try {
      console.log('📝 Creating project:', projectData);
      const response = await projectService.createProject(projectData);
      console.log('✅ Project created:', response.data);
      
      toast.success('Project created successfully!');
      
      // Refresh data after creation
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
  }, [pagination.page, fetchProjects, fetchStats]);

  const deleteProject = useCallback(async (id) => {
    try {
      await projectService.deleteProject(id);
      toast.success('Project deleted successfully!');
      
      await Promise.all([
        fetchProjects(pagination.page),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error(error.response?.data?.message || 'Failed to delete project');
      throw error;
    }
  }, [pagination.page, fetchProjects, fetchStats]);

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, [fetchProjects, fetchStats]);

  // ✅ MAKE SURE ALL FUNCTIONS ARE RETURNED
  return {
    projects,
    loading,
    pagination,
    stats,
    fetchProjects,
    createProject,    // ← THIS MUST BE HERE
    deleteProject,
    fetchStats
  };
};