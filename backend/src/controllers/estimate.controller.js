const Estimate = require('../models/Estimate.model');
const Project = require('../models/Project.model');
const { generatePDF } = require('../services/pdf.service');
const { generateCSV } = require('../services/csv.service');

// @desc    Create estimate from project
// @route   POST /api/estimates
// @access  Private
exports.createEstimate = async (req, res, next) => {
  try {
    const { projectId, notes, status } = req.body;

    // Get project details
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

    // Create estimate
    const estimate = await Estimate.create({
      user: req.user.userId,
      project: projectId,
      costBreakdown: {
        laborCost: project.laborCost,
        materialCost: project.materialCost,
        equipmentCost: project.equipmentCost,
        miscCost: project.miscCost,
        totalCost: project.totalCost
      },
      notes,
      status: status || 'Draft'
    });

    // Populate project details
    await estimate.populate('project');

    res.status(201).json({
      success: true,
      data: estimate
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all estimates for user
// @route   GET /api/estimates
// @access  Private
exports.getEstimates = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { user: req.user.userId };
    if (status) query.status = status;

    const estimates = await Estimate.find(query)
      .populate('project', 'name projectType duration')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Estimate.countDocuments(query);

    res.status(200).json({
      success: true,
      data: estimates,
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

// @desc    Get single estimate
// @route   GET /api/estimates/:id
// @access  Private
exports.getEstimate = async (req, res, next) => {
  try {
    const estimate = await Estimate.findOne({
      _id: req.params.id,
      user: req.user.userId
    }).populate('project');

    if (!estimate) {
      return res.status(404).json({
        success: false,
        message: 'Estimate not found'
      });
    }

    res.status(200).json({
      success: true,
      data: estimate
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update estimate
// @route   PUT /api/estimates/:id
// @access  Private
exports.updateEstimate = async (req, res, next) => {
  try {
    const { notes, status } = req.body;

    const estimate = await Estimate.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { notes, status },
      { new: true, runValidators: true }
    ).populate('project');

    if (!estimate) {
      return res.status(404).json({
        success: false,
        message: 'Estimate not found'
      });
    }

    res.status(200).json({
      success: true,
      data: estimate
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete estimate
// @route   DELETE /api/estimates/:id
// @access  Private
exports.deleteEstimate = async (req, res, next) => {
  try {
    const estimate = await Estimate.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!estimate) {
      return res.status(404).json({
        success: false,
        message: 'Estimate not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Estimate deleted successfully'
    });
  } catch (error) {
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
    }).populate('project');

    if (!estimate) {
      return res.status(404).json({
        success: false,
        message: 'Estimate not found'
      });
    }

    const pdfBuffer = await generatePDF(estimate);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=estimate-${estimate.estimateNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
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
    }).populate('project');

    if (!estimate) {
      return res.status(404).json({
        success: false,
        message: 'Estimate not found'
      });
    }

    const csvBuffer = await generateCSV(estimate);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=estimate-${estimate.estimateNumber}.csv`);
    res.send(csvBuffer);
  } catch (error) {
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
          averageEstimateValue: { $avg: '$costBreakdown.totalCost' },
          totalEstimateValue: { $sum: '$costBreakdown.totalCost' },
          estimatesByStatus: {
            $push: '$status'
          }
        }
      }
    ]);

    const estimatesByStatus = await Estimate.aggregate([
      { $match: { user: req.user.userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$costBreakdown.totalCost' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: stats[0] || { totalEstimates: 0, averageEstimateValue: 0, totalEstimateValue: 0 },
        byStatus: estimatesByStatus
      }
    });
  } catch (error) {
    next(error);
  }
};