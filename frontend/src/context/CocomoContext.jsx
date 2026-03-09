import React, { createContext, useContext, useState, useEffect } from 'react';

const CocomoContext = createContext();

export const useCocomo = () => {
  const context = useContext(CocomoContext);
  if (!context) {
    throw new Error('useCocomo must be used within a CocomoProvider');
  }
  return context;
};

export const CocomoProvider = ({ children }) => {
  const [cocomoProjects, setCocomoProjects] = useState([]);
  const [currentCalculation, setCurrentCalculation] = useState(null);

  // Load projects from localStorage or API on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('cocomoProjects');
    if (savedProjects) {
      setCocomoProjects(JSON.parse(savedProjects));
    }
  }, []);

  // Save to localStorage whenever projects change
  useEffect(() => {
    localStorage.setItem('cocomoProjects', JSON.stringify(cocomoProjects));
  }, [cocomoProjects]);

  // Calculate COCOMO II effort
  const calculateCocomoEffort = (params) => {
    const {
      size, // in KLOC
      modelType, // 'Organic', 'Semi-detached', 'Embedded'
      scaleFactors,
      costDrivers
    } = params;

    // COCOMO II coefficients
    const coefficients = {
      Organic: { a: 2.4, b: 1.05, c: 2.5, d: 0.38 },
      'Semi-detached': { a: 3.0, b: 1.12, c: 2.5, d: 0.35 },
      Embedded: { a: 3.6, b: 1.20, c: 2.5, d: 0.32 }
    };

    const coeff = coefficients[modelType] || coefficients['Semi-detached'];

    // Calculate scale factor exponent
    const scaleSum = Object.values(scaleFactors || {}).reduce((sum, val) => sum + val, 0);
    const exponent = coeff.b + 0.01 * scaleSum;

    // Nominal effort
    const effort = coeff.a * Math.pow(size, exponent);

    // Apply cost drivers (simplified)
    const effortWithDrivers = effort * (costDrivers || 1);

    // Calculate schedule
    const schedule = coeff.c * Math.pow(effortWithDrivers, coeff.d);

    return {
      effort: effortWithDrivers,
      schedule,
      productivity: size / effortWithDrivers
    };
  };

  // Add a new COCOMO project
  const addCocomoProject = (projectData) => {
    const { effort, schedule, productivity } = calculateCocomoEffort(projectData);
    
    const newProject = {
      id: Date.now().toString(),
      ...projectData,
      effort,
      schedule,
      productivity,
      status: 'draft',
      createdAt: new Date(),
      totalCost: effort * (projectData.laborRate || 5000)
    };

    setCocomoProjects(prev => [...prev, newProject]);
    setCurrentCalculation(newProject);
    
    return newProject;
  };

  // Update project status
  const updateProjectStatus = (projectId, status) => {
    setCocomoProjects(prev =>
      prev.map(p =>
        p.id === projectId ? { ...p, status } : p
      )
    );
  };

  // Delete project
  const deleteProject = (projectId) => {
    setCocomoProjects(prev => prev.filter(p => p.id !== projectId));
  };

  // Get project metrics
  const getProjectMetrics = () => {
    return {
      totalProjects: cocomoProjects.length,
      totalEffort: cocomoProjects.reduce((sum, p) => sum + (p.effort || 0), 0),
      totalCost: cocomoProjects.reduce((sum, p) => sum + (p.totalCost || 0), 0),
      averageProductivity: cocomoProjects.length > 0
        ? cocomoProjects.reduce((sum, p) => sum + (p.productivity || 0), 0) / cocomoProjects.length
        : 0
    };
  };

  const value = {
    cocomoProjects,
    currentCalculation,
    addCocomoProject,
    updateProjectStatus,
    deleteProject,
    getProjectMetrics,
    calculateCocomoEffort
  };

  return (
    <CocomoContext.Provider value={value}>
      {children}
    </CocomoContext.Provider>
  );
};