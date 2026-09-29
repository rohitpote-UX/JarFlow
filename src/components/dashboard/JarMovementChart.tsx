import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { BarChart2 } from 'lucide-react';

export const JarMovementChart: React.FC = () => {
  const { transactions, business } = useApp();
  const isMr = business.language === 'mr';

  const hasTransactions = transactions.length > 0;

  // Compute past 7 days movement from REAL records only
  const data = React.useMemo(() => {
    const days = isMr
      ? ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const result = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - i);
      const dayName = days[targetDate.getDay()];

      const dayTxs = transactions.filter((t) => {
        const d = new Date(t.date);
        return (
          d.getDate() === targetDate.getDate() &&
          d.getMonth() === targetDate.getMonth() &&
          d.getFullYear() === targetDate.getFullYear()
        );
      });

      const given = dayTxs.reduce((sum, t) => sum + t.jarsGiven, 0);
      const returned = dayTxs.reduce((sum, t) => sum + t.jarsReturned, 0);

      result.push({
        day: dayName,
        given,
        returned,
      });
    }

    return result;
  }, [transactions, isMr]);

  const totalMovement = data.reduce((sum, d) => sum + d.given + d.returned, 0);

  return (
    <div className="bg-white p-4 rounded-3xl border border-surface-border shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900">
            {isMr ? 'साप्ताहिक जार हालचाल' : 'Weekly Jar Movement'}
          </h3>
          <p className="text-xs text-gray-500">
            {isMr ? 'दिलेले व परत आलेले जार' : 'Given vs Returned Jars'}
          </p>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-brand-800">
          7 Days
        </span>
      </div>

      {!hasTransactions || totalMovement === 0 ? (
        <div className="h-56 w-full flex flex-col items-center justify-center text-center p-4 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200">
          <BarChart2 className="w-8 h-8 text-gray-300 mb-1.5" />
          <p className="text-xs font-medium text-gray-500">
            {isMr
              ? 'या कालावधीसाठी कोणताही transaction उपलब्ध नाही.'
              : 'No jar transactions recorded in this period.'}
          </p>
          <span className="text-[11px] text-gray-400 mt-0.5">
            {isMr ? 'पहिली नोंद केल्यानंतर हालचाल चार्ट दिसेल' : 'Movement will appear after first entry'}
          </span>
        </div>
      ) : (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748B' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748B' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  padding: '8px 12px',
                }}
                itemStyle={{ color: '#FFFFFF' }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
              />
              <Bar
                dataKey="given"
                name={isMr ? 'दिलेले (Given)' : 'Given'}
                fill="#1E40AF"
                radius={[6, 6, 0, 0]}
                barSize={12}
              />
              <Bar
                dataKey="returned"
                name={isMr ? 'जमा (Returned)' : 'Returned'}
                fill="#16A34A"
                radius={[6, 6, 0, 0]}
                barSize={12}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
