import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  ArrowUpCircle,
  Calendar,
  Layers,
  StickyNote
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { Income } from '../types';
import { INCOME_SOURCES, UI_STRINGS } from '../constants';
import { formatCurrency, cn } from '../lib/utils';

export const Incomes: React.FC = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const lang = dataService.getLanguage() as 'en' | 'bn';
  const t = UI_STRINGS;
  
  const [formData, setFormData] = useState({ 
    source: INCOME_SOURCES[0].en, 
    amount: 0, 
    date: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  useEffect(() => {
    const unsub = dataService.subscribeToCollection<Income>('incomes', setIncomes);
    return () => unsub && unsub();
  }, []);

  const handleAdd = async () => {
    if (formData.amount <= 0) return;
    try {
      await dataService.addDocument<Income>('incomes', {
        ...formData,
        date: new Date(formData.date)
      });
      setShowAdd(false);
      setFormData({ source: INCOME_SOURCES[0].en, amount: 0, date: new Date().toISOString().split('T')[0], remarks: '' });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.income[lang]}</h2>
          <p className="text-slate-500 font-bold text-sm">{lang === 'en' ? 'Manage your incoming funds' : 'আপনার আয়ের উৎসসমূহ পরিচালনা করুন'}</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-teal-600 text-white px-5 py-3 rounded-2xl font-black text-sm shadow-xl shadow-teal-100 hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" />
          {lang === 'en' ? 'Add Income' : 'আয় যোগ করুন'}
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Source</label>
                <div className="relative">
                  <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select 
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-bold outline-none appearance-none"
                  >
                    {INCOME_SOURCES.map(s => <option key={s.en} value={s.en}>{s[lang]}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Amount (৳)</label>
                <div className="relative">
                  <ArrowUpCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-600" />
                  <input 
                    type="number"
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-bold outline-none"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="date"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-bold outline-none"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{t.remarks[lang]}</label>
                <div className="relative">
                  <StickyNote className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                  <textarea 
                    placeholder="..."
                    rows={1}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-bold outline-none resize-none"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setShowAdd(false)}
                className="px-8 py-3 text-slate-400 text-xs font-black uppercase tracking-widest hover:text-slate-600 transition-all"
              >
                {t.cancel[lang]}
              </button>
              <button 
                onClick={handleAdd}
                className="px-10 py-4 bg-teal-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-teal-100 hover:bg-teal-700 transition-all"
              >
                {t.save[lang]}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.remarks[lang]}</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {incomes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                    No income recorded yet
                  </td>
                </tr>
              ) : (
                incomes.map((inc) => (
                  <tr key={inc.id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-900">{new Date(inc.date as any).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-teal-400" />
                        <p className="text-sm font-black text-slate-900">
                          {INCOME_SOURCES.find(s => s.en === inc.source)?.[lang] || inc.source}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold text-slate-400 max-w-xs truncate">{inc.remarks || '-'}</p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="text-sm font-black text-teal-600">{formatCurrency(inc.amount)}</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <button 
                        onClick={() => dataService.deleteDocument('incomes', inc.id!)}
                        className="p-2 text-slate-200 hover:text-rose-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
