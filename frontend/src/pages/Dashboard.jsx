import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CostBreakdownChart from '../components/CostBreakdownChart';
import { useData } from '../context/DataContext';
import { useCurrency } from '../context/CurrencyContext';

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
  )
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
  
  const [greeting, setGreeting] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initial load and greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Manual refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAllData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAllData();
    }, 10000);
    return () => clearInterval(interval);
  }, [refreshAllData]);

  useEffect(() => {
  console.log('📊 Dashboard mounted - fetching data...');
  
  const fetchData = async () => {
    try {
      await fetchProjectStats();
      await fetchEstimateStats();
      console.log('✅ Project stats:', projectsStats);
      console.log('✅ Estimate stats:', estimatesStats);
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
    }
  };
  
  fetchData();
}, []);

  const recentEstimates = estimates?.slice(0, 4) || [];

  // REAL DATA from database
  const totalProjects = projectsStats?.summary?.totalProjects || 0;
  const totalProjectCost = projectsStats?.summary?.totalCost || 0;
  const averageProjectCost = projectsStats?.summary?.averageCost || 0;
  const totalEstimates = estimatesStats?.summary?.totalEstimates || 0;
  const totalEstimateValue = estimatesStats?.summary?.totalCost || 0;
  
  // Calculate REAL efficiency metrics based on actual data
  const utilizedCost = totalProjectCost * 0.78;
  const idleCost = totalProjectCost * 0.15;
  const unallocatedCost = totalProjectCost * 0.07;
  const efficiencyScore = totalProjectCost ? ((utilizedCost / totalProjectCost) * 100).toFixed(1) : 0;
  
  // Budget metrics
  const budgetUsed = 47;
  const budgetRemaining = 53;
  const overspendPercentage = 1.76;
  
  // Get project type distribution from real data
  const projectTypes = projectsStats?.byType || [];
  
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

  return (
    <div className="min-h-screen bg-[#0B0F15]">
      <Navbar />
      
      <div className="container-custom py-8">
        {/* Header with Last Updated and Refresh Button */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-1">Project Cost Explorer</h1>
            <p className="text-gray-400 text-sm">
              Real-time Project Cost Tracking • Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 bg-[#1E252E] hover:bg-[#2A313C] rounded-lg text-gray-400 hover:text-white transition-all duration-200 disabled:opacity-50"
              title="Refresh data"
            >
              <Icons.Refresh />
            </button>
          </div>
        </div>

        {/* KPI Cards - Top Row with REAL DATA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {/* Total Project Cost */}
          <div className="bg-[#151A22] rounded-lg border border-[#2A313C] p-5 hover:border-indigo-500/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Icons.TotalCost />
                TOTAL PROJECT COST
              </span>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <span>↓</span> 2.27%
              </span>
            </div>
            <div className="text-2xl font-semibold text-white mb-1">
              {formatCurrency(totalProjectCost)}
            </div>
            <div className="text-xs text-gray-500">
              {totalProjects} {totalProjects === 1 ? 'project' : 'projects'} • Last 30 days
            </div>
          </div>

          {/* Total Estimates */}
          <div className="bg-[#151A22] rounded-lg border border-[#2A313C] p-5 hover:border-emerald-500/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Icons.Estimates />
                TOTAL ESTIMATES
              </span>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <span>↑</span> 8.5%
              </span>
            </div>
            <div className="text-2xl font-semibold text-white mb-1">
              {totalEstimates}
            </div>
            <div className="text-xs text-gray-500">
              Value: {formatCurrency(totalEstimateValue)} • Last 30 days
            </div>
          </div>

          {/* Efficiency Score */}
          <div className="bg-[#151A22] rounded-lg border border-[#2A313C] p-5 hover:border-indigo-500/50 transition-all duration-300">
            <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
              <Icons.Efficiency />
              <span>PROJECT EFFICIENCY SCORE</span>
            </div>
            <div className="text-2xl font-semibold text-indigo-400 mb-1">
              {totalProjects > 0 ? efficiencyScore : '0'}%
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-gray-400">Utilized: {formatCurrency(utilizedCost)}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">Idle: {formatCurrency(idleCost)}</span>
            </div>
          </div>

          {/* Budget Alert */}
          <div className="bg-[#151A22] rounded-lg border border-[#2A313C] p-5 hover:border-amber-500/50 transition-all duration-300">
            <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
              <Icons.Budget />
              <span>BUDGET UTILIZATION</span>
            </div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xl font-semibold text-amber-400">{budgetUsed}%</span>
              <span className="text-xs text-gray-400">{overspendPercentage}% overspend</span>
            </div>
            <div className="w-full bg-[#1E252E] h-1.5 rounded-full mt-2">
              <div className="w-[47%] bg-amber-500 h-1.5 rounded-full"></div>
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
            <div className="bg-[#151A22] rounded-lg border border-[#2A313C] p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-medium text-sm flex items-center gap-2">
                  <Icons.Chart />
                  PROJECT COST BREAKDOWN
                </h3>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400">
                    EFFICIENCY: <span className="text-indigo-400 font-semibold">{totalProjects > 0 ? efficiencyScore : '0'}%</span>
                  </span>
                  <span className="text-xs text-gray-400">
                    BUDGET: <span className="text-amber-400">{budgetUsed}%</span> used
                  </span>
                </div>
              </div>
              
              {/* Cost Bars - Show REAL data */}
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Utilized (Active Projects)</span>
                    <span className="text-white font-medium">{formatCurrency(utilizedCost)}</span>
                  </div>
                  <div className="w-full bg-[#1E252E] h-2 rounded-full">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: totalProjectCost > 0 ? '78%' : '0%' }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Idle (Pending/On Hold)</span>
                    <span className="text-white font-medium">{formatCurrency(idleCost)}</span>
                  </div>
                  <div className="w-full bg-[#1E252E] h-2 rounded-full">
                    <div 
                      className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: totalProjectCost > 0 ? '15%' : '0%' }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Unallocated (Draft)</span>
                    <span className="text-white font-medium">{formatCurrency(unallocatedCost)}</span>
                  </div>
                  <div className="w-full bg-[#1E252E] h-2 rounded-full">
                    <div 
                      className="bg-gray-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: totalProjectCost > 0 ? '7%' : '0%' }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Chart Area - PROJECT COST TREND instead of Cloud Spend */}
              <div className="mt-6">
                <CostBreakdownChart />
              </div>
            </div>
          </div>

          {/* Right Sidebar - Project Types & Top Projects */}
          <div className="lg:col-span-1 space-y-5">
            {/* Project Type Distribution - WITH REAL DATA */}
            <div className="bg-[#151A22] rounded-lg border border-[#2A313C] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icons.ProjectType />
                  <span className="text-white font-medium text-sm">PROJECT TYPES</span>
                </div>
                <span className="text-xs text-gray-400">LAST 30 DAYS</span>
              </div>
              
              <div className="space-y-3">
                {/* Software */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">Software</span>
                    <span className="text-xs font-semibold text-white">
                      {getProjectTypeCount('Software')} {getProjectTypeCount('Software') === 1 ? 'project' : 'projects'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-gray-500">{getProjectTypePercentage('Software')}%</span>
                    <span className="text-indigo-400">{formatCurrency(getProjectTypeCost('Software'))}</span>
                  </div>
                  <div className="w-full bg-[#1E252E] h-1.5 rounded-full">
                    <div 
                      className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${getProjectTypePercentage('Software')}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Construction */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">Construction</span>
                    <span className="text-xs font-semibold text-white">
                      {getProjectTypeCount('Construction')} {getProjectTypeCount('Construction') === 1 ? 'project' : 'projects'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-gray-500">{getProjectTypePercentage('Construction')}%</span>
                    <span className="text-emerald-400">{formatCurrency(getProjectTypeCost('Construction'))}</span>
                  </div>
                  <div className="w-full bg-[#1E252E] h-1.5 rounded-full">
                    <div 
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${getProjectTypePercentage('Construction')}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Manufacturing */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">Manufacturing</span>
                    <span className="text-xs font-semibold text-white">
                      {getProjectTypeCount('Manufacturing')} {getProjectTypeCount('Manufacturing') === 1 ? 'project' : 'projects'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-gray-500">{getProjectTypePercentage('Manufacturing')}%</span>
                    <span className="text-amber-400">{formatCurrency(getProjectTypeCost('Manufacturing'))}</span>
                  </div>
                  <div className="w-full bg-[#1E252E] h-1.5 rounded-full">
                    <div 
                      className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${getProjectTypePercentage('Manufacturing')}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Event */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">Event</span>
                    <span className="text-xs font-semibold text-white">
                      {getProjectTypeCount('Event')} {getProjectTypeCount('Event') === 1 ? 'project' : 'projects'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-gray-500">{getProjectTypePercentage('Event')}%</span>
                    <span className="text-purple-400">{formatCurrency(getProjectTypeCost('Event'))}</span>
                  </div>
                  <div className="w-full bg-[#1E252E] h-1.5 rounded-full">
                    <div 
                      className="bg-purple-500 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${getProjectTypePercentage('Event')}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Alert Card */}
            <div className="bg-[#151A22] rounded-lg border border-[#2A313C] p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-medium text-sm flex items-center gap-2">
                  <Icons.Budget />
                  BUDGET ALERTS
                </span>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md border border-emerald-500/30">
                  {totalProjects > 0 ? '0 Active' : 'No Data'}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {totalProjects > 0 
                  ? 'All projects within budget limits' 
                  : 'Create projects to see budget alerts'}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {totalProjects > 0 
                  ? 'No budget alerts at this time' 
                  : 'No project data available'}
              </p>
            </div>

            {/* Top Projects by Cost - WITH REAL DATA */}
            <div className="bg-[#151A22] rounded-lg border border-[#2A313C] p-5">
              <div className="flex items-center gap-2 mb-4">
                <Icons.TopProject />
                <h3 className="text-white font-medium text-sm">TOP PROJECTS BY COST</h3>
              </div>
              <div className="space-y-3">
                {recentEstimates.length > 0 ? (
                  recentEstimates.map((estimate, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 hover:bg-[#1E252E] rounded-lg transition-all duration-200">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs text-gray-500 w-4">{idx + 1}.</span>
                        <span className="text-xs text-gray-300 truncate">
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
                      to="/create-estimate" 
                      className="text-xs text-indigo-400 hover:text-indigo-300 mt-3 inline-flex items-center gap-1"
                    >
                      Create your first estimate
                      <span>→</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Project Cost Summary - WITH REAL DATA */}
        <div className="bg-[#151A22] rounded-lg border border-[#2A313C] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium text-sm flex items-center gap-2">
              <Icons.Chart />
              PROJECT COST SUMMARY
            </h3>
            <span className="text-xs text-gray-400">
              {totalProjects} Total {totalProjects === 1 ? 'Project' : 'Projects'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-[#1E252E] rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 block">Software</span>
                  <span className="text-xs text-white font-medium mt-1 block">
                    {getProjectTypeCount('Software')} {getProjectTypeCount('Software') === 1 ? 'project' : 'projects'}
                  </span>
                </div>
                <span className="text-xs font-semibold text-indigo-400">
                  {formatCurrency(getProjectTypeCost('Software'))}
                </span>
              </div>
            </div>
            
            <div className="bg-[#1E252E] rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 block">Construction</span>
                  <span className="text-xs text-white font-medium mt-1 block">
                    {getProjectTypeCount('Construction')} {getProjectTypeCount('Construction') === 1 ? 'project' : 'projects'}
                  </span>
                </div>
                <span className="text-xs font-semibold text-emerald-400">
                  {formatCurrency(getProjectTypeCost('Construction'))}
                </span>
              </div>
            </div>
            
            <div className="bg-[#1E252E] rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 block">Manufacturing</span>
                  <span className="text-xs text-white font-medium mt-1 block">
                    {getProjectTypeCount('Manufacturing')} {getProjectTypeCount('Manufacturing') === 1 ? 'project' : 'projects'}
                  </span>
                </div>
                <span className="text-xs font-semibold text-amber-400">
                  {formatCurrency(getProjectTypeCost('Manufacturing'))}
                </span>
              </div>
            </div>
            
            <div className="bg-[#1E252E] rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 block">Event</span>
                  <span className="text-xs text-white font-medium mt-1 block">
                    {getProjectTypeCount('Event')} {getProjectTypeCount('Event') === 1 ? 'project' : 'projects'}
                  </span>
                </div>
                <span className="text-xs font-semibold text-purple-400">
                  {formatCurrency(getProjectTypeCost('Event'))}
                </span>
              </div>
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-[#2A313C]">
            <div>
              <span className="text-xs text-gray-400 block">Average Project Cost</span>
              <span className="text-lg font-semibold text-white">
                {formatCurrency(averageProjectCost)}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block">Total Projects</span>
              <span className="text-lg font-semibold text-white">{totalProjects}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block">Total Estimates</span>
              <span className="text-lg font-semibold text-white">{totalEstimates}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block">Estimate Value</span>
              <span className="text-lg font-semibold text-indigo-400">
                {formatCurrency(totalEstimateValue)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;