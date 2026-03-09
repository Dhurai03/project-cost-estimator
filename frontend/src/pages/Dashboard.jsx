import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCurrency } from '../context/CurrencyContext';
import api from '../services/api';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#a855f7', '#3b82f6', '#f59e0b'];

const Dashboard = () => {
  const { formatCurrency } = useCurrency();

  // State for all models
  const [cocomoData, setCocomoData] = useState([]);
  const [fpaData, setFpaData] = useState([]);
  const [analogyData, setAnalogyData] = useState([]);
  const [standardData, setStandardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cocomo, fpa, analogy, standard] = await Promise.allSettled([
        api.get('/cocomo?limit=100'),
        api.get('/function-points?limit=100'),
        api.get('/analogy?limit=100'),
        api.get('/estimates?limit=100'),
      ]);
      if (cocomo.status === 'fulfilled') setCocomoData(cocomo.value.data?.data || []);
      if (fpa.status === 'fulfilled') setFpaData(fpa.value.data?.data || []);
      if (analogy.status === 'fulfilled') setAnalogyData(analogy.value.data?.data || []);
      if (standard.status === 'fulfilled') setStandardData(standard.value.data?.data || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    fetchAll();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // ─── Derived Stats ───────────────────────────────────────────────────────────
  const cocomoCost = cocomoData.reduce((s, a) => s + (a.results?.cost || a.totalCost || 0), 0);
  const fpaCost = fpaData.reduce((s, a) => s + (a.results?.estimatedCost || 0), 0);
  const analogyCost = analogyData.reduce((s, a) => s + (a.results?.estimatedCost || 0), 0);
  const standardCost = standardData.reduce((s, a) => s + (a.costBreakdown?.totalCost || 0), 0);
  const totalAllCost = cocomoCost + fpaCost + analogyCost + standardCost;
  const totalRecords = cocomoData.length + fpaData.length + analogyData.length + standardData.length;

  // Pie chart: cost split by model
  const modelBreakdown = [
    { name: 'COCOMO II', value: cocomoCost, count: cocomoData.length },
    { name: 'FPA', value: fpaCost, count: fpaData.length },
    { name: 'Analogy', value: analogyCost, count: analogyData.length },
    { name: 'Standard', value: standardCost, count: standardData.length },
  ].filter(m => m.value > 0);

  // Bar chart: count by model
  const modelCounts = [
    { name: 'COCOMO II', count: cocomoData.length, color: '#10b981' },
    { name: 'FPA', count: fpaData.length, color: '#a855f7' },
    { name: 'Analogy', count: analogyData.length, color: '#3b82f6' },
    { name: 'Standard', count: standardData.length, color: '#6366f1' },
  ];

  // Area chart: activity over time (last 7 days using all records)
  const buildActivityChart = () => {
    const allRecords = [
      ...cocomoData.map(d => ({ date: d.createdAt, cost: d.results?.cost || d.totalCost || 0 })),
      ...fpaData.map(d => ({ date: d.createdAt, cost: d.results?.estimatedCost || 0 })),
      ...analogyData.map(d => ({ date: d.createdAt, cost: d.results?.estimatedCost || 0 })),
      ...standardData.map(d => ({ date: d.createdAt, cost: d.costBreakdown?.totalCost || 0 })),
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Group by day
    const byDay = {};
    allRecords.forEach(r => {
      if (!r.date) return;
      const day = new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!byDay[day]) byDay[day] = { day, cost: 0, count: 0 };
      byDay[day].cost += r.cost;
      byDay[day].count += 1;
    });

    const result = Object.values(byDay).slice(-14);
    return result.length > 0 ? result : [{ day: 'No data', cost: 0, count: 0 }];
  };

  const activityData = buildActivityChart();

  // Recent activity (last 5 records across all models)
  const recentActivity = [
    ...cocomoData.map(d => ({ id: d._id, type: 'COCOMO II', name: d.project?.name || d.name || 'COCOMO', cost: d.results?.cost || d.totalCost || 0, date: d.createdAt, color: 'emerald' })),
    ...fpaData.map(d => ({ id: d._id, type: 'FPA', name: d.project?.name || 'FPA Analysis', cost: d.results?.estimatedCost || 0, date: d.createdAt, color: 'purple' })),
    ...analogyData.map(d => ({ id: d._id, type: 'Analogy', name: d.project?.name || 'Analogy Est.', cost: d.results?.estimatedCost || 0, date: d.createdAt, color: 'blue' })),
    ...standardData.map(d => ({ id: d._id, type: 'Standard', name: d.project?.name || 'Standard', cost: d.costBreakdown?.totalCost || 0, date: d.createdAt, color: 'indigo' })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const colorMap = { emerald: 'text-emerald-400 bg-emerald-500/10', purple: 'text-purple-400 bg-purple-500/10', blue: 'text-blue-400 bg-blue-500/10', indigo: 'text-indigo-400 bg-indigo-500/10' };

  const StatCard = ({ title, value, subtitle, icon, accent }) => (
    <div className={`bg-[#151A22] rounded-xl border border-[#2A313C] p-5 relative overflow-hidden group hover:border-${accent}-500/40 transition-all duration-300`}>
      <div className={`absolute top-0 right-0 w-24 h-24 bg-${accent}-500/5 rounded-full -translate-y-8 translate-x-8 group-hover:bg-${accent}-500/10 transition-all`} />
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg bg-${accent}-500/10 text-${accent}-400`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-gray-400">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="bg-[#1E252E] border border-[#2A313C] rounded-lg p-3 shadow-xl">
        <p className="text-xs text-gray-400 mb-2">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }} className="text-sm font-medium">
            {entry.name}: {entry.name === 'Cost' ? formatCurrency(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0F15] light-theme:bg-gray-50">
      <Navbar />
      <div className="container-custom py-8">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white light-theme:text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">
              Live overview across all estimation models · Last updated {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAll}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-[#151A22] border border-[#2A313C] rounded-lg text-sm text-gray-300 hover:text-white hover:border-indigo-500/50 transition-all disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <Link to="/fpa" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors">
              + New Estimate
            </Link>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Estimated Cost"
            value={loading ? '...' : formatCurrency(totalAllCost)}
            subtitle="All models combined"
            accent="indigo"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard
            title="Total Analyses"
            value={loading ? '...' : totalRecords}
            subtitle={`COCOMO: ${cocomoData.length} · FPA: ${fpaData.length} · Analogy: ${analogyData.length}`}
            accent="emerald"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          />
          <StatCard
            title="FPA Total Cost"
            value={loading ? '...' : formatCurrency(fpaCost)}
            subtitle={`${fpaData.length} function point analyses`}
            accent="purple"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          />
          <StatCard
            title="Average Cost / Analysis"
            value={loading ? '...' : formatCurrency(totalRecords ? totalAllCost / totalRecords : 0)}
            subtitle="Across all estimation types"
            accent="blue"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Area Chart: Activity over time */}
          <div className="lg:col-span-2 bg-[#151A22] rounded-xl border border-[#2A313C] p-6">
            <h2 className="text-base font-semibold text-white mb-1">Estimation Activity</h2>
            <p className="text-xs text-gray-500 mb-4">Cost trends across all models over time</p>
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A313C" />
                  <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickFormatter={v => v > 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="cost" name="Cost" stroke="#6366f1" strokeWidth={2} fill="url(#costGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie Chart: Cost by model */}
          <div className="bg-[#151A22] rounded-xl border border-[#2A313C] p-6">
            <h2 className="text-base font-semibold text-white mb-1">Cost by Model</h2>
            <p className="text-xs text-gray-500 mb-4">Breakdown across techniques</p>
            {loading || modelBreakdown.length === 0 ? (
              <div className="h-48 flex items-center justify-center">
                {loading ? (
                  <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                ) : (
                  <p className="text-gray-500 text-sm">No cost data yet</p>
                )}
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={modelBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {modelBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={v => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {modelBreakdown.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-gray-400">{item.name}</span>
                      </div>
                      <span className="text-white font-medium">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Bar Chart: Estimates per model */}
          <div className="bg-[#151A22] rounded-xl border border-[#2A313C] p-6">
            <h2 className="text-base font-semibold text-white mb-1">Analyses by Model</h2>
            <p className="text-xs text-gray-500 mb-4">Count per estimation technique</p>
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={modelCounts} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A313C" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Records" radius={[4, 4, 0, 0]}>
                    {modelCounts.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-[#151A22] rounded-xl border border-[#2A313C] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-white">Recent Activity</h2>
                <p className="text-xs text-gray-500">Latest estimates across all models</p>
              </div>
              <Link to="/history" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">View all →</Link>
            </div>
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center gap-3">
                <div className="text-4xl opacity-20">📊</div>
                <p className="text-gray-500 text-sm">No estimates yet</p>
                <Link to="/fpa" className="text-xs text-indigo-400 hover:text-indigo-300">Create your first estimate →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#0B0F15] border border-[#2A313C] hover:border-[#3A424F] transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${colorMap[item.color]}`}>
                        {item.type}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-white">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{formatCurrency(item.cost)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Access Tools */}
        <div className="bg-[#151A22] rounded-xl border border-[#2A313C] p-6">
          <h2 className="text-base font-semibold text-white mb-1">Estimation Tools</h2>
          <p className="text-xs text-gray-500 mb-4">Choose an estimation method to get started</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                to: '/fpa', title: 'Function Point Analysis', desc: 'Estimate cost using function point metrics and value adjustment factors.',
                color: 'purple', icon: '📐'
              },
              {
                to: '/analogy', title: 'Analogy-Based Estimation', desc: 'Estimate by comparing with historical similar projects using AI-powered matching.',
                color: 'blue', icon: '🔍'
              },
              {
                to: '/cocomo', title: 'COCOMO II Model', desc: 'Industry-standard software cost estimation with scale factors and cost drivers.',
                color: 'emerald', icon: '⚙️'
              }
            ].map(tool => (
              <Link
                key={tool.to}
                to={tool.to}
                className={`group p-5 rounded-lg border border-[#2A313C] hover:border-${tool.color}-500/40 bg-[#0B0F15] hover:bg-[#0B0F15]/80 transition-all duration-300`}
              >
                <div className="text-2xl mb-3">{tool.icon}</div>
                <h3 className={`text-sm font-semibold text-${tool.color}-400 mb-2 group-hover:text-${tool.color}-300`}>{tool.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{tool.desc}</p>
                <div className={`mt-3 text-xs text-${tool.color}-400/60 group-hover:text-${tool.color}-400 transition-colors`}>
                  Open tool →
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;