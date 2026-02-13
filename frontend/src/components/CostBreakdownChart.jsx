import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatCurrency } from '../utils/formatters';
import { useEffect, useState } from 'react';
import { useEstimates } from '../hooks/useEstimates';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1E252E] px-3 py-2 rounded-md border border-[#2A313C]">
        <p className="text-xs text-white">{payload[0].payload.name}</p>
        <p className="text-xs font-semibold text-indigo-400">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

const CostBreakdownChart = () => {
  const { estimates } = useEstimates();
  const [chartData, setChartData] = useState([]);

  // Generate real-time chart data from estimates
  useEffect(() => {
    if (estimates && estimates.length > 0) {
      // Get last 7 days of data
      const last7Days = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        // Calculate total cost for this day
        const dayTotal = estimates
          .filter(est => {
            const estDate = new Date(est.createdAt);
            return estDate.toDateString() === date.toDateString();
          })
          .reduce((sum, est) => sum + (est.costBreakdown?.totalCost || 0), 0);
        
        last7Days.push({
          name: dateStr,
          shortName: dayName,
          value: dayTotal || 0
        });
      }
      
      setChartData(last7Days);
    } else {
      // Sample data when no estimates exist
      setChartData([
        { name: 'Mar 28', value: 0 },
        { name: 'Mar 30', value: 0 },
        { name: 'Apr 01', value: 0 },
        { name: 'Apr 03', value: 0 },
        { name: 'Apr 05', value: 0 },
        { name: 'Apr 07', value: 0 },
        { name: 'Apr 09', value: 0 },
        { name: 'Apr 11', value: 0 },
        { name: 'Apr 13', value: 0 },
        { name: 'Apr 15', value: 0 }
      ]);
    }
  }, [estimates]);

  const maxValue = Math.max(...chartData.map(d => d.value), 1000);
  const yAxisMax = Math.ceil(maxValue * 1.1 / 1000) * 1000;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-sm font-medium">PROJECT COST TREND</h3>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400">All Projects</span>
          <span className="text-xs text-gray-400">Total Cost</span>
        </div>
      </div>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A313C" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#6B7280" 
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#2A313C' }}
            />
            <YAxis 
              stroke="#6B7280" 
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#2A313C' }}
              tickFormatter={(value) => `$${value/1000}k`}
              domain={[0, yAxisMax]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              fill="#6366f1" 
              radius={[4, 4, 0, 0]}
              barSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-indigo-500 rounded-sm"></div>
          <span className="text-xs text-gray-400">Daily Project Cost</span>
        </div>
      </div>
    </div>
  );
};

export default CostBreakdownChart;