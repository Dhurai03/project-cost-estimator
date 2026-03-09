const FunctionPoint = require('../models/FunctionPoint.model');
const Project = require('../models/Project.model');
const FunctionPointService = require('../services/functionPoint.service');

// @desc    Create Function Point analysis
// @route   POST /api/function-points
// @access  Private
exports.createFunctionPoint = async (req, res, next) => {
  try {
    const { projectId, functionCounts, valueAdjustmentFactors, language, ratePerHour, notes } = req.body;

    // Verify project exists and belongs to user
    const project = await Project.findOne({
      _id: projectId,
      user: req.user.userId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Calculate FP results
    const results = FunctionPointService.calculateAll({
      functionCounts,
      valueAdjustmentFactors,
      language: language || 'Default',
      ratePerHour: ratePerHour || 50
    });

    // Create FP record
    const fpAnalysis = await FunctionPoint.create({
      user: req.user.userId,
      project: projectId,
      functionCounts,
      valueAdjustmentFactors,
      results,
      language,
      notes,
      status: 'Draft'
    });

    res.status(201).json({
      success: true,
      data: fpAnalysis
    });
  } catch (error) {
    console.error('Create FP error:', error);
    next(error);
  }
};

// @desc    Get all FP analyses for user
// @route   GET /api/function-points
// @access  Private
exports.getFunctionPoints = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const analyses = await FunctionPoint.find({ user: req.user.userId })
      .populate('project', 'name projectType')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await FunctionPoint.countDocuments({ user: req.user.userId });

    res.status(200).json({
      success: true,
      data: analyses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get FP error:', error);
    next(error);
  }
};

// @desc    Get single FP analysis
// @route   GET /api/function-points/:id
// @access  Private
exports.getFunctionPoint = async (req, res, next) => {
  try {
    const analysis = await FunctionPoint.findOne({
      _id: req.params.id,
      user: req.user.userId
    }).populate('project');

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Function Point analysis not found'
      });
    }

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Get FP error:', error);
    next(error);
  }
};

// @desc    Update FP analysis
// @route   PUT /api/function-points/:id
// @access  Private
exports.updateFunctionPoint = async (req, res, next) => {
  try {
    const { functionCounts, valueAdjustmentFactors, language, ratePerHour, notes, status } = req.body;

    const analysis = await FunctionPoint.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Function Point analysis not found'
      });
    }

    // Recalculate if inputs changed
    if (functionCounts || valueAdjustmentFactors) {
      const results = FunctionPointService.calculateAll({
        functionCounts: functionCounts || analysis.functionCounts,
        valueAdjustmentFactors: valueAdjustmentFactors || analysis.valueAdjustmentFactors,
        language: language || analysis.language,
        ratePerHour: ratePerHour || 50
      });
      analysis.results = results;
    }

    // Update fields
    if (functionCounts) analysis.functionCounts = functionCounts;
    if (valueAdjustmentFactors) analysis.valueAdjustmentFactors = valueAdjustmentFactors;
    if (language) analysis.language = language;
    if (notes !== undefined) analysis.notes = notes;
    if (status) analysis.status = status;

    await analysis.save();

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Update FP error:', error);
    next(error);
  }
};

// @desc    Delete FP analysis
// @route   DELETE /api/function-points/:id
// @access  Private
exports.deleteFunctionPoint = async (req, res, next) => {
  try {
    const analysis = await FunctionPoint.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Function Point analysis not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Function Point analysis deleted successfully'
    });
  } catch (error) {
    console.error('Delete FP error:', error);
    next(error);
  }
};

// @desc    Get FP statistics
// @route   GET /api/function-points/stats/summary
// @access  Private
exports.getFPStats = async (req, res, next) => {
  try {
    const stats = await FunctionPoint.aggregate([
      { $match: { user: req.user.userId } },
      {
        $group: {
          _id: null,
          totalAnalyses: { $sum: 1 },
          averageFP: { $avg: '$results.adjustedFunctionPoints' },
          averageEffort: { $avg: '$results.estimatedEffortHours' },
          averageCost: { $avg: '$results.estimatedCost' }
        }
      }
    ]);

    const byProjectType = await FunctionPoint.aggregate([
      { $match: { user: req.user.userId } },
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          as: 'projectInfo'
        }
      },
      { $unwind: '$projectInfo' },
      {
        $group: {
          _id: '$projectInfo.projectType',
          count: { $sum: 1 },
          totalFP: { $sum: '$results.adjustedFunctionPoints' },
          totalCost: { $sum: '$results.estimatedCost' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: stats[0] || {
          totalAnalyses: 0,
          averageFP: 0,
          averageEffort: 0,
          averageCost: 0
        },
        byProjectType
      }
    });
  } catch (error) {
    console.error('Get FP stats error:', error);
    next(error);
  }
};