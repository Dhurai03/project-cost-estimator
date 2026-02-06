const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');

// Get all projects for user
router.get('/', auth, async (req, res) => {
    try {
        const projects = await Project.find({ user: req.userId }).sort('-updatedAt');
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findOne({ 
            _id: req.params.id, 
            user: req.userId 
        });
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create project
router.post('/', auth, async (req, res) => {
    try {
        const projectData = {
            ...req.body,
            user: req.userId,
            totalEstimate: calculateTotal(req.body)
        };
        
        const project = new Project(projectData);
        await project.save();
        
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update project
router.put('/:id', auth, async (req, res) => {
    try {
        const projectData = {
            ...req.body,
            updatedAt: Date.now(),
            totalEstimate: calculateTotal(req.body)
        };
        
        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            projectData,
            { new: true }
        );
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({ 
            _id: req.params.id, 
            user: req.userId 
        });
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        res.json({ message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Helper function to calculate total
function calculateTotal(projectData) {
    let total = 0;
    
    // Sum line items
    if (projectData.lineItems && projectData.lineItems.length > 0) {
        total += projectData.lineItems.reduce((sum, item) => {
            return sum + (item.quantity * item.unitPrice);
        }, 0);
    }
    
    // Add taxes
    if (projectData.taxes) {
        total += total * (projectData.taxes / 100);
    }
    
    // Add additional fees
    if (projectData.additionalFees) {
        total += projectData.additionalFees;
    }
    
    // Add insurance if selected
    if (projectData.insurance && projectData.insuranceCost) {
        total += projectData.insuranceCost;
    }
    
    return Math.round(total * 100) / 100;
}

module.exports = router;