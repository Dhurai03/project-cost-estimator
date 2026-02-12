const Project = require('../models/Project.model');
const { validationResult } = require('express-validator');
const { calculateProjectCost } = require('../services/calculation.service');

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Calculate costs
    const costBreakdown = calculateProjectCost(req.body);
    
    // Create project with calculated costs
    const project = await Project.create({
      ...req.body,
      user: req.user.userId,
      ...costBreakdown
    });

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects for user
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const projects = await Project.find({ user: req.user.userId })
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Project.countDocuments({ user: req.user.userId });

    res.status(200).json({
      success: true,
      data: projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res, next) => {
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
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res, next) => {
  try {
    // Recalculate costs if any cost-related fields are updated
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
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res, next) => {
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
    next(error);
  }
};

// @desc    Get project statistics
// @route   GET /api/projects/stats/summary
// @access  Private
exports.getProjectStats = async (req, res, next) => {
  try {
    const stats = await Project.aggregate([
      { $match: { user: req.user.userId } },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          averageCost: { $avg: '$totalCost' },
          totalCost: { $sum: '$totalCost' },
          averageTeamSize: { $avg: '$teamSize' },
          projectsByType: {
            $push: '$projectType'
          }
        }
      }
    ]);

    // Get projects by type
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
    next(error);
  }
};