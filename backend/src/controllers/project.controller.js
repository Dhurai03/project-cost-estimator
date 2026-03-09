// backend/src/controllers/project.controller.js
const Project = require('../models/Project.model');
const { validationResult } = require('express-validator');
const { calculateProjectCost } = require('../services/calculation.service');

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res, next) => {
  try {
    console.log('📝 Creating project with body:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const calculationData = {
      duration: req.body.duration,
      teamSize: req.body.teamSize,
      laborCostPerHour: req.body.laborCostPerHour,
      materialCost: req.body.materialCost,
      equipmentCost: req.body.equipmentCost,
      miscExpenses: req.body.miscExpenses,
      complexityLevel: req.body.complexityLevel,
      projectType: req.body.projectType
    };

    const costBreakdown = calculateProjectCost(calculationData);
    
    const project = await Project.create({
      name: req.body.name,
      duration: req.body.duration,
      projectType: req.body.projectType,
      teamSize: req.body.teamSize,
      complexityLevel: req.body.complexityLevel,
      laborCostPerHour: req.body.laborCostPerHour,
      materialCost: req.body.materialCost,
      equipmentCost: req.body.equipmentCost,
      miscExpenses: req.body.miscExpenses,
      user: req.user.userId,
      ...costBreakdown
    });

    console.log('✅ Project created:', project._id);
    console.log('✅ Calculated costs:', costBreakdown);

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('❌ Create project error:', error);
    next(error);
  }
};

// @desc    Get all projects for user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const projects = await Project.find({ user: req.user.userId })
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Project.countDocuments({ user: req.user.userId });

    res.status(200).json({
      success: true,
      data: projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Get projects error:', error);
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('❌ Get project error:', error);
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res, next) => {
  try {
    const costFields = ['laborCostPerHour', 'materialCost', 'equipmentCost', 'miscExpenses', 'duration', 'teamSize'];
    const shouldRecalculate = costFields.some(field => req.body[field] !== undefined);

    let updateData = { ...req.body };
    
    if (shouldRecalculate) {
      const projectData = {
        ...req.body,
        duration: req.body.duration,
        teamSize: req.body.teamSize,
        laborCostPerHour: req.body.laborCostPerHour,
        materialCost: req.body.materialCost,
        equipmentCost: req.body.equipmentCost,
        miscExpenses: req.body.miscExpenses
      };
      
      const costBreakdown = calculateProjectCost(projectData);
      updateData = { ...updateData, ...costBreakdown };
    }

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('❌ Update project error:', error);
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete project error:', error);
    next(error);
  }
};

// @desc    Get project statistics
// @route   GET /api/projects/stats/summary
// @access  Private
const getProjectStats = async (req, res, next) => {
  try {
    const stats = await Project.aggregate([
      { $match: { user: req.user.userId } },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          averageCost: { $avg: '$totalCost' },
          totalCost: { $sum: '$totalCost' },
          averageTeamSize: { $avg: '$teamSize' }
        }
      }
    ]);

    const projectsByType = await Project.aggregate([
      { $match: { user: req.user.userId } },
      {
        $group: {
          _id: '$projectType',
          count: { $sum: 1 },
          totalCost: { $sum: '$totalCost' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: stats[0] || { totalProjects: 0, averageCost: 0, totalCost: 0, averageTeamSize: 0 },
        byType: projectsByType
      }
    });
  } catch (error) {
    console.error('❌ Get project stats error:', error);
    next(error);
  }
};

// ✅ EXPORT ALL FUNCTIONS using exports
exports.createProject = createProject;
exports.getProjects = getProjects;
exports.getProject = getProject;
exports.updateProject = updateProject;
exports.deleteProject = deleteProject;
exports.getProjectStats = getProjectStats;