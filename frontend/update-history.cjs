const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src', 'pages', 'History.jsx');
let content = fs.readFileSync(targetFile, 'utf8');

// Add import api
if (!content.includes("import api from '../services/api';")) {
  content = content.replace("import toast from 'react-hot-toast';", "import toast from 'react-hot-toast';\nimport api from '../services/api';");
}

// Add state variables
const stateVars = `
  const [activeTab, setActiveTab] = useState('standard');
  const [cocomoAnalyses, setCocomoAnalyses] = useState([]);
  const [cocomoLoading, setCocomoLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(null);

  // Fetch COCOMO analyses
  const fetchCocomo = async () => {
    try {
      setCocomoLoading(true);
      const res = await api.get('/cocomo?limit=100');
      if (res.data && res.data.data) {
        setCocomoAnalyses(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch COCOMO analyses', err);
    } finally {
      setCocomoLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCocomo();
  }, []);

  const handleExportCocomoPDF = async (id) => {
    if (downloadingPdf) return;
    try {
      setDownloadingPdf(id);
      const response = await api.get('/cocomo/' + id + '/export/pdf', {
        responseType: 'blob'
      });
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'cocomo-analysis-' + id.slice(-6) + '.pdf');
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('COCOMO PDF downloaded successfully!');
    } catch (error) {
      console.error('Failed to export PDF:', error);
      toast.error('Failed to export PDF');
    } finally {
      setDownloadingPdf(null);
    }
  };

  const handleCocomoDelete = async (id) => {
    if (deletingId === id) return;
    if (window.confirm('Are you sure you want to delete this COCOMO analysis?')) {
      setDeletingId(id);
      try {
        await api.delete('/cocomo/' + id);
        toast.success('Analysis deleted successfully!');
        fetchCocomo();
      } catch (error) {
        toast.error('Failed to delete analysis');
      } finally {
        setDeletingId(null);
      }
    }
  };
`;

content = content.replace('const handlePageChange = (newPage) => {', stateVars + '\n  const handlePageChange = (newPage) => {');

// Add React useEffect to import line if missing
if (!content.includes('useEffect')) {
  content = content.replace("import { useState } from 'react';", "import { useState, useEffect } from 'react';");
}

// Add the Tabs HTML right before the filters
const tabsHTML = `
        {/* Tabs */}
        <div className="flex border-b border-[#2A313C] light-theme:border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('standard')}
            className={\`px-6 py-3 text-sm font-medium border-b-2 transition-colors \${
              activeTab === 'standard' 
                ? 'border-indigo-500 text-indigo-400' 
                : 'border-transparent text-gray-400 light-theme:text-gray-600 hover:text-white light-theme:hover:text-gray-900'
            }\`}
          >
            Standard Estimates
          </button>
          <button
            onClick={() => setActiveTab('cocomo')}
            className={\`px-6 py-3 text-sm font-medium border-b-2 transition-colors \${
              activeTab === 'cocomo' 
                ? 'border-indigo-500 text-indigo-400' 
                : 'border-transparent text-gray-400 light-theme:text-gray-600 hover:text-white light-theme:hover:text-gray-900'
            }\`}
          >
            COCOMO II Analyses
          </button>
        </div>
`;

content = content.replace("{/* Filters */}", tabsHTML + "\n        {/* Filters */}");

// Hide filters if not standard
content = content.replace('{/* Filters */}', '{activeTab === "standard" && (\n        <>\n        {/* Filters */}');

// Make sure to close the conditional around Filters
const tableStart = content.indexOf('{/* Table */}');
content = content.slice(0, tableStart) + '        </>\n        )}\n\n        ' + content.slice(tableStart);

// Filter COCOMO analyses
const cocomoFilterHTML = `
  const filteredCocomo = cocomoAnalyses.filter(analysis => 
    analysis.project?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    analysis._id.toLowerCase().includes(searchTerm.toLowerCase())
  );
`;
content = content.replace('return (', cocomoFilterHTML + '\n  return (');

// Provide the COCOMO List inside the Table conditional
// Find the exact tbody map
const tbodyStart = content.indexOf('<tbody>');
const tbodyEnd = content.indexOf('</tbody>');

// We will replace the entire table content using a ternary inside tbody
const newTbodyContent = `
                {activeTab === 'standard' ? (
                  loading ? (
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
                        <p className="text-gray-400 light-theme:text-gray-600 text-sm mb-1">No estimates found</p>
                        <p className="text-xs text-gray-500">Try adjusting your filters or create a new estimate</p>
                      </td>
                    </tr>
                  ) : (
                    filteredEstimates.map((estimate) => (
                      <tr key={estimate._id} className="border-b border-[#2A313C] light-theme:border-gray-200 hover:bg-[#1E252E] light-theme:bg-white transition-colors duration-200">
                        <td className="px-6 py-4">
                          <span className="text-xs font-mono font-medium text-indigo-400">
                            {estimate.estimateNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white light-theme:text-gray-900">{estimate.project?.name || 'Untitled Project'}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{estimate.project?.projectType || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 light-theme:text-gray-600">
                          {formatDate(estimate.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-indigo-400">
                            {formatCurrency(estimate.costBreakdown?.totalCost)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={\`inline-block text-xs px-2 py-1 rounded-md font-medium
                            \${estimate.status === 'Final' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : ''}
                            \${estimate.status === 'Draft' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : ''}
                            \${estimate.status === 'Archived' ? 'bg-gray-500/20 text-gray-400 light-theme:text-gray-600 border border-gray-500/30' : ''}
                          \`}>
                            {estimate.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => exportPDF(estimate._id)}
                              className="p-1.5 text-gray-500 hover:text-indigo-400 hover:bg-[#2A313C] rounded-md transition-all duration-200"
                              title="Export PDF"
                              disabled={deletingId === estimate._id}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => exportCSV(estimate._id)}
                              className="p-1.5 text-gray-500 hover:text-emerald-400 hover:bg-[#2A313C] rounded-md transition-all duration-200"
                              title="Export CSV"
                              disabled={deletingId === estimate._id}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(estimate._id)}
                              className={\`p-1.5 rounded-md transition-all duration-200
                                \${deletingId === estimate._id
                                  ? 'text-gray-600 cursor-not-allowed'
                                  : 'text-gray-500 hover:text-rose-400 hover:bg-[#2A313C]'
                                }\`}
                              title="Delete"
                              disabled={deletingId === estimate._id}
                            >
                              {deletingId === estimate._id ? (
                                <div className="w-5 h-5 border-2 border-gray-500 border-t-rose-400 rounded-full animate-spin"></div>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )
                ) : (
                  cocomoLoading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex justify-center">
                          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredCocomo.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="text-4xl mb-3 opacity-30">📋</div>
                        <p className="text-gray-400 light-theme:text-gray-600 text-sm mb-1">No COCOMO analyses found</p>
                        <p className="text-xs text-gray-500">Go to the COCOMO II page to create one</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCocomo.map((analysis) => (
                      <tr key={analysis._id} className="border-b border-[#2A313C] light-theme:border-gray-200 hover:bg-[#1E252E] light-theme:bg-white transition-colors duration-200">
                        <td className="px-6 py-4">
                          <span className="text-xs font-mono font-medium text-emerald-400">
                            COCOMO-{analysis._id.substring(analysis._id.length - 6)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white light-theme:text-gray-900">{analysis.project?.name || 'Untitled Project'}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{analysis.modelType || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 light-theme:text-gray-600">
                          {formatDate(analysis.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-emerald-400">
                            {formatCurrency(analysis.results?.cost)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={\`inline-block text-xs px-2 py-1 rounded-md font-medium
                            \${analysis.status === 'Final' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : ''}
                            \${analysis.status === 'Draft' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-gray-500/20 text-gray-400 light-theme:text-gray-600 border border-gray-500/30'}
                          \`}>
                            {analysis.status || 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleExportCocomoPDF(analysis._id)}
                              className="p-1.5 text-gray-500 hover:text-indigo-400 hover:bg-[#2A313C] rounded-md transition-all duration-200"
                              title="Export PDF"
                              disabled={downloadingPdf === analysis._id || deletingId === analysis._id}
                            >
                              {downloadingPdf === analysis._id ? (
                                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={() => handleCocomoDelete(analysis._id)}
                              className={\`p-1.5 rounded-md transition-all duration-200
                                \${deletingId === analysis._id
                                  ? 'text-gray-600 cursor-not-allowed'
                                  : 'text-gray-500 hover:text-rose-400 hover:bg-[#2A313C]'
                                }\`}
                              title="Delete"
                              disabled={deletingId === analysis._id}
                            >
                              {deletingId === analysis._id ? (
                                <div className="w-5 h-5 border-2 border-gray-500 border-t-rose-400 rounded-full animate-spin"></div>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )
                )}
`;

content = content.slice(0, tbodyStart + 7) + '\n' + newTbodyContent + '\n              ' + content.slice(tbodyEnd);

// Don't show numeric pagination for COCOMO if it's not paginated (we loaded all)
const paginationStartStr = '{pagination.pages > 1 && (';
content = content.replace(paginationStartStr, '{activeTab === "standard" && pagination.pages > 1 && (\n            ');

fs.writeFileSync(targetFile, content, 'utf8');
console.log('History.jsx updated successfully.');
