const Analogy = require('../models/Analogy.model');
const Project = require('../models/Project.model');
const AnalogyService = require('../services/analogy.service');

// @desc    Create Analogy-based estimation
// @route   POST /api/analogy
// @access  Private
exports.createAnalogy = async (req, res, next) => {
  try {
    const { projectId, searchParams, notes } = req.body;

    // Get source project
    const sourceProject = await Project.findOne({
      _id: projectId,
      user: req.user.userId
    });

    if (!sourceProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Get historical projects for comparison
    const historicalProjects = await Project.find({
      user: req.user.userId,
      _id: { $ne: projectId }, // Exclude current project
      totalCost: { $exists: true, $ne: null }
    }).limit(50);

    // Extract features for comparison
    const sourceFeatures = {
      projectType: sourceProject.projectType,
      teamSize: sourceProject.teamSize,
      duration: sourceProject.duration,
      complexity: sourceProject.complexityLevel,
      estimatedCost: sourceProject.totalCost,
      technologyStack: sourceProject.technologyStack || [],
      methodology: sourceProject.methodology || 'Agile',
      domain: sourceProject.domain || 'General'
    };

    const historicalFeatures = historicalProjects.map(p => ({
      _id: p._id,
      name: p.name,
      projectType: p.projectType,
      teamSize: p.teamSize,
      duration: p.duration,
      complexity: p.complexityLevel,
      totalCost: p.totalCost,
      technologyStack: p.technologyStack || [],
      methodology: p.methodology || 'Agile',
      domain: p.domain || 'General'
    }));

    // Perform analogy estimation
    const estimation = await AnalogyService.estimate({
      sourceProject: sourceFeatures,
      historicalProjects: historicalFeatures,
      searchParams
    });

    // Create analogy record
    const analogy = await Analogy.create({
      user: req.user.userId,
      project: projectId,
      features: sourceFeatures,
      searchParams: searchParams || {},
      results: estimation.results,
      notes,
      status: 'Draft'
    });

    res.status(201).json({
      success: true,
      data: analogy
    });
  } catch (error) {
    console.error('Create Analogy error:', error);
    next(error);
  }
};

// @desc    Get all analogy analyses
// @route   GET /api/analogy
// @access  Private
exports.getAnalogyAnalyses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const analyses = await Analogy.find({ user: req.user.userId })
      .populate('project', 'name projectType')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Analogy.countDocuments({ user: req.user.userId });

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
    console.error('Get Analogy error:', error);
    next(error);
  }
};

// @desc    Get single analogy analysis
// @route   GET /api/analogy/:id
// @access  Private
exports.getAnalogyAnalysis = async (req, res, next) => {
  try {
    const analysis = await Analogy.findOne({
      _id: req.params.id,
      user: req.user.userId
    }).populate('project');

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analogy analysis not found'
      });
    }

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Get Analogy error:', error);
    next(error);
  }
};

// @desc    Update analogy analysis
// @route   PUT /api/analogy/:id
// @access  Private
exports.updateAnalogyAnalysis = async (req, res, next) => {
  try {
    const { searchParams, notes, status } = req.body;

    const analysis = await Analogy.findOne({
      _id: req.params.id,
      user: req.user.userId
    }).populate('project');

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analogy analysis not found'
      });
    }

    // Re-run analogy if search params changed
    if (searchParams) {
      // Get updated historical projects
      const historicalProjects = await Project.find({
        user: req.user.userId,
        _id: { $ne: analysis.project._id },
        totalCost: { $exists: true, $ne: null }
      }).limit(50);

      const historicalFeatures = historicalProjects.map(p => ({
        _id: p._id,
        name: p.name,
        projectType: p.projectType,
        teamSize: p.teamSize,
        duration: p.duration,
        complexity: p.complexityLevel,
        totalCost: p.totalCost,
        technologyStack: p.technologyStack || [],
        methodology: p.methodology || 'Agile',
        domain: p.domain || 'General'
      }));

      const estimation = await AnalogyService.estimate({
        sourceProject: analysis.features,
        historicalProjects: historicalFeatures,
        searchParams
      });

      analysis.results = estimation.results;
      analysis.searchParams = searchParams;
    }

    if (notes !== undefined) analysis.notes = notes;
    if (status) analysis.status = status;

    await analysis.save();

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Update Analogy error:', error);
    next(error);
  }
};

// @desc    Delete analogy analysis
// @route   DELETE /api/analogy/:id
// @access  Private
exports.deleteAnalogyAnalysis = async (req, res, next) => {
  try {
    const analysis = await Analogy.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analogy analysis not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Analogy analysis deleted successfully'
    });
  } catch (error) {
    console.error('Delete Analogy error:', error);
    next(error);
  }
};

// @desc    Find similar projects for a given project
// @route   POST /api/analogy/find-similar/:projectId
// @access  Private
exports.findSimilarProjects = async (req, res, next) => {
  try {
    const { minSimilarity = 70, maxResults = 5 } = req.body;

    const sourceProject = await Project.findOne({
      _id: req.params.projectId,
      user: req.user.userId
    });

    if (!sourceProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const historicalProjects = await Project.find({
      user: req.user.userId,
      _id: { $ne: req.params.projectId },
      totalCost: { $exists: true, $ne: null }
    }).limit(50);

    const sourceFeatures = {
      projectType: sourceProject.projectType,
      teamSize: sourceProject.teamSize,
      duration: sourceProject.duration,
      complexity: sourceProject.complexityLevel,
      technologyStack: sourceProject.technologyStack || [],
      methodology: sourceProject.methodology || 'Agile',
      domain: sourceProject.domain || 'General'
    };

    const historicalFeatures = historicalProjects.map(p => ({
      _id: p._id,
      name: p.name,
      projectType: p.projectType,
      teamSize: p.teamSize,
      duration: p.duration,
      complexity: p.complexityLevel,
      totalCost: p.totalCost,
      technologyStack: p.technologyStack || [],
      methodology: p.methodology || 'Agile',
      domain: p.domain || 'General'
    }));

    const similarProjects = AnalogyService.findSimilarProjects(
      sourceFeatures,
      historicalFeatures,
      minSimilarity,
      maxResults
    );

    res.status(200).json({
      success: true,
      data: similarProjects
    });
  } catch (error) {
    console.error('Find similar projects error:', error);
    next(error);
  }
};