import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import type { Invoice, Language } from '../types';
import { UI_STRINGS } from '../constants';

interface DashboardAnalyticsProps {
  invoices: Invoice[];
  lang: Language;
}

const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
        <p className="font-bold text-cyan-400">{`${label}`}</p>
        <p className="text-sm text-gray-200">{`Total: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payload[0].value)}`}</p>
      </div>
    );
  }
  return null;
};

const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({ invoices, lang }) => {
  const t = UI_STRINGS[lang];

  const totalAmount = useMemo(() => 
    invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0), 
    [invoices]
  );

  const dataByProvider = useMemo(() => {
    const providerMap = new Map<string, number>();
    invoices.forEach(invoice => {
      const currentTotal = providerMap.get(invoice.provider) || 0;
      providerMap.set(invoice.provider, currentTotal + invoice.totalAmount);
    });
    return Array.from(providerMap.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [invoices]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
      <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
        <h3 className="text-lg font-medium text-gray-400">{t.totalInvoices}</h3>
        <p className="text-4xl font-bold text-white mt-2">{invoices.length}</p>
      </div>
      <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 col-span-1 md:col-span-2">
        <h3 className="text-lg font-medium text-gray-400">{t.totalAmount}</h3>
        <p className="text-4xl font-bold text-white mt-2">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoices[0]?.currency || 'USD' }).format(totalAmount)}
        </p>
      </div>
      <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 col-span-1 md:col-span-3">
        <h3 className="text-xl font-semibold text-white mb-4">{t.spendingBySupplier}</h3>
        {invoices.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataByProvider} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
              <XAxis dataKey="name" stroke="#a0aec0" tick={{ fontSize: 12 }} />
              <YAxis stroke="#a0aec0" tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}/>
              <Bar dataKey="total" name="Total Spend" fill="#8884d8">
                {dataByProvider.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">{t.noInvoices}</div>
        )}
      </div>
    </div>
  );
};

export default DashboardAnalytics;
