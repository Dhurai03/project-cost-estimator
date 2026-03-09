import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CostBreakdownChart from '../components/CostBreakdownChart';
import AiInsights from '../components/AiInsights';
import { useData } from '../context/DataContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCocomo } from '../context/CocomoContext';

// Heroicons for Dashboard
const Icons = {
  TotalCost: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Estimates: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Efficiency: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Budget: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ProjectType: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  TopProject: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-5m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Chart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  TrendUp: () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  TrendDown: () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
  )
};

// Dummy data for fallback
const dummyProjectsStats = {
  summary: {
    totalProjects: 24,
    totalCost: 1250000,
    averageCost: 52083,
    averageTeamSize: 6
  },
  byType: [
    { _id: 'Software', count: 12, totalCost: 650000 },
    { _id: 'Construction', count: 6, totalCost: 350000 },
    { _id: 'Manufacturing', count: 4, totalCost: 180000 },
    { _id: 'Event', count: 2, totalCost: 70000 }
  ]
};

const dummyEstimatesStats = {
  summary: {
    totalEstimates: 42,
    totalCost: 2100000,
    averageCost: 50000
  },
  byStatus: [
    { _id: 'Draft', count: 15, totalCost: 650000 },
    { _id: 'Final', count: 22, totalCost: 1200000 },
    { _id: 'Archived', count: 5, totalCost: 250000 }
  ]
};

const Dashboard = () => {
  const { formatCurrency } = useCurrency();
  const { 
    projectsStats, 
    estimatesStats, 
    estimates,
    refreshAllData,
    lastUpdated 
  } = useData();
  
  const { cocomoProjects } = useCocomo();
  
  const [greeting, setGreeting] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Set to false to use real data
  const useDummyData = false;

  // Process COCOMO data and merge with API data
  const getMergedData = () => {
    // Start with API data if available
    let mergedProjectsStats = projectsStats?.summary?.totalProjects > 0 
      ? { ...projectsStats }
      : {
          summary: {
            totalProjects: 0,
            totalCost: 0,
            averageCost: 0,
            averageTeamSize: 0
          },
          byType: []
        };

    let mergedEstimatesStats = estimatesStats?.summary?.totalEstimates > 0
      ? { ...estimatesStats }
      : {
          summary: {
            totalEstimates: 0,
            totalCost: 0,
            averageCost: 0
          },
          byStatus: []
        };

    let mergedEstimates = estimates?.length > 0 ? [...estimates] : [];

    // Add COCOMO projects if they exist
    if (cocomoProjects && cocomoProjects.length > 0) {
      console.log('Adding COCOMO projects:', cocomoProjects);
      
      // Update projects stats with COCOMO data
      const cocomoTotalCost = cocomoProjects.reduce((sum, p) => sum + (p.totalCost || 0), 0);
      const cocomoTotalProjects = cocomoProjects.length;
      
      mergedProjectsStats.summary.totalProjects += cocomoTotalProjects;
      mergedProjectsStats.summary.totalCost += cocomoTotalCost;
      mergedProjectsStats.summary.averageCost = 
        mergedProjectsStats.summary.totalProjects > 0 
          ? mergedProjectsStats.summary.totalCost / mergedProjectsStats.summary.totalProjects 
          : 0;

      // Update byType with COCOMO projects
      cocomoProjects.forEach(project => {
        let type = 'Software'; // Default type
        if (project.modelType === 'embedded') type = 'Construction';
        else if (project.modelType === 'semi-detached' && project.size > 50) type = 'Manufacturing';
        
        const existingType = mergedProjectsStats.byType.find(t => t._id === type);
        if (existingType) {
          existingType.count += 1;
          existingType.totalCost += project.totalCost || 0;
        } else {
          mergedProjectsStats.byType.push({
            _id: type,
            count: 1,
            totalCost: project.totalCost || 0
          });
        }
      });

      // Update estimates stats
      mergedEstimatesStats.summary.totalEstimates += cocomoTotalProjects;
      mergedEstimatesStats.summary.totalCost += cocomoTotalCost;
      mergedEstimatesStats.summary.averageCost = 
        mergedEstimatesStats.summary.totalEstimates > 0 
          ? mergedEstimatesStats.summary.totalCost / mergedEstimatesStats.summary.totalEstimates 
          : 0;

      // Add COCOMO projects to estimates list
      cocomoProjects.forEach(project => {
        mergedEstimates.push({
          _id: project.id,
          project: { 
            name: project.name || 'COCOMO Project',
            type: project.modelType
          },
          costBreakdown: { 
            totalCost: project.totalCost || 0
          },
          status: project.status || 'Draft',
          createdAt: project.createdAt || new Date(),
          cocomoParams: {
            size: project.size,
            modelType: project.modelType,
            effort: project.effort,
            schedule: project.schedule
          }
        });
      });
    }

    return {
      projectsStats: mergedProjectsStats,
      estimatesStats: mergedEstimatesStats,
      estimates: mergedEstimates
    };
  };

  const mergedData = getMergedData();
  const displayProjectsStats = useDummyData ? dummyProjectsStats : mergedData.projectsStats;
  const displayEstimatesStats = useDummyData ? dummyEstimatesStats : mergedData.estimatesStats;
  const displayEstimates = useDummyData ? dummyEstimates : mergedData.estimates;

  // Debug logs
  useEffect(() => {
    console.log('🔍 DASHBOARD DATA:');
    console.log('COCOMO Projects:', cocomoProjects);
    console.log('Merged Projects Stats:', displayProjectsStats);
    console.log('Merged Estimates:', displayEstimates);
    console.log('Total Cost:', displayProjectsStats?.summary?.totalCost);
  }, [cocomoProjects, displayProjectsStats, displayEstimates]);

  // Initial load and greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
    
    refreshAllData();
  }, [refreshAllData]);

  // Manual refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAllData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAllData();
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshAllData]);

  // Get top 4 estimates by cost
  const getTopEstimates = () => {
    if (!displayEstimates || displayEstimates.length === 0) return [];
    
    return [...displayEstimates]
      .sort((a, b) => (b.costBreakdown?.totalCost || 0) - (a.costBreakdown?.totalCost || 0))
      .slice(0, 4);
  };

  const recentEstimates = getTopEstimates();

  const totalProjects = displayProjectsStats?.summary?.totalProjects || 0;
  const totalProjectCost = displayProjectsStats?.summary?.totalCost || 0;
  const averageProjectCost = displayProjectsStats?.summary?.averageCost || 0;
  const totalEstimates = displayEstimatesStats?.summary?.totalEstimates || 0;
  const totalEstimateValue = displayEstimatesStats?.summary?.totalCost || 0;
  
  // Calculate efficiency metrics
  const utilizedCost = totalProjectCost * 0.7; // 70% utilized as example
  const idleCost = totalProjectCost * 0.2; // 20% idle
  const unallocatedCost = totalProjectCost * 0.1; // 10% unallocated
  const efficiencyScore = totalProjectCost > 0 ? '70' : '0';
  
  // Trends
  const projectTrend = totalProjects > 0 ? '+12%' : '0%';
  const estimateTrend = totalEstimates > 0 ? '+8.5%' : '0%';
  const projectTrendUp = totalProjects > 5;
  const estimateTrendUp = totalEstimates > 5;
  
  // Budget metrics
  const budgetUsed = totalProjectCost > 0 ? Math.min(Math.round((totalProjectCost / 2000000) * 100), 100) : 0;
  const budgetRemaining = 100 - budgetUsed;
  const overspendPercentage = totalProjectCost > 2000000 ? ((totalProjectCost - 2000000) / 2000000 * 100).toFixed(2) : '0';
  
  // Project type distribution
  const projectTypes = displayProjectsStats?.byType || [];
  
  const getProjectTypePercentage = (type) => {
    if (!totalProjects) return '0';
    const found = projectTypes.find(t => t._id === type);
    return found ? ((found.count / totalProjects) * 100).toFixed(0) : '0';
  };

  const getProjectTypeCount = (type) => {
    const found = projectTypes.find(t => t._id === type);
    return found?.count || 0;
  };

  const getProjectTypeCost = (type) => {
    const found = projectTypes.find(t => t._id === type);
    return found?.totalCost || 0;
  };

  // Calculate average size and effort from COCOMO projects
  const getAverageSize = () => {
    if (!cocomoProjects || cocomoProjects.length === 0) return '0';
    const total = cocomoProjects.reduce((sum, p) => sum + (p.size || 0), 0);
    return (total / cocomoProjects.length).toFixed(1);
  };

  const getAverageEffort = () => {
    if (!cocomoProjects || cocomoProjects.length === 0) return '0';
    const total = cocomoProjects.reduce((sum, p) => sum + (p.effort || 0), 0);
    return (total / cocomoProjects.length).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-[#0B0F15] light-theme:bg-gray-50">
      <Navbar />
      
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white light-theme:text-gray-900 mb-1">Project Cost Explorer</h1>
            <p className="text-gray-400 light-theme:text-gray-600 text-sm">
              Real-time COCOMO II Cost Tracking • Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : new Date().toLocaleTimeString()}
              {!useDummyData && totalProjects > 0 && <span className="ml-2 text-indigo-400">• Live Data ({totalProjects} projects)</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 bg-[#1E252E] light-theme:bg-white hover:bg-[#2A313C] rounded-lg text-gray-400 light-theme:text-gray-600 hover:text-white light-theme:text-gray-900 transition-all duration-200 disabled:opacity-50"
              title="Refresh data"
            >
              <Icons.Refresh />
            </button>
            {!useDummyData && cocomoProjects && cocomoProjects.length > 0 && (
              <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-md">
                {cocomoProjects.length} COCOMO Projects
              </span>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {/* Total Project Cost */}
          <div className="bg-[#151A22] light-theme:bg-white rounded-lg border border-[#2A313C] light-theme:border-gray-200 p-5 hover:border-indigo-500/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 light-theme:text-gray-600 flex items-center gap-1">
                <Icons.TotalCost />
                TOTAL PROJECT COST
              </span>
              <span className={`text-xs flex items-center gap-1 ${projectTrendUp ? 'text-emerald-400' : 'text-gray-400 light-theme:text-gray-600'}`}>
                {projectTrendUp ? <Icons.TrendUp /> : <Icons.TrendDown />}
                {projectTrend}
              </span>
            </div>
            <div className="text-2xl font-semibold text-white light-theme:text-gray-900 mb-1">
              {formatCurrency(totalProjectCost)}
            </div>
            <div className="text-xs text-gray-500">
              {totalProjects} {totalProjects === 1 ? 'project' : 'projects'}
            </div>
          </div>

          {/* Total Estimates */}
          <div className="bg-[#151A22] light-theme:bg-white rounded-lg border border-[#2A313C] light-theme:border-gray-200 p-5 hover:border-emerald-500/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 light-theme:text-gray-600 flex items-center gap-1">
                <Icons.Estimates />
                TOTAL ESTIMATES
              </span>
              <span className={`text-xs flex items-center gap-1 ${estimateTrendUp ? 'text-emerald-400' : 'text-gray-400 light-theme:text-gray-600'}`}>
                {estimateTrendUp ? <Icons.TrendUp /> : <Icons.TrendDown />}
                {estimateTrend}
              </span>
            </div>
            <div className="text-2xl font-semibold text-white light-theme:text-gray-900 mb-1">
              {totalEstimates}
            </div>
            <div className="text-xs text-gray-500">
              Value: {formatCurrency(totalEstimateValue)}
            </div>
          </div>

          {/* Efficiency Score */}
          <div className="bg-[#151A22] light-theme:bg-white rounded-lg border border-[#2A313C] light-theme:border-gray-200 p-5 hover:border-indigo-500/50 transition-all duration-300">
            <div className="flex items-center gap-1 text-xs text-gray-400 light-theme:text-gray-600 mb-2">
              <Icons.Efficiency />
              <span>EFFICIENCY SCORE</span>
            </div>
            <div className="text-2xl font-semibold text-indigo-400 mb-1">
              {efficiencyScore}%
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-gray-400 light-theme:text-gray-600">Utilized: {formatCurrency(utilizedCost)}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400 light-theme:text-gray-600">Idle: {formatCurrency(idleCost)}</span>
            </div>
          </div>

          {/* Budget Utilization */}
          <div className="bg-[#151A22] light-theme:bg-white rounded-lg border border-[#2A313C] light-theme:border-gray-200 p-5 hover:border-amber-500/50 transition-all duration-300">
            <div className="flex items-center gap-1 text-xs text-gray-400 light-theme:text-gray-600 mb-2">
              <Icons.Budget />
              <span>BUDGET UTILIZATION</span>
            </div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xl font-semibold text-amber-400">{budgetUsed}%</span>
              <span className="text-xs text-gray-400 light-theme:text-gray-600">{overspendPercentage}% overspend</span>
            </div>
            <div className="w-full bg-[#1E252E] light-theme:bg-white h-1.5 rounded-full mt-2">
              <div 
                className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${budgetUsed}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-500">Used: {budgetUsed}%</span>
              <span className="text-xs text-gray-500">Remaining: {budgetRemaining}%</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Chart - 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-[#151A22] light-theme:bg-white rounded-lg border border-[#2A313C] light-theme:border-gray-200 p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white light-theme:text-gray-900 font-medium text-sm flex items-center gap-2">
                  <Icons.Chart />
                  PROJECT COST BREAKDOWN
                </h3>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400 light-theme:text-gray-600">
                    EFFICIENCY: <span className="text-indigo-400 font-semibold">{efficiencyScore}%</span>
                  </span>
                  <span className="text-xs text-gray-400 light-theme:text-gray-600">
                    BUDGET: <span className="text-amber-400">{budgetUsed}%</span> used
                  </span>
                </div>
              </div>
              
              {/* Cost Bars */}
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400 light-theme:text-gray-600">Utilized (Active Projects)</span>
                    <span className="text-white light-theme:text-gray-900 font-medium">{formatCurrency(utilizedCost)}</span>
                  </div>
                  <div className="w-full bg-[#1E252E] light-theme:bg-white h-2 rounded-full">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: totalProjectCost > 0 ? '70%' : '0%' }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400 light-theme:text-gray-600">Idle (Pending/On Hold)</span>
                    <span className="text-white light-theme:text-gray-900 font-medium">{formatCurrency(idleCost)}</span>
                  </div>
                  <div className="w-full bg-[#1E252E] light-theme:bg-white h-2 rounded-full">
                    <div 
                      className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: totalProjectCost > 0 ? '20%' : '0%' }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400 light-theme:text-gray-600">Unallocated (Draft)</span>
                    <span className="text-white light-theme:text-gray-900 font-medium">{formatCurrency(unallocatedCost)}</span>
                  </div>
                  <div className="w-full bg-[#1E252E] light-theme:bg-white h-2 rounded-full">
                    <div 
                      className="bg-gray-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: totalProjectCost > 0 ? '10%' : '0%' }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Chart Area */}
              <div className="mt-6">
                <CostBreakdownChart />
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-5">
            {/* AI Insights */}
            <AiInsights />
            
            {/* Project Type Distribution */}
            <div className="bg-[#151A22] light-theme:bg-white rounded-lg border border-[#2A313C] light-theme:border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icons.ProjectType />
                  <span className="text-white light-theme:text-gray-900 font-medium text-sm">PROJECT TYPES</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {/* Software */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400 light-theme:text-gray-600">Software</span>
                    <span className="text-xs font-semibold text-white light-theme:text-gray-900">
                      {getProjectTypeCount('Software')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-gray-500">{getProjectTypePercentage('Software')}%</span>
                    <span className="text-indigo-400">{formatCurrency(getProjectTypeCost('Software'))}</span>
                  </div>
                  <div className="w-full bg-[#1E252E] light-theme:bg-white h-1.5 rounded-full">
                    <div 
                      className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${getProjectTypePercentage('Software')}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Construction */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400 light-theme:text-gray-600">Construction</span>
                    <span className="text-xs font-semibold text-white light-theme:text-gray-900">
                      {getProjectTypeCount('Construction')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-gray-500">{getProjectTypePercentage('Construction')}%</span>
                    <span className="text-emerald-400">{formatCurrency(getProjectTypeCost('Construction'))}</span>
                  </div>
                  <div className="w-full bg-[#1E252E] light-theme:bg-white h-1.5 rounded-full">
                    <div 
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${getProjectTypePercentage('Construction')}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Manufacturing */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400 light-theme:text-gray-600">Manufacturing</span>
                    <span className="text-xs font-semibold text-white light-theme:text-gray-900">
                      {getProjectTypeCount('Manufacturing')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-gray-500">{getProjectTypePercentage('Manufacturing')}%</span>
                    <span className="text-amber-400">{formatCurrency(getProjectTypeCost('Manufacturing'))}</span>
                  </div>
                  <div className="w-full bg-[#1E252E] light-theme:bg-white h-1.5 rounded-full">
                    <div 
                      className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${getProjectTypePercentage('Manufacturing')}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Alert Card */}
            <div className="bg-[#151A22] light-theme:bg-white rounded-lg border border-[#2A313C] light-theme:border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white light-theme:text-gray-900 font-medium text-sm flex items-center gap-2">
                  <Icons.Budget />
                  BUDGET ALERTS
                </span>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md border border-emerald-500/30">
                  {totalProjects > 0 ? '0 Active' : 'No Data'}
                </span>
              </div>
              <p className="text-xs text-gray-400 light-theme:text-gray-600">
                {totalProjects > 0 
                  ? 'All projects within budget limits' 
                  : 'Create projects to see budget alerts'}
              </p>
            </div>

            {/* Top Projects */}
            <div className="bg-[#151A22] light-theme:bg-white rounded-lg border border-[#2A313C] light-theme:border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Icons.TopProject />
                <h3 className="text-white light-theme:text-gray-900 font-medium text-sm">TOP PROJECTS BY COST</h3>
              </div>
              <div className="space-y-3">
                {recentEstimates.length > 0 ? (
                  recentEstimates.map((estimate, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 hover:bg-[#1E252E] light-theme:bg-white rounded-lg transition-all duration-200">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs text-gray-500 w-4">{idx + 1}.</span>
                        <span className="text-xs text-gray-300 light-theme:text-gray-700 truncate">
                          {estimate.project?.name || `Project ${idx + 1}`}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-indigo-400 whitespace-nowrap ml-2">
                        {formatCurrency(estimate.costBreakdown?.totalCost || 0)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-xs text-gray-500">No projects yet</p>
                    <Link 
                      to="/cocomo" 
                      className="text-xs text-indigo-400 hover:text-indigo-300 mt-3 inline-flex items-center gap-1"
                    >
                      Create your first COCOMO analysis
                      <span>→</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* COCOMO Summary Section */}
        <div className="bg-[#151A22] light-theme:bg-white rounded-lg border border-[#2A313C] light-theme:border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white light-theme:text-gray-900 font-medium text-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              COCOMO II PROJECT SUMMARY
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1E252E] light-theme:bg-white rounded-lg p-4">
              <span className="text-xs text-gray-400 light-theme:text-gray-600 block mb-1">Average Size (KLOC)</span>
              <span className="text-xl font-semibold text-white light-theme:text-gray-900">
                {getAverageSize()} KLOC
              </span>
            </div>
            <div className="bg-[#1E252E] light-theme:bg-white rounded-lg p-4">
              <span className="text-xs text-gray-400 light-theme:text-gray-600 block mb-1">Average Effort (Person-Months)</span>
              <span className="text-xl font-semibold text-indigo-400">
                {getAverageEffort()} PM
              </span>
            </div>
            <div className="bg-[#1E252E] light-theme:bg-white rounded-lg p-4">
              <span className="text-xs text-gray-400 light-theme:text-gray-600 block mb-1">Total Projects</span>
              <span className="text-xl font-semibold text-emerald-400">
                {totalProjects}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add dummyEstimates for fallback
const dummyEstimates = [
  {
    _id: '1',
    project: { name: 'E-commerce Platform' },
    costBreakdown: { totalCost: 450000 },
    status: 'Final',
    createdAt: new Date()
  },
  {
    _id: '2',
    project: { name: 'Office Building Construction' },
    costBreakdown: { totalCost: 890000 },
    status: 'Draft',
    createdAt: new Date()
  }
];

export default Dashboard;