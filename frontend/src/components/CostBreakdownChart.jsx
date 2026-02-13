import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatCurrency } from '../utils/formatters';

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

const CostBreakdownChart = ({ data }) => {
  // Generate sample data for the chart
  const chartData = [
    { name: 'Mar 28', value: 42000 },
    { name: 'Mar 30', value: 38000 },
    { name: 'Apr 01', value: 45000 },
    { name: 'Apr 03', value: 40000 },
    { name: 'Apr 05', value: 35000 },
    { name: 'Apr 07', value: 48000 },
    { name: 'Apr 09', value: 52000 },
    { name: 'Apr 11', value: 49000 },
    { name: 'Apr 13', value: 51000 },
    { name: 'Apr 15', value: 47000 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-sm font-medium">CLOUD SPEND TREND</h3>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400">All Applications</span>
          <span className="text-xs text-gray-400">Total cost</span>
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
    </div>
  );
};

export default CostBreakdownChart;