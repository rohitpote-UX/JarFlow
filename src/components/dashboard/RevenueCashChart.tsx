import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';

export const RevenueCashChart: React.FC = () => {
  const { cashPeriod, upiPeriod, udhariPeriod, settings } = useApp();
  const isMr = settings.language === 'mr';

  const data = [
    { name: isMr ? 'रोख (Cash)' : 'Cash', value: cashPeriod || 560, color: '#16A34A' },
    { name: isMr ? 'यूपीआय (UPI)' : 'UPI', value: upiPeriod || 350, color: '#2563EB' },
    { name: isMr ? 'उधारी (Udhari)' : 'Udhari', value: udhariPeriod || 175, color: '#F59E0B' },
  ];

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-white p-4 rounded-3xl border border-surface-border shadow-card">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-gray-900">
            {isMr ? 'रक्कम वर्गीकरण' : 'Cash vs Udhari Ratio'}
          </h3>
          <p className="text-xs text-gray-500">
            {isMr ? 'रोख, यूपीआय व उधारी विभागणी' : 'Payment Mode Breakdown'}
          </p>
        </div>
        <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
          {formatCurrency(total)}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="h-44 w-44 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Amount']}
                contentStyle={{
                  backgroundColor: '#1E293B',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '11px',
                }}
              />
              <Pie
                data={data}
                innerRadius={46}
                outerRadius={65}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-gray-600 font-medium">{isMr ? 'एकूण' : 'Total'}</span>
            <span className="text-xs font-bold text-gray-900">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Legend Indicators */}
        <div className="flex-1 w-full space-y-2">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded-xl bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="font-medium text-gray-700">{item.name}</span>
              </div>
              <span className="font-bold text-gray-900">{formatCurrency(item.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
