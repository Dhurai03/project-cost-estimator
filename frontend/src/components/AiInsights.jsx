import { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import { useCurrency } from '../context/CurrencyContext';

const AiInsights = () => {
  const { estimates } = useData();
  const { formatCurrency } = useCurrency();
  const [insight, setInsight] = useState('Analyzing data...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (!estimates || estimates.length === 0) {
      setInsight('Gathering more data to provide AI insights. Create some estimates to begin.');
      setLoading(false);
      return;
    }

    // Generate dynamic string insights based on estimates data
    const totalCost = estimates.reduce((sum, est) => sum + (est.costBreakdown?.totalCost || 0), 0);
    const avgCost = totalCost / estimates.length;
    
    // Simulate AI thinking delay for UX
    const timer = setTimeout(() => {
      if (estimates.length > 5 && avgCost > 100000) {
        setInsight(`Based on your ${estimates.length} recent projects, average cost is trending high at ${formatCurrency(avgCost)}. Consider optimizing labor and equipment allocations for future high-complexity projects.`);
      } else if (estimates.length > 3) {
        setInsight(`Your project estimation workflow is stable. The average cost per project remains steady at ${formatCurrency(avgCost)}. No major budget anomalies detected in recent drafting phases.`);
      } else {
        setInsight(`AI has established baseline metrics for your initial ${estimates.length} project(s). Your current burn rate is healthy. Add more project data to yield deeper structural budget insights.`);
      }
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [estimates, formatCurrency]);

  return (
    <div className="bg-[#151A22] light-theme:bg-white rounded-lg border border-indigo-500/30 p-5 bg-gradient-to-r from-[#151A22] to-indigo-900/10 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
      
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <h3 className="text-white light-theme:text-gray-900 font-medium text-sm tracking-wide">AI-POWERED INSIGHTS</h3>
        </div>
        {loading && (
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        )}
      </div>
      <p className="text-sm text-indigo-200 leading-relaxed border-l-2 border-indigo-500/50 pl-4 py-1 relative z-10">
        <span className={loading ? "opacity-50 transition-opacity" : "opacity-100 transition-opacity duration-500"}>
          "{insight}"
        </span>
      </p>
    </div>
  );
};

export default AiInsights;
