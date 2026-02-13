const Estimate = require('../models/Estimate.model');
const EstimateHistory = require('../models/EstimateHistory.model');
const Project = require('../models/Project.model');
const { generatePDF } = require('../services/pdf.service');
const { generateCSV } = require('../services/csv.service');

// @desc    Create estimate from project
// @route   POST /api/estimates
// @access  Private
exports.createEstimate = async (req, res, next) => {
  try {
    console.log('📝 Creating estimate with body:', req.body);
    
    const { projectId, notes, status, currency = 'USD' } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    // Get project details
    const project = await Project.findOne({
      _id: projectId,
      user: req.user.userId
    });

    if (!project) {
      console.log('❌ Project not found:', projectId);
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    console.log('✅ Project found:', project._id);

    // Create estimate with full details
    const estimate = new Estimate({
      user: req.user.userId,
      project: projectId,
      projectDetails: {
        name: project.name,
        duration: project.duration,
        projectType: project.projectType,
        teamSize: project.teamSize,
        complexityLevel: project.complexityLevel
      },
      costInputs: {
        laborCostPerHour: project.laborCostPerHour,
        materialCost: project.materialCost,
        equipmentCost: project.equipmentCost,
        miscExpenses: project.miscExpenses
      },
      costBreakdown: {
        laborCost: project.laborCost,
        materialCost: project.materialCost,
        equipmentCost: project.equipmentCost,
        miscCost: project.miscCost,
        totalCost: project.totalCost
      },
      notes: notes || '',
      status: status || 'Draft',
      currency
    });

    // Save estimate (this will trigger pre-validate hook)
    await estimate.save();

    console.log('✅ Estimate created successfully:', {
      id: estimate._id,
      number: estimate.estimateNumber,
      status: estimate.status
    });

    // Try to create history (non-critical)
    try {
      await EstimateHistory.create({
        estimate: estimate._id,
        user: req.user.userId,
        action: 'CREATED',
        newStatus: estimate.status,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
    } catch (historyError) {
      console.error('❌ History creation error (non-critical):', historyError.message);
    }

    // Populate project details
    await estimate.populate('project', 'name projectType duration');

    res.status(201).json({
      success: true,
      data: estimate
    });
  } catch (error) {
    console.error('❌ Create estimate error:', error);
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    
    next(error);
  }
};

// @desc    Update estimate status
// @route   PUT /api/estimates/:id
// @access  Private
exports.updateEstimate = async (req, res, next) => {
  try {
    const { notes, status } = req.body;

    const estimate = await Estimate.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!estimate) {
      return res.status(404).json({
        success: false,
        message: 'Estimate not found'
      });
    }

    // Track changes for history
    const previousStatus = estimate.status;
    const changes = {};

    if (notes !== undefined && notes !== estimate.notes) {
      changes.notes = { from: estimate.notes, to: notes };
      estimate.notes = notes;
    }

    if (status !== undefined && status !== estimate.status) {
      changes.status = { from: estimate.status, to: status };
      estimate.status = status;
    }

    await estimate.save();

    // Create history entry if status changed
    if (previousStatus !== estimate.status) {
      await EstimateHistory.create({
        estimate: estimate._id,
        user: req.user.userId,
        action: 'STATUS_CHANGED',
        previousStatus,
        newStatus: estimate.status,
        changes,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
    }

    await estimate.populate('project', 'name projectType duration');

    res.status(200).json({
      success: true,
      data: estimate
    });
  } catch (error) {
    console.error('❌ Update estimate error:', error);
    next(error);
  }
};

// @desc    Delete estimate
// @route   DELETE /api/estimates/:id
// @access  Private
exports.deleteEstimate = async (req, res, next) => {
  try {
    const estimate = await Estimate.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!estimate) {
      return res.status(404).json({
        success: false,
        message: 'Estimate not found'
      });
    }

    // Create history entry before deletion
    await EstimateHistory.create({
      estimate: estimate._id,
      user: req.user.userId,
      action: 'DELETED',
      previousStatus: estimate.status,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    await estimate.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Estimate deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete estimate error:', error);
    next(error);
  }
};

// @desc    Get all estimates for user
// @route   GET /api/estimates
// @access  Private
exports.getEstimates = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;
    
    const query = { user: req.user.userId };
    if (status) query.status = status;
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const estimates = await Estimate.find(query)
      .populate('project', 'name projectType')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Estimate.countDocuments(query);

    // Get statistics
    const stats = await Estimate.aggregate([
      { $match: { user: req.user.userId } },
      {
        $group: {
          _id: null,
          totalCost: { $sum: '$costBreakdown.totalCost' },
          averageCost: { $avg: '$costBreakdown.totalCost' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: estimates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      stats: stats[0] || { totalCost: 0, averageCost: 0, count: 0 }
    });
  } catch (error) {
    console.error('❌ Get estimates error:', error);
    next(error);
  }
};

// @desc    Get single estimate
// @route   GET /api/estimates/:id
// @access  Private
exports.getEstimate = async (req, res, next) => {
  try {
    const estimate = await Estimate.findOne({
      _id: req.params.id,
      user: req.user.userId
    }).populate('project', 'name projectType duration teamSize complexityLevel');

    if (!estimate) {
      return res.status(404).json({
        success: false,
        message: 'Estimate not found'
      });
    }

    // Get estimate history
    const history = await EstimateHistory.find({ estimate: estimate._id })
      .sort('-timestamp')
      .limit(10);

    res.status(200).json({
      success: true,
      data: estimate,
      history
    });
  } catch (error) {
    console.error('❌ Get estimate error:', error);
    next(error);
  }
};

// @desc    Export estimate as PDF
// @route   GET /api/estimates/:id/export/pdf
// @access  Private
exports.exportEstimatePDF = async (req, res, next) => {
  try {
    const estimate = await Estimate.findOne({
      _id: req.params.id,
      user: req.user.userId
    }).populate('project', 'name projectType duration teamSize complexityLevel');

    if (!estimate) {
      return res.status(404).json({
        success: false,
        message: 'Estimate not found'
      });
    }

    const pdfBuffer = await generatePDF(estimate);

    // Log export in history
    await EstimateHistory.create({
      estimate: estimate._id,
      user: req.user.userId,
      action: 'EXPORTED_PDF',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=estimate-${estimate.estimateNumber}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('❌ Export PDF error:', error);
    next(error);
  }
};

// @desc    Export estimate as CSV
// @route   GET /api/estimates/:id/export/csv
// @access  Private
exports.exportEstimateCSV = async (req, res, next) => {
  try {
    const estimate = await Estimate.findOne({
      _id: req.params.id,
      user: req.user.userId
    }).populate('project', 'name projectType duration teamSize complexityLevel');

    if (!estimate) {
      return res.status(404).json({
        success: false,
        message: 'Estimate not found'
      });
    }

    const csvBuffer = await generateCSV(estimate);

    // Log export in history
    await EstimateHistory.create({
      estimate: estimate._id,
      user: req.user.userId,
      action: 'EXPORTED_CSV',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=estimate-${estimate.estimateNumber}.csv`);
    res.setHeader('Content-Length', csvBuffer.length);
    res.send(csvBuffer);
  } catch (error) {
    console.error('❌ Export CSV error:', error);
    next(error);
  }
};

// @desc    Get estimate statistics
// @route   GET /api/estimates/stats/summary
// @access  Private
exports.getEstimateStats = async (req, res, next) => {
  try {
    const stats = await Estimate.aggregate([
      { $match: { user: req.user.userId } },
      {
        $group: {
          _id: null,
          totalEstimates: { $sum: 1 },
          totalCost: { $sum: '$costBreakdown.totalCost' },
          averageCost: { $avg: '$costBreakdown.totalCost' },
          minCost: { $min: '$costBreakdown.totalCost' },
          maxCost: { $max: '$costBreakdown.totalCost' }
        }
      }
    ]);

    const statusStats = await Estimate.aggregate([
      { $match: { user: req.user.userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCost: { $sum: '$costBreakdown.totalCost' }
        }
      }
    ]);

    const monthlyStats = await Estimate.aggregate([
      { $match: { user: req.user.userId } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          totalCost: { $sum: '$costBreakdown.totalCost' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: stats[0] || {
          totalEstimates: 0,
          totalCost: 0,
          averageCost: 0,
          minCost: 0,
          maxCost: 0
        },
        byStatus: statusStats,
        byMonth: monthlyStats
      }
    });
  } catch (error) {
    console.error('❌ Get estimate stats error:', error);
    next(error);
  }
};

// @desc    Get estimate history for a specific estimate
// @route   GET /api/estimates/:id/history
// @access  Private
exports.getEstimateHistory = async (req, res, next) => {
  try {
    const estimate = await Estimate.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!estimate) {
      return res.status(404).json({
        success: false,
        message: 'Estimate not found'
      });
    }

    const history = await EstimateHistory.find({ estimate: estimate._id })
      .sort('-timestamp')
      .limit(50);

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('❌ Get estimate history error:', error);
    next(error);
  }
};