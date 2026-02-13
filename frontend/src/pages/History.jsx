import { useState } from 'react';
import Navbar from '../components/Navbar';
import { useEstimates } from '../hooks/useEstimates';
import { useCurrency } from '../context/CurrencyContext';
import { formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const History = () => {
  const [filter, setFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { formatCurrency } = useCurrency(); // ✅ ONLY DECLARE THIS ONCE!
  const { 
    estimates, 
    loading, 
    pagination, 
    fetchEstimates, 
    deleteEstimate, 
    exportPDF, 
    exportCSV 
  } = useEstimates();

  const handlePageChange = (newPage) => {
    fetchEstimates(newPage, filter);
  };

  const handleFilterChange = (status) => {
    setFilter(status);
    fetchEstimates(1, status);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this estimate?')) {
      await deleteEstimate(id);
    }
  };

  const filteredEstimates = estimates.filter(estimate => 
    estimate.project?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estimate.estimateNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B0F15]">
      <Navbar />
      
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-1">Estimate History</h1>
            <p className="text-gray-400 text-sm">View and manage all your estimates</p>
          </div>
          
          <div className="bg-[#151A22] px-5 py-3 rounded-lg border border-[#2A313C]">
            <span className="text-sm text-gray-400 mr-2">Total Estimates:</span>
            <span className="text-lg font-semibold text-indigo-400">{pagination.total || 0}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#151A22] rounded-lg border border-[#2A313C] p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 mr-1">Filter:</span>
              {['', 'Draft', 'Final', 'Archived'].map((status) => (
                <button
                  key={status || 'all'}
                  onClick={() => handleFilterChange(status)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
                    ${filter === status 
                      ? status === '' ? 'bg-indigo-600 text-white' :
                        status === 'Draft' ? 'bg-amber-600 text-white' :
                        status === 'Final' ? 'bg-emerald-600 text-white' :
                        'bg-gray-600 text-white'
                      : 'bg-[#1E252E] text-gray-400 hover:text-white hover:bg-[#2A313C] border border-[#2A313C]'
                    }`}
                >
                  {status || 'All'}
                </button>
              ))}
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search estimates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 pl-9 px-3 py-2 bg-[#1E252E] border border-[#2A313C] rounded-md 
                         text-white text-sm placeholder-gray-500
                         focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 
                         outline-none transition-all duration-200"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#151A22] rounded-lg border border-[#2A313C] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1E252E] border-b border-[#2A313C]">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Estimate #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Total Cost
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredEstimates.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="text-4xl mb-3 opacity-30">📋</div>
                      <p className="text-gray-400 text-sm mb-1">No estimates found</p>
                      <p className="text-xs text-gray-500">Try adjusting your filters or create a new estimate</p>
                    </td>
                  </tr>
                ) : (
                  filteredEstimates.map((estimate) => (
                    <tr key={estimate._id} className="border-b border-[#2A313C] hover:bg-[#1E252E] transition-colors duration-200">
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono font-medium text-indigo-400">
                          {estimate.estimateNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">{estimate.project?.name || 'Untitled Project'}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{estimate.project?.projectType || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {formatDate(estimate.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-indigo-400">
                          {formatCurrency(estimate.costBreakdown?.totalCost)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block text-xs px-2 py-1 rounded-md font-medium
                          ${estimate.status === 'Final' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : ''}
                          ${estimate.status === 'Draft' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : ''}
                          ${estimate.status === 'Archived' ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' : ''}
                        `}>
                          {estimate.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => exportPDF(estimate._id)}
                            className="p-1.5 text-gray-500 hover:text-indigo-400 hover:bg-[#2A313C] rounded-md transition-all duration-200"
                            title="Export PDF"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => exportCSV(estimate._id)}
                            className="p-1.5 text-gray-500 hover:text-emerald-400 hover:bg-[#2A313C] rounded-md transition-all duration-200"
                            title="Export CSV"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(estimate._id)}
                            className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-[#2A313C] rounded-md transition-all duration-200"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-[#2A313C] flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Page {pagination.page} of {pagination.pages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1.5 bg-[#1E252E] border border-[#2A313C] rounded-md 
                           text-sm text-gray-400 hover:text-white hover:bg-[#2A313C] 
                           disabled:opacity-50 disabled:cursor-not-allowed 
                           transition-all duration-200"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={i}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 rounded-md text-sm font-medium transition-all duration-200
                          ${pagination.page === pageNum
                            ? 'bg-indigo-600 text-white'
                            : 'bg-[#1E252E] text-gray-400 hover:text-white hover:bg-[#2A313C] border border-[#2A313C]'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1.5 bg-[#1E252E] border border-[#2A313C] rounded-md 
                           text-sm text-gray-400 hover:text-white hover:bg-[#2A313C] 
                           disabled:opacity-50 disabled:cursor-not-allowed 
                           transition-all duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;