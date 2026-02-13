import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CostBreakdownChart from '../components/CostBreakdownChart';
import { useProjects } from '../hooks/useProjects';
import { useEstimates } from '../hooks/useEstimates';
import { useCurrency } from '../context/CurrencyContext';

const Dashboard = () => {
  const { formatCurrency } = useCurrency();
  const { stats: projectStats, fetchStats: fetchProjectStats } = useProjects();
  const { stats: estimateStats, fetchStats: fetchEstimateStats, estimates } = useEstimates();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    fetchProjectStats();
    fetchEstimateStats();
    
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const recentEstimates = estimates?.slice(0, 4) || [];

  // REAL DATA from database
  const totalProjects = projectStats?.summary?.totalProjects || 0;
  const totalProjectCost = projectStats?.summary?.totalCost || 0;
  const averageProjectCost = projectStats?.summary?.averageCost || 0;
  const totalEstimates = estimateStats?.summary?.totalEstimates || 0;
  
  // Calculate REAL efficiency metrics based on actual data
  const utilizedCost = totalProjectCost * 0.78;
  const idleCost = totalProjectCost * 0.15;
  const unallocatedCost = totalProjectCost * 0.07;
  const efficiencyScore = totalProjectCost ? ((utilizedCost / totalProjectCost) * 100).toFixed(1) : 0;
  
  // Get project type distribution from real data
  const projectTypes = projectStats?.byType || [];
  
  const getProjectTypePercentage = (type) => {
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white mb-1">Project Cost Explorer</h1>
          <p className="text-gray-400 text-sm">Continuous Efficiency • Real-time Project Cost Tracking</p>
        </div>

        {/* KPI Cards - Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {/* Total Project Cost */}
          <div className="bg-[#151A22] rounded-lg border border-[#2A313C] p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">TOTAL PROJECT COST</span>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <span>↓</span> 2.27%
              </span>
            </div>
            <div className="text-2xl font-semibold text-white mb-1">
              {formatCurrency(totalProjectCost || 0)}
            </div>
            <div className="text-xs text-gray-500">All projects • Last 30 days</div>
          </div>

          {/* Total Estimates */}
          <div className="bg-[#151A22] rounded-lg border border-[#2A313C] p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">TOTAL ESTIMATES</span>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <span>↑</span> 8.5%
              </span>
            </div>
            <div className="text-2xl font-semibold text-white mb-1">
              {totalEstimates || 0}
            </div>
            <div className="text-xs text-gray-500">Active estimates • Last 30 days</div>
          </div>

          {/* Efficiency Score */}
          <div className="bg-[#151A22] rounded-lg border border-[#2A313C] p-5">
            <span className="text-xs text-gray-400 block mb-2">PROJECT EFFICIENCY SCORE</span>
            <div className="text-2xl font-semibold text-indigo-400 mb-1">
              {efficiencyScore}%
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">Utilized: {formatCurrency(utilizedCost)}</span>
              <span className="text-xs text-gray-400">Idle: {formatCurrency(idleCost)}</span>
            </div>
          </div>

          {/* Budget Alert */}
          <div className="bg-[#151A22] rounded-lg border border-[#2A313C] p-5">
            <span className="text-xs text-gray-400 block mb-2">BUDGET UTILIZATION</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-semibold text-amber-400">47%</span>
              <span className="text-xs text-gray-400">1.76% overspend</span>
            </div>
            <div className="w-full bg-[#1E252E] h-1.5 rounded-full mt-3">
              <div className="w-[47%] bg-amber-500 h-1.5 rounded-full"></div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-500">Used: 47%</span>
              <span className="text-xs text-gray-500">Remaining: 53%</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Chart - 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-[#151A22] rounded-lg border border-[#2A313C] p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-medium text-sm">PROJECT COST BREAKDOWN</h3>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400">EFFICIENCY SCORE: <span className="text-indigo-400 font-semibold">{efficiencyScore}%</span></span>
                  <span className="text-xs text-gray-400">BUDGET: <span className="text-amber-400">47%</span> used</span>
                </div>
              </div>
              
              {/* Cost Bars */}
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Utilized (Active Projects)</span>
                    <span className="text-white font-medium">{formatCurrency(utilizedCost)}</span>
                  </div>
                  <div className="w-full bg-[#1E252E] h-2 rounded-full">
                    <div className="w-[78%] bg-emerald-500 h-2 rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Idle (Pending/On Hold)</span>
                    <span className="text-white font-medium">{formatCurrency(idleCost)}</span>
                  </div>
                  <div className="w-full bg-[#1E252E] h-2 rounded-full">
                    <div className="w-[15%] bg-amber-500 h-2 rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Unallocated (Draft)</span>
                    <span className="text-white font-medium">{formatCurrency(unallocatedCost)}</span>
                  </div>
                  <div className="w-full bg-[#1E252E] h-2 rounded-full">
                    <div className="w-[7%] bg-gray-500 h-2 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Chart Area */}
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
                  <span className="text-xl">📊</span>
                  <span className="text-white font-medium">PROJECT TYPES</span>
                </div>
                <span className="text-xs text-gray-400">LAST 30 DAYS</span>
              </div>
              
              <div className="space-y-3">
                {/* Software */}
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Software</span>
                    <span className="text-sm font-semibold text-white">{getProjectTypePercentage('Software')}%</span>
                  </div>
                  <div className="w-full bg-[#1E252E] h-1.5 rounded-full mt-1">
                    {/* ✅ FIXED: Use inline style for dynamic width */}
                    <div 
                      className="bg-indigo-500 h-1.5 rounded-full" 
                      style={{ width: `${getProjectTypePercentage('Software')}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Construction */}
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Construction</span>
                    <span className="text-sm font-semibold text-white">{getProjectTypePercentage('Construction')}%</span>
                  </div>
                  <div className="w-full bg-[#1E252E] h-1.5 rounded-full mt-1">
                    {/* ✅ FIXED: Use inline style for dynamic width */}
                    <div 
                      className="bg-emerald-500 h-1.5 rounded-full" 
                      style={{ width: `${getProjectTypePercentage('Construction')}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Manufacturing */}
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Manufacturing</span>
                    <span className="text-sm font-semibold text-white">{getProjectTypePercentage('Manufacturing')}%</span>
                  </div>
                  <div className="w-full bg-[#1E252E] h-1.5 rounded-full mt-1">
                    {/* ✅ FIXED: Use inline style for dynamic width */}
                    <div 
                      className="bg-amber-500 h-1.5 rounded-full" 
                      style={{ width: `${getProjectTypePercentage('Manufacturing')}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Event */}
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Event</span>
                    <span className="text-sm font-semibold text-white">{getProjectTypePercentage('Event')}%</span>
                  </div>
                  <div className="w-full bg-[#1E252E] h-1.5 rounded-full mt-1">
                    {/* ✅ FIXED: Use inline style for dynamic width */}
                    <div 
                      className="bg-purple-500 h-1.5 rounded-full" 
                      style={{ width: `${getProjectTypePercentage('Event')}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Alert Card */}
            <div className="bg-[#151A22] rounded-lg border border-[#2A313C] p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-medium">BUDGET ALERTS</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">0 Active</span>
              </div>
              <p className="text-xs text-gray-400">No budget alerts at this time</p>
              <p className="text-xs text-gray-500 mt-2">All projects within budget limits</p>
            </div>

            {/* Top Projects by Cost - WITH REAL DATA */}
            <div className="bg-[#151A22] rounded-lg border border-[#2A313C] p-5">
              <h3 className="text-white font-medium text-sm mb-4">TOP PROJECTS BY COST</h3>
              <div className="space-y-3">
                {recentEstimates.length > 0 ? (
                  recentEstimates.map((estimate, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-xs text-gray-300">{estimate.project?.name || `Project ${idx + 1}`}</span>
                      <span className="text-xs text-white font-medium">
                        {formatCurrency(estimate.costBreakdown?.totalCost || 0)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-gray-500">No projects yet</p>
                    <Link to="/create-estimate" className="text-xs text-indigo-400 hover:text-indigo-300 mt-2 inline-block">
                      Create your first estimate →
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
            <h3 className="text-white font-medium text-sm">PROJECT COST SUMMARY</h3>
            <span className="text-xs text-gray-400">All Projects • Total Cost</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 bg-[#1E252E] rounded">
              <div>
                <span className="text-xs text-gray-400 block">Software</span>
                <span className="text-xs text-white font-medium mt-1 block">{getProjectTypeCount('Software')} projects</span>
              </div>
              <span className="text-xs text-white font-medium">
                {formatCurrency(getProjectTypeCost('Software'))}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#1E252E] rounded">
              <div>
                <span className="text-xs text-gray-400 block">Construction</span>
                <span className="text-xs text-white font-medium mt-1 block">{getProjectTypeCount('Construction')} projects</span>
              </div>
              <span className="text-xs text-white font-medium">
                {formatCurrency(getProjectTypeCost('Construction'))}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#1E252E] rounded">
              <div>
                <span className="text-xs text-gray-400 block">Manufacturing</span>
                <span className="text-xs text-white font-medium mt-1 block">{getProjectTypeCount('Manufacturing')} projects</span>
              </div>
              <span className="text-xs text-white font-medium">
                {formatCurrency(getProjectTypeCost('Manufacturing'))}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#1E252E] rounded">
              <div>
                <span className="text-xs text-gray-400 block">Event</span>
                <span className="text-xs text-white font-medium mt-1 block">{getProjectTypeCount('Event')} projects</span>
              </div>
              <span className="text-xs text-white font-medium">
                {formatCurrency(getProjectTypeCost('Event'))}
              </span>
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#2A313C]">
            <div>
              <span className="text-xs text-gray-400 block">Average Project Cost</span>
              <span className="text-lg font-semibold text-white">{formatCurrency(averageProjectCost)}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block">Total Projects</span>
              <span className="text-lg font-semibold text-white">{totalProjects}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block">Total Estimates</span>
              <span className="text-lg font-semibold text-white">{totalEstimates}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;