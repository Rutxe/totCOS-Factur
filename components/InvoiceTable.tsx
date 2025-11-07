import React, { useState, useMemo } from 'react';
import { UI_STRINGS } from '../constants';
import type { Invoice, Language, UserRole } from '../types';
import { TrashIcon } from './icons';

interface InvoiceTableProps {
  invoices: Invoice[];
  onDelete: (id: string) => void;
  lang: Language;
  role: UserRole;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({ invoices, onDelete, lang, role }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const t = UI_STRINGS[lang];

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice =>
      invoice.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceDate.includes(searchTerm) ||
      invoice.totalAmount.toString().includes(searchTerm)
    ).sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
  }, [invoices, searchTerm]);

  const exportToCSV = () => {
    const headers = ['ID', 'FileName', 'Provider', 'InvoiceDate', 'DueDate', 'TotalAmount', 'TaxAmount', 'Currency'];
    const rows = filteredInvoices.map(inv => 
      [inv.id, inv.fileName, inv.provider, inv.invoiceDate, inv.dueDate, inv.totalAmount, inv.taxAmount, inv.currency].join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "invoices.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-2xl font-bold text-white">{t.invoices}</h2>
        <div className="flex gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            onClick={exportToCSV}
            disabled={invoices.length === 0}
            className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition disabled:bg-gray-600 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {t.exportCSV}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-600 text-sm text-gray-400">
            <tr>
              <th className="p-3">{t.tableProvider}</th>
              <th className="p-3">{t.tableDate}</th>
              <th className="p-3 text-right">{t.tableTotal}</th>
              <th className="p-3 text-right">{t.tableTax}</th>
              {role === 'admin' && <th className="p-3 text-center">{t.tableActions}</th>}
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                  <td className="p-3 font-medium text-white">{invoice.provider}</td>
                  <td className="p-3">{invoice.invoiceDate}</td>
                  <td className="p-3 text-right font-mono">{new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.totalAmount)}</td>
                  <td className="p-3 text-right font-mono">{new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.taxAmount)}</td>
                  {role === 'admin' && (
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onDelete(invoice.id)}
                        className="text-red-500 hover:text-red-400"
                        aria-label={`Delete invoice from ${invoice.provider}`}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={role === 'admin' ? 5 : 4} className="text-center py-8 text-gray-500">
                  {invoices.length === 0 ? t.noInvoices : t.noInvoicesMatch}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceTable;
