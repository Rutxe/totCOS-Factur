import React, { useState, useEffect, useCallback } from 'react';
import { extractInvoiceData } from './services/geminiService';
import type { Invoice, Language, UserRole } from './types';
import { UI_STRINGS } from './constants';
import FileUploadZone from './components/FileUploadZone';
import InvoiceTable from './components/InvoiceTable';
import DashboardAnalytics from './components/DashboardAnalytics';
import ChatAssistant from './components/ChatAssistant';
import { BotIcon } from './components/icons';

const App: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>('en');
  const [role, setRole] = useState<UserRole>('admin');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const t = UI_STRINGS[lang];

  useEffect(() => {
    try {
      const storedInvoices = localStorage.getItem('invoices');
      if (storedInvoices) {
        setInvoices(JSON.parse(storedInvoices));
      }
    } catch (e) {
      console.error("Failed to parse invoices from localStorage", e);
      localStorage.removeItem('invoices');
    }
  }, []);

  useEffect(() => {
    try {
        localStorage.setItem('invoices', JSON.stringify(invoices));
    } catch (e) {
        console.error("Failed to save invoices to localStorage", e);
    }
  }, [invoices]);

  const handleFileUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const extractedData = await extractInvoiceData(file);
      const newInvoice: Invoice = {
        ...extractedData,
        id: new Date().toISOString() + Math.random(),
        fileName: file.name,
      };
      setInvoices(prev => [...prev, newInvoice]);
    } catch (e) {
      console.error(e);
      setError(t.errorUpload);
    } finally {
      setIsLoading(false);
    }
  }, [t.errorUpload]);

  const handleDeleteInvoice = useCallback((id: string) => {
    setInvoices(prev => prev.filter(invoice => invoice.id !== id));
  }, []);

  return (
    <>
      <div 
        className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>

        <div className="relative max-w-7xl mx-auto z-10">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
                <h1 className="text-4xl font-black text-white tracking-tighter">{t.appName}</h1>
                <p className="text-cyan-400">{t.appSubtitle}</p>
            </div>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
                <select value={lang} onChange={(e) => setLang(e.target.value as Language)} className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                    <option value="en">English</option>
                    <option value="es">Español</option>
                </select>
                <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                    <option value="admin">{t.admin}</option>
                    <option value="viewer">{t.viewer}</option>
                </select>
            </div>
          </header>
          
          <main className="space-y-8">
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500 text-red-300 rounded-lg">
                <strong>{t.errorTitle}:</strong> {error}
              </div>
            )}
            
            <FileUploadZone onFileUpload={handleFileUpload} isLoading={isLoading} lang={lang} />
            <DashboardAnalytics invoices={invoices} lang={lang} />
            <InvoiceTable invoices={invoices} onDelete={handleDeleteInvoice} lang={lang} role={role} />
          </main>
        </div>
      </div>
      
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 bg-cyan-600 text-white p-4 rounded-full shadow-lg hover:bg-cyan-500 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-offset-gray-900 focus:ring-cyan-500 z-20"
        title={t.chatWithAI}
      >
        <BotIcon className="w-8 h-8"/>
      </button>

      <ChatAssistant
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        invoices={invoices}
        lang={lang}
      />
    </>
  );
};

export default App;
