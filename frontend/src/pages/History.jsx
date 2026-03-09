import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useEstimates } from '../hooks/useEstimates';
import { useCurrency } from '../context/CurrencyContext';
import { formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';
import api from '../services/api';

const History = () => {
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
    } catch (err) {
      console.error('Failed to fetch COCOMO', err);
    } finally {
      setCocomoLoading(false);
    }
  };

  const fetchFpa = async () => {
    try {
      setFpaLoading(true);
      const res = await api.get('/function-points?limit=100');
      setFpaAnalyses(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch FPA', err);
    } finally {
      setFpaLoading(false);
    }
  };

  const fetchAnalogy = async () => {
    try {
      setAnalogyLoading(true);
      const res = await api.get('/analogy?limit=100');
      setAnalogyAnalyses(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch Analogy', err);
    } finally {
      setAnalogyLoading(false);
    }
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
    } catch (error) {
      toast.error('Failed to export PDF');
    } finally {
      setDownloadingPdf(null);
    }
  };

  const handleCocomoDelete = async (id) => {
    if (deletingId === id) return;
    if (!window.confirm('Delete this COCOMO analysis?')) return;
    setDeletingId(id);
    try {
      await api.delete('/cocomo/' + id);
      toast.success('Analysis deleted!');
      fetchCocomo();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const handleFpaDelete = async (id) => {
    if (deletingId === id) return;
    if (!window.confirm('Delete this FPA analysis?')) return;
    setDeletingId(id);
    try {
      await api.delete('/function-points/' + id);
      toast.success('FPA deleted!');
      fetchFpa();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAnalogyDelete = async (id) => {
    if (deletingId === id) return;
    if (!window.confirm('Delete this Analogy estimation?')) return;
    setDeletingId(id);
    try {
      await api.delete('/analogy/' + id);
      toast.success('Estimation deleted!');
      fetchAnalogy();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (deletingId === id) return;
    if (!window.confirm('Delete this estimate?')) return;
    setDeletingId(id);
    try {
      await deleteEstimate(id);
      toast.success('Estimate deleted!');
      fetchEstimates(pagination.page, filter);
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePageChange = (newPage) => fetchEstimates(newPage, filter);
  const handleFilterChange = (status) => { setFilter(status); fetchEstimates(1, status); };

  const s = searchTerm.toLowerCase();
  const filteredEstimates = estimates.filter(e =>
    e.project?.name?.toLowerCase().includes(s) || e.estimateNumber?.toLowerCase().includes(s)
  );
  const filteredCocomo = cocomoAnalyses.filter(a =>
    a.project?.name?.toLowerCase().includes(s) || a._id?.toLowerCase().includes(s) || a.name?.toLowerCase().includes(s)
  );
  const filteredFpa = fpaAnalyses.filter(a =>
    a.project?.name?.toLowerCase().includes(s) || a._id?.toLowerCase().includes(s)
  );
  const filteredAnalogy = analogyAnalyses.filter(a =>
    a.project?.name?.toLowerCase().includes(s) || a._id?.toLowerCase().includes(s)
  );

  const totalAll = (pagination.total || 0) + cocomoAnalyses.length + fpaAnalyses.length + analogyAnalyses.length;

  const tabs = [
    { id: 'fpa', label: 'Function Point Analysis', color: 'purple' },
    { id: 'analogy', label: 'Analogy Estimation', color: 'blue' },
    { id: 'cocomo', label: 'COCOMO II', color: 'emerald' },
    { id: 'standard', label: 'Standard (Legacy)', color: 'indigo' },
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

  const EmptyRow = ({ cols = 6, message, sub }) => (
    <tr>
      <td colSpan={cols} className="px-6 py-16 text-center">
        <div className="text-4xl mb-3 opacity-30">📋</div>
        <p className="text-gray-400 text-sm mb-1">{message}</p>
        {sub && <p className="text-xs text-gray-500">{sub}</p>}
      </td>
    </tr>
  );

  const LoadingRow = ({ cols = 6 }) => (
    <tr>
      <td colSpan={cols} className="px-6 py-16 text-center">
        <div className="flex justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-[#0B0F15] light-theme:bg-gray-50">
      <Navbar />
      <div className="container-custom py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-white light-theme:text-gray-900 mb-1">Estimate History</h1>
            <p className="text-gray-400 light-theme:text-gray-600 text-sm">View and manage all your estimates across all models</p>
          </div>
          <div className="bg-[#151A22] light-theme:bg-white px-5 py-3 rounded-lg border border-[#2A313C] light-theme:border-gray-200">
            <span className="text-sm text-gray-400 light-theme:text-gray-600 mr-2">Total Records:</span>
            <span className="text-lg font-semibold text-indigo-400">{totalAll}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap border-b border-[#2A313C] light-theme:border-gray-200 mb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium transition-colors ${activeTab === tab.id ? 'border-b-2 border-indigo-500 text-indigo-400' : 'border-b-2 border-transparent text-gray-400 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="bg-[#151A22] light-theme:bg-white rounded-lg border border-[#2A313C] light-theme:border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-center gap-2">
              {activeTab === 'standard' && (
                <>
                  <span className="text-sm text-gray-400 mr-1">Filter:</span>
                  {['', 'Draft', 'Final', 'Archived'].map(status => (
                    <button
                      key={status || 'all'}
                      onClick={() => handleFilterChange(status)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${filter === status
                        ? status === '' ? 'bg-indigo-600 text-white' : status === 'Draft' ? 'bg-amber-600 text-white' : status === 'Final' ? 'bg-emerald-600 text-white' : 'bg-gray-600 text-white'
                        : 'bg-[#1E252E] text-gray-400 hover:text-white hover:bg-[#2A313C] border border-[#2A313C]'}`}
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
                className="w-full md:w-64 pl-9 pr-3 py-2 bg-[#1E252E] light-theme:bg-white border border-[#2A313C] light-theme:border-gray-200 rounded-md text-white light-theme:text-gray-900 text-sm placeholder-gray-500 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all duration-200"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#151A22] light-theme:bg-white rounded-lg border border-[#2A313C] light-theme:border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1E252E] border-b border-[#2A313C]">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Est. Cost</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>

                {/* FPA Tab */}
                {activeTab === 'fpa' && (
                  fpaLoading ? <LoadingRow /> :
                  filteredFpa.length === 0 ? <EmptyRow message="No FPA analyses found" sub="Use the Function Point Analysis page to create one." /> :
                  filteredFpa.map(analysis => (
                    <tr key={analysis._id} className="border-b border-[#2A313C] hover:bg-[#1E252E] transition-colors duration-200">
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono font-medium text-purple-400">FPA-{analysis._id.slice(-6)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">{analysis.project?.name || 'Untitled'}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Function Points</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{formatDate(analysis.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-purple-400">{formatCurrency(analysis.results?.estimatedCost)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block text-xs px-2 py-1 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {analysis.status || 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <DeleteBtn id={analysis._id} onClick={handleFpaDelete} />
                      </td>
                    </tr>
                  ))
                )}

                {/* Analogy Tab */}
                {activeTab === 'analogy' && (
                  analogyLoading ? <LoadingRow /> :
                  filteredAnalogy.length === 0 ? <EmptyRow message="No Analogy estimations found" sub="Use the Analogy Estimation page to create one." /> :
                  filteredAnalogy.map(analysis => (
                    <tr key={analysis._id} className="border-b border-[#2A313C] hover:bg-[#1E252E] transition-colors duration-200">
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono font-medium text-blue-400">ANL-{analysis._id.slice(-6)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">{analysis.project?.name || 'Untitled'}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{analysis.features?.projectType || 'Analogy'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{formatDate(analysis.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-blue-400">{formatCurrency(analysis.results?.estimatedCost)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block text-xs px-2 py-1 rounded-md border ${
                          analysis.results?.riskLevel === 'Low' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                          analysis.results?.riskLevel === 'High' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                          'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}>
                          {analysis.results?.riskLevel || 'Medium'} Risk
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <DeleteBtn id={analysis._id} onClick={handleAnalogyDelete} />
                      </td>
                    </tr>
                  ))
                )}

                {/* COCOMO Tab */}
                {activeTab === 'cocomo' && (
                  cocomoLoading ? <LoadingRow /> :
                  filteredCocomo.length === 0 ? <EmptyRow message="No COCOMO analyses found" sub="Use the COCOMO II page to create one." /> :
                  filteredCocomo.map(analysis => (
                    <tr key={analysis._id} className="border-b border-[#2A313C] hover:bg-[#1E252E] transition-colors duration-200">
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono font-medium text-emerald-400">CCM-{analysis._id.slice(-6)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">{analysis.project?.name || analysis.name || 'Untitled'}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{analysis.modelType || 'COCOMO II'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{formatDate(analysis.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-emerald-400">{formatCurrency(analysis.results?.cost || analysis.totalCost)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block text-xs px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {analysis.status || 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleExportCocomoPDF(analysis._id)}
                            disabled={downloadingPdf === analysis._id || deletingId === analysis._id}
                            title="Export PDF"
                            className="p-1.5 text-gray-500 hover:text-indigo-400 hover:bg-[#2A313C] rounded-md transition-all duration-200"
                          >
                            {downloadingPdf === analysis._id ? (
                              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                          <DeleteBtn id={analysis._id} onClick={handleCocomoDelete} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}

                {/* Standard Tab */}
                {activeTab === 'standard' && (
                  loading ? <LoadingRow /> :
                  filteredEstimates.length === 0 ? <EmptyRow message="No estimates found" sub="Try adjusting filters or create a new estimate." /> :
                  filteredEstimates.map(estimate => (
                    <tr key={estimate._id} className="border-b border-[#2A313C] hover:bg-[#1E252E] transition-colors duration-200">
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono font-medium text-indigo-400">{estimate.estimateNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">{estimate.project?.name || 'Untitled'}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{estimate.project?.projectType || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{formatDate(estimate.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-indigo-400">{formatCurrency(estimate.costBreakdown?.totalCost)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block text-xs px-2 py-1 rounded-md border ${
                          estimate.status === 'Final' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                          estimate.status === 'Archived' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' :
                          'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}>
                          {estimate.status}
                        </span>
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
                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>

          {/* Pagination (standard only) */}
          {activeTab === 'standard' && pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-[#2A313C] flex items-center justify-between">
              <p className="text-sm text-gray-400">Page {pagination.page} of {pagination.pages}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} className="px-3 py-1.5 bg-[#1E252E] border border-[#2A313C] rounded-md text-sm text-gray-400 hover:text-white hover:bg-[#2A313C] disabled:opacity-50 disabled:cursor-not-allowed transition-all">Previous</button>
                <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.pages} className="px-3 py-1.5 bg-[#1E252E] border border-[#2A313C] rounded-md text-sm text-gray-400 hover:text-white hover:bg-[#2A313C] disabled:opacity-50 disabled:cursor-not-allowed transition-all">Next</button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default History;