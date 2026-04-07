import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useEstimates } from '../hooks/useEstimates';
import { useCurrency } from '../context/CurrencyContext';
import { formatDate } from '../utils/formatters';
import { SkeletonTableRows } from '../components/Skeletons';
import { EmptyTabState, EmptySearch } from '../components/EmptyStates';
import toast from 'react-hot-toast';
import api from '../services/api';

const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const History = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [activeTab, setActiveTab] = useState('fpa');
  const [downloadingPdf, setDownloadingPdf] = useState(null);

  const { formatCurrency } = useCurrency();
  const { estimates, loading, pagination, fetchEstimates, deleteEstimate, exportPDF, exportCSV } = useEstimates();

  const [cocomoAnalyses, setCocomoAnalyses] = useState([]);
  const [cocomoLoading, setCocomoLoading] = useState(false);
  const [fpaAnalyses, setFpaAnalyses] = useState([]);
  const [fpaLoading, setFpaLoading] = useState(false);
  const [analogyAnalyses, setAnalogyAnalyses] = useState([]);
  const [analogyLoading, setAnalogyLoading] = useState(false);

  const fetchCocomo = async () => {
    try {
      setCocomoLoading(true);
      const res = await api.get('/cocomo?limit=100');
      setCocomoAnalyses(res.data?.data || []);
    } catch (err) { console.error('Failed to fetch COCOMO', err); }
    finally { setCocomoLoading(false); }
  };
  const fetchFpa = async () => {
    try {
      setFpaLoading(true);
      const res = await api.get('/function-points?limit=100');
      setFpaAnalyses(res.data?.data || []);
    } catch (err) { console.error('Failed to fetch FPA', err); }
    finally { setFpaLoading(false); }
  };
  const fetchAnalogy = async () => {
    try {
      setAnalogyLoading(true);
      const res = await api.get('/analogy?limit=100');
      setAnalogyAnalyses(res.data?.data || []);
    } catch (err) { console.error('Failed to fetch Analogy', err); }
    finally { setAnalogyLoading(false); }
  };

  useEffect(() => {
    fetchEstimates(1, '');
    fetchCocomo();
    fetchFpa();
    fetchAnalogy();
  }, []);

  const handleExportCocomoPDF = async (id) => {
    if (downloadingPdf) return;
    try {
      setDownloadingPdf(id);
      const response = await api.get(`/cocomo/${id}/export/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cocomo-${id.slice(-6)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch { toast.error('Failed to export PDF'); }
    finally { setDownloadingPdf(null); }
  };

  const handleCocomoDelete = async (id) => {
    if (deletingId === id) return;
    if (!window.confirm('Delete this COCOMO analysis?')) return;
    setDeletingId(id);
    try { await api.delete('/cocomo/' + id); toast.success('Analysis deleted!'); fetchCocomo(); }
    catch { toast.error('Failed to delete'); }
    finally { setDeletingId(null); }
  };
  const handleFpaDelete = async (id) => {
    if (deletingId === id) return;
    if (!window.confirm('Delete this FPA analysis?')) return;
    setDeletingId(id);
    try { await api.delete('/function-points/' + id); toast.success('FPA deleted!'); fetchFpa(); }
    catch { toast.error('Failed to delete'); }
    finally { setDeletingId(null); }
  };
  const handleAnalogyDelete = async (id) => {
    if (deletingId === id) return;
    if (!window.confirm('Delete this Analogy estimation?')) return;
    setDeletingId(id);
    try { await api.delete('/analogy/' + id); toast.success('Estimation deleted!'); fetchAnalogy(); }
    catch { toast.error('Failed to delete'); }
    finally { setDeletingId(null); }
  };
  const handleDelete = async (id) => {
    if (deletingId === id) return;
    if (!window.confirm('Delete this estimate?')) return;
    setDeletingId(id);
    try { await deleteEstimate(id); toast.success('Estimate deleted!'); fetchEstimates(pagination.page, filter); }
    catch { toast.error('Failed to delete'); }
    finally { setDeletingId(null); }
  };

  const handlePageChange = (newPage) => fetchEstimates(newPage, filter);
  const handleFilterChange = (status) => { setFilter(status); fetchEstimates(1, status); };

  const s = searchTerm.toLowerCase();
  const filteredEstimates = estimates.filter(e => e.project?.name?.toLowerCase().includes(s) || e.estimateNumber?.toLowerCase().includes(s));
  const filteredCocomo = cocomoAnalyses.filter(a => a.project?.name?.toLowerCase().includes(s) || a._id?.toLowerCase().includes(s) || a.name?.toLowerCase().includes(s));
  const filteredFpa = fpaAnalyses.filter(a => a.project?.name?.toLowerCase().includes(s) || a._id?.toLowerCase().includes(s));
  const filteredAnalogy = analogyAnalyses.filter(a => a.project?.name?.toLowerCase().includes(s) || a._id?.toLowerCase().includes(s));

  const totalAll = (pagination.total || 0) + cocomoAnalyses.length + fpaAnalyses.length + analogyAnalyses.length;

  const tabs = [
    { id: 'fpa', label: 'Function Point Analysis', color: 'purple', count: fpaAnalyses.length },
    { id: 'analogy', label: 'Analogy Estimation', color: 'blue', count: analogyAnalyses.length },
    { id: 'cocomo', label: 'COCOMO II', color: 'emerald', count: cocomoAnalyses.length },
    { id: 'standard', label: 'Standard (Legacy)', color: 'indigo', count: pagination.total || 0 },
  ];

  const DeleteBtn = ({ id, onClick }) => (
    <button
      onClick={() => onClick(id)}
      disabled={deletingId === id}
      title="Delete"
      className={`p-1.5 rounded-md transition-all duration-200 ${deletingId === id ? 'text-gray-600 cursor-not-allowed' : 'text-gray-500 hover:text-rose-400 hover:bg-[#2A313C]'}`}
    >
      {deletingId === id ? (
        <div className="w-5 h-5 border-2 border-gray-500 border-t-rose-400 rounded-full animate-spin" />
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )}
    </button>
  );

  // Helper to determine which loading/empty state to render
  const isCurrentTabLoading = () => {
    if (activeTab === 'fpa') return fpaLoading;
    if (activeTab === 'analogy') return analogyLoading;
    if (activeTab === 'cocomo') return cocomoLoading;
    if (activeTab === 'standard') return loading;
    return false;
  };

  const getCurrentTabData = () => {
    if (activeTab === 'fpa') return filteredFpa;
    if (activeTab === 'analogy') return filteredAnalogy;
    if (activeTab === 'cocomo') return filteredCocomo;
    if (activeTab === 'standard') return filteredEstimates;
    return [];
  };

  const tabEmptyConfig = {
    fpa: { icon: '📐', title: 'No FPA analyses found', desc: 'Use the Function Point Analysis page to create one.', action: 'Create FPA Analysis', path: '/fpa' },
    analogy: { icon: '🔍', title: 'No Analogy estimations found', desc: 'Use the Analogy Estimation page to create one.', action: 'Create Analogy', path: '/analogy' },
    cocomo: { icon: '⚙️', title: 'No COCOMO analyses found', desc: 'Use the COCOMO II page to create one.', action: 'Create COCOMO', path: '/cocomo' },
    standard: { icon: '📋', title: 'No estimates found', desc: 'Try adjusting filters or create a new estimate.', action: null, path: null },
  };

  return (
    <div className="min-h-screen bg-[#05070A] light-theme:bg-gray-50 relative overflow-hidden">
      {/* Ambient Backgrounds */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <Navbar />
      <motion.div
        className="container-custom py-8 relative z-10"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-1">Estimate History</h1>
            <p className="text-gray-400 text-sm">View and manage all your estimates across all models</p>
          </div>
          <div className="glass-panel px-5 py-3">
            <span className="text-sm text-gray-400 mr-2">Total Records:</span>
            <span className="text-lg font-bold text-indigo-400">{totalAll}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap border-b border-[#2A313C] light-theme:border-gray-200 mb-4 gap-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-5 py-3 text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                  ? `border-b-2 border-indigo-500 text-indigo-400`
                  : 'border-b-2 border-transparent text-gray-400 hover:text-white'
                }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-medium ${activeTab === tab.id
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'bg-[#2A313C] text-gray-500'
                  }`}>
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                  layoutId="activeTab"
                  transition={{ type: 'spring', duration: 0.4 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="glass-panel p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {activeTab === 'standard' && (
                <>
                  <span className="text-sm text-gray-400 mr-1">Filter:</span>
                  {['', 'Draft', 'Final', 'Archived'].map(status => (
                    <button
                      key={status || 'all'}
                      onClick={() => handleFilterChange(status)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${filter === status
                          ? status === '' ? 'bg-indigo-600 text-white' : status === 'Draft' ? 'bg-amber-600 text-white' : status === 'Final' ? 'bg-emerald-600 text-white' : 'bg-gray-600 text-white'
                          : 'bg-[#1E252E] text-gray-400 hover:text-white hover:bg-[#2A313C] border border-[#2A313C]'
                        }`}
                    >
                      {status || 'All'}
                    </button>
                  ))}
                </>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full md:w-64 pl-9 pr-3 py-2 bg-[#0B0F15] border border-[#2A313C]/50 rounded-md text-white text-sm placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-inner"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="glass-panel overflow-hidden neon-border"
          >
            {/* Show search empty state before table only when searching with no results */}
            {searchTerm && !isCurrentTabLoading() && getCurrentTabData().length === 0 ? (
              <div className="py-4">
                <EmptySearch query={searchTerm} onClear={() => setSearchTerm('')} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#0B0F15] border-b border-[#2A313C]/50">
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Project</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Est. Cost</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>

                    {/* Loading skeleton */}
                    {isCurrentTabLoading() && <SkeletonTableRows rows={5} cols={6} />}

                    {/* FPA Tab */}
                    {!isCurrentTabLoading() && activeTab === 'fpa' && (
                      filteredFpa.length === 0 ? (
                        <EmptyTabState
                          icon={tabEmptyConfig.fpa.icon}
                          title={tabEmptyConfig.fpa.title}
                          description={tabEmptyConfig.fpa.desc}
                          actionLabel={tabEmptyConfig.fpa.action}
                          onAction={() => navigate(tabEmptyConfig.fpa.path)}
                        />
                      ) : filteredFpa.map(analysis => (
                        <motion.tr
                          key={analysis._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-[#2A313C]/50 hover:bg-white/5 transition-colors duration-200"
                        >
                          <td className="px-6 py-4"><span className="text-xs font-mono font-medium text-purple-400">FPA-{analysis._id.slice(-6)}</span></td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-white">{analysis.project?.name || 'Untitled'}</div>
                            <div className="text-xs text-gray-500 mt-0.5">Function Points</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">{formatDate(analysis.createdAt)}</td>
                          <td className="px-6 py-4"><span className="text-sm font-semibold text-purple-400">{formatCurrency(analysis.results?.estimatedCost)}</span></td>
                          <td className="px-6 py-4"><span className="inline-block text-xs px-2 py-1 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30">{analysis.status || 'Draft'}</span></td>
                          <td className="px-6 py-4"><DeleteBtn id={analysis._id} onClick={handleFpaDelete} /></td>
                        </motion.tr>
                      ))
                    )}

                    {/* Analogy Tab */}
                    {!isCurrentTabLoading() && activeTab === 'analogy' && (
                      filteredAnalogy.length === 0 ? (
                        <EmptyTabState
                          icon={tabEmptyConfig.analogy.icon}
                          title={tabEmptyConfig.analogy.title}
                          description={tabEmptyConfig.analogy.desc}
                          actionLabel={tabEmptyConfig.analogy.action}
                          onAction={() => navigate(tabEmptyConfig.analogy.path)}
                        />
                      ) : filteredAnalogy.map(analysis => (
                        <motion.tr
                          key={analysis._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-[#2A313C]/50 hover:bg-white/5 transition-colors duration-200"
                        >
                          <td className="px-6 py-4"><span className="text-xs font-mono font-medium text-blue-400">ANL-{analysis._id.slice(-6)}</span></td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-white">{analysis.project?.name || 'Untitled'}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{analysis.features?.projectType || 'Analogy'}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">{formatDate(analysis.createdAt)}</td>
                          <td className="px-6 py-4"><span className="text-sm font-semibold text-blue-400">{formatCurrency(analysis.results?.estimatedCost)}</span></td>
                          <td className="px-6 py-4">
                            <span className={`inline-block text-xs px-2 py-1 rounded-md border ${analysis.results?.riskLevel === 'Low' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                analysis.results?.riskLevel === 'High' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                                  'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              }`}>
                              {analysis.results?.riskLevel || 'Medium'} Risk
                            </span>
                          </td>
                          <td className="px-6 py-4"><DeleteBtn id={analysis._id} onClick={handleAnalogyDelete} /></td>
                        </motion.tr>
                      ))
                    )}

                    {/* COCOMO Tab */}
                    {!isCurrentTabLoading() && activeTab === 'cocomo' && (
                      filteredCocomo.length === 0 ? (
                        <EmptyTabState
                          icon={tabEmptyConfig.cocomo.icon}
                          title={tabEmptyConfig.cocomo.title}
                          description={tabEmptyConfig.cocomo.desc}
                          actionLabel={tabEmptyConfig.cocomo.action}
                          onAction={() => navigate(tabEmptyConfig.cocomo.path)}
                        />
                      ) : filteredCocomo.map(analysis => (
                        <motion.tr
                          key={analysis._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-[#2A313C]/50 hover:bg-white/5 transition-colors duration-200"
                        >
                          <td className="px-6 py-4"><span className="text-xs font-mono font-medium text-emerald-400">CCM-{analysis._id.slice(-6)}</span></td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-white">{analysis.project?.name || analysis.name || 'Untitled'}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{analysis.modelType || 'COCOMO II'}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">{formatDate(analysis.createdAt)}</td>
                          <td className="px-6 py-4"><span className="text-sm font-semibold text-emerald-400">{formatCurrency(analysis.results?.cost || analysis.totalCost)}</span></td>
                          <td className="px-6 py-4"><span className="inline-block text-xs px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">{analysis.status || 'Draft'}</span></td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleExportCocomoPDF(analysis._id)}
                                disabled={downloadingPdf === analysis._id || deletingId === analysis._id}
                                title="Export PDF"
                                className="p-1.5 text-gray-500 hover:text-indigo-400 hover:bg-[#2A313C] rounded-md transition-all duration-200"
                              >
                                {downloadingPdf === analysis._id
                                  ? <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                  : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                }
                              </button>
                              <DeleteBtn id={analysis._id} onClick={handleCocomoDelete} />
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}

                    {/* Standard Tab */}
                    {!isCurrentTabLoading() && activeTab === 'standard' && (
                      filteredEstimates.length === 0 ? (
                        <EmptyTabState
                          icon={tabEmptyConfig.standard.icon}
                          title={tabEmptyConfig.standard.title}
                          description={tabEmptyConfig.standard.desc}
                          actionLabel={null}
                          onAction={null}
                        />
                      ) : filteredEstimates.map(estimate => (
                        <motion.tr
                          key={estimate._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-[#2A313C]/50 hover:bg-white/5 transition-colors duration-200"
                        >
                          <td className="px-6 py-4"><span className="text-xs font-mono font-medium text-indigo-400">{estimate.estimateNumber}</span></td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-white">{estimate.project?.name || 'Untitled'}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{estimate.project?.projectType || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">{formatDate(estimate.createdAt)}</td>
                          <td className="px-6 py-4"><span className="text-sm font-semibold text-indigo-400">{formatCurrency(estimate.costBreakdown?.totalCost)}</span></td>
                          <td className="px-6 py-4">
                            <span className={`inline-block text-xs px-2 py-1 rounded-md border ${estimate.status === 'Final' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                estimate.status === 'Archived' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' :
                                  'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              }`}>{estimate.status}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <button onClick={() => exportPDF(estimate._id)} disabled={deletingId === estimate._id} title="Export PDF" className="p-1.5 text-gray-500 hover:text-indigo-400 hover:bg-[#2A313C] rounded-md transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                              </button>
                              <button onClick={() => exportCSV(estimate._id)} disabled={deletingId === estimate._id} title="Export CSV" className="p-1.5 text-gray-500 hover:text-emerald-400 hover:bg-[#2A313C] rounded-md transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                              </button>
                              <DeleteBtn id={estimate._id} onClick={handleDelete} />
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}

                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {activeTab === 'standard' && pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-[#2A313C] flex items-center justify-between">
                <p className="text-sm text-gray-400">Page {pagination.page} of {pagination.pages}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} className="px-3 py-1.5 bg-[#1E252E] border border-[#2A313C] rounded-md text-sm text-gray-400 hover:text-white hover:bg-[#2A313C] disabled:opacity-50 disabled:cursor-not-allowed transition-all">Previous</button>
                  <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.pages} className="px-3 py-1.5 bg-[#1E252E] border border-[#2A313C] rounded-md text-sm text-gray-400 hover:text-white hover:bg-[#2A313C] disabled:opacity-50 disabled:cursor-not-allowed transition-all">Next</button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </motion.div>
    </div>
  );
};

export default History;