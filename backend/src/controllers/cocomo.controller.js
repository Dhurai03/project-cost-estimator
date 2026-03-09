const Cocomo = require('../models/Cocomo.model');
const Project = require('../models/Project.model');
const CocomoService = require('../services/cocomo.service');

// @desc    Create COCOMO analysis
// @route   POST /api/cocomo
// @access  Private
exports.createCocomo = async (req, res, next) => {
  try {
    const { 
      projectId, 
      modelType, 
      sizeKloc, 
      scaleFactors, 
      costDrivers,
      laborRatePerMonth,
      notes 
    } = req.body;

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

    // Calculate COCOMO results
    const results = CocomoService.calculateAll({
      sizeKloc,
      modelType,
      scaleFactors,
      costDrivers,
      laborRatePerMonth: laborRatePerMonth || 5000
    });

    // Create COCOMO record
    const cocomo = await Cocomo.create({
      user: req.user.userId,
      project: projectId,
      modelType,
      sizeKloc,
      scaleFactors,
      costDrivers,
      results,
      notes,
      status: 'Draft'
    });

    res.status(201).json({
      success: true,
      data: cocomo
    });
  } catch (error) {
    console.error('Create COCOMO error:', error);
    next(error);
  }
};

// @desc    Get all COCOMO analyses
// @route   GET /api/cocomo
// @access  Private
exports.getCocomoAnalyses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const analyses = await Cocomo.find({ user: req.user.userId })
      .populate('project', 'name projectType')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Cocomo.countDocuments({ user: req.user.userId });

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
    console.error('Get COCOMO error:', error);
    next(error);
  }
};

// @desc    Get single COCOMO analysis
// @route   GET /api/cocomo/:id
// @access  Private
exports.getCocomoAnalysis = async (req, res, next) => {
  try {
    const analysis = await Cocomo.findOne({
      _id: req.params.id,
      user: req.user.userId
    }).populate('project');

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'COCOMO analysis not found'
      });
    }

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Get COCOMO error:', error);
    next(error);
  }
};

// @desc    Update COCOMO analysis
// @route   PUT /api/cocomo/:id
// @access  Private
exports.updateCocomoAnalysis = async (req, res, next) => {
  try {
    const { 
      modelType, 
      sizeKloc, 
      scaleFactors, 
      costDrivers,
      laborRatePerMonth,
      notes,
      status 
    } = req.body;

    const analysis = await Cocomo.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'COCOMO analysis not found'
      });
    }

    // Recalculate if parameters changed
    if (sizeKloc || modelType || scaleFactors || costDrivers) {
      const results = CocomoService.calculateAll({
        sizeKloc: sizeKloc || analysis.sizeKloc,
        modelType: modelType || analysis.modelType,
        scaleFactors: scaleFactors || analysis.scaleFactors,
        costDrivers: costDrivers || analysis.costDrivers,
        laborRatePerMonth: laborRatePerMonth || 5000
      });
      analysis.results = results;
    }

    // Update fields
    if (modelType) analysis.modelType = modelType;
    if (sizeKloc) analysis.sizeKloc = sizeKloc;
    if (scaleFactors) analysis.scaleFactors = scaleFactors;
    if (costDrivers) analysis.costDrivers = costDrivers;
    if (notes !== undefined) analysis.notes = notes;
    if (status) analysis.status = status;

    await analysis.save();

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Update COCOMO error:', error);
    next(error);
  }
};

// @desc    Delete COCOMO analysis
// @route   DELETE /api/cocomo/:id
// @access  Private
exports.deleteCocomoAnalysis = async (req, res, next) => {
  try {
    const analysis = await Cocomo.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'COCOMO analysis not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'COCOMO analysis deleted successfully'
    });
  } catch (error) {
    console.error('Delete COCOMO error:', error);
    next(error);
  }
};

// @desc    Get COCOMO statistics
// @route   GET /api/cocomo/stats/summary
// @access  Private
exports.getCocomoStats = async (req, res, next) => {
  try {
    const stats = await Cocomo.aggregate([
      { $match: { user: req.user.userId } },
      {
        $group: {
          _id: null,
          totalAnalyses: { $sum: 1 },
          averageEffort: { $avg: '$results.effortPersonMonths' },
          averageTime: { $avg: '$results.developmentTimeMonths' },
          averageCost: { $avg: '$results.cost' }
        }
      }
    ]);

    const byModelType = await Cocomo.aggregate([
      { $match: { user: req.user.userId } },
      {
        $group: {
          _id: '$modelType',
          count: { $sum: 1 },
          averageEffort: { $avg: '$results.effortPersonMonths' },
          averageTime: { $avg: '$results.developmentTimeMonths' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: stats[0] || {
          totalAnalyses: 0,
          averageEffort: 0,
          averageTime: 0,
          averageCost: 0
        },
        byModelType
      }
    });
  } catch (error) {
    console.error('Get COCOMO stats error:', error);
    next(error);
  }
};