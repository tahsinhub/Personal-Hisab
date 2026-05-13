import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HandCoins, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  User, 
  History,
  Trash2,
  CheckCircle2,
  StickyNote
} from 'lucide-react';
import { Loan } from '../types';
import { UI_STRINGS } from '../constants';
import { formatCurrency, cn } from '../lib/utils';
import { dataService } from '../services/dataService';

export const Loans: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const lang = dataService.getLanguage() as 'en' | 'bn';
  const t = UI_STRINGS;

  const [formData, setFormData] = useState({
    personName: '',
    type: 'taken' as 'taken' | 'given',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  useEffect(() => {
    const unsub = dataService.subscribeToCollection<Loan>('loans', setLoans);
    return () => unsub && unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0 || !formData.personName) return;
    try {
      await dataService.addDocument<Loan>('loans', {
        ...formData,
        remainingBalance: formData.amount,
        status: 'active',
        date: new Date(formData.date)
      });
      setShowAdd(false);
      setFormData({ personName: '', type: 'taken', amount: 0, description: '', date: new Date().toISOString().split('T')[0], remarks: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (loan: Loan) => {
    try {
      await dataService.updateDocument('loans', loan.id!, {
        status: loan.status === 'active' ? 'cleared' : 'active',
        remainingBalance: loan.status === 'active' ? 0 : loan.amount
      });
    } catch (err) {
      console.error(err);
    }
  };

  const totalTaken = loans.filter(l => l.type === 'taken' && l.status === 'active').reduce((s, l) => s + l.remainingBalance, 0);
  const totalGiven = loans.filter(l => l.type === 'given' && l.status === 'active').reduce((s, l) => s + l.remainingBalance, 0);

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t.loans[lang]}</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">{lang === 'en' ? 'Track liabilities and assets' : 'ধার ও ঋণের হিসাব'}</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-4 rounded-3xl shadow-xl shadow-indigo-100 transition-all uppercase tracking-widest text-[10px]"
        >
          {showAdd ? <History className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showAdd ? (lang === 'en' ? 'View Ledger' : 'হিসাব দেখুন') : (lang === 'en' ? 'Record' : 'যোগ করুন')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-rose-50/50 border border-rose-100 p-10 rounded-[40px] flex items-center justify-between shadow-sm">
            <div>
              <p className="text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{lang === 'en' ? 'Owed to Others' : 'অন্যের পাওনা'}</p>
              <h3 className="text-4xl font-black text-rose-600 tracking-tighter">{formatCurrency(totalTaken)}</h3>
            </div>
            <div className="p-5 bg-rose-100 rounded-3xl text-rose-600 shadow-xl shadow-rose-200/20">
               <ArrowDownRight className="w-10 h-10" />
            </div>
         </div>
         <div className="bg-teal-50/50 border border-teal-100 p-10 rounded-[40px] flex items-center justify-between shadow-sm">
            <div>
              <p className="text-teal-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{lang === 'en' ? 'Lent to Others' : 'আপনার পাওনা'}</p>
              <h3 className="text-4xl font-black text-teal-600 tracking-tighter">{formatCurrency(totalGiven)}</h3>
            </div>
            <div className="p-5 bg-teal-100 rounded-3xl text-teal-600 shadow-xl shadow-teal-200/20">
               <ArrowUpRight className="w-10 h-10" />
            </div>
         </div>
      </div>

      <AnimatePresence mode="wait">
        {!showAdd ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {loans.length === 0 ? (
              <div className="col-span-full py-24 text-center bg-white rounded-[40px] border border-dashed border-slate-100">
                <HandCoins className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No loans recorded</p>
              </div>
            ) : (
              loans.map((loan) => (
                <motion.div 
                  key={loan.id}
                  whileHover={{ y: -8 }}
                  className={cn(
                    "p-8 rounded-[40px] bg-white border shadow-sm flex flex-col justify-between transition-all group relative overflow-hidden",
                    loan.status === 'cleared' ? "border-slate-100 opacity-60" : loan.type === 'taken' ? "border-rose-100" : "border-teal-100"
                  )}
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className={cn(
                      "p-5 rounded-[24px] shadow-sm",
                      loan.type === 'taken' ? "bg-rose-50 text-rose-600" : "bg-teal-50 text-teal-600"
                    )}>
                      <User className="w-8 h-8" />
                    </div>
                    {loan.status === 'cleared' && (
                      <span className="text-[8px] font-black uppercase tracking-widest bg-teal-500 text-white px-3 py-1.5 rounded-full">Cleared</span>
                    )}
                  </div>

                  <div className="mb-10">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{loan.type === 'taken' ? (lang === 'en' ? 'From' : 'নিকট থেকে') : (lang === 'en' ? 'To' : 'কাকে দিয়েছি')}</p>
                    <h4 className="text-xl font-black text-slate-900 tracking-tight mb-4">{loan.personName}</h4>
                    
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Balance</p>
                    <h5 className={cn(
                      "text-3xl font-black tracking-tighter",
                      loan.status === 'cleared' ? "text-slate-200" : loan.type === 'taken' ? "text-rose-500" : "text-teal-600"
                    )}>
                      {formatCurrency(loan.remainingBalance)}
                    </h5>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-8 border-t border-slate-50">
                     <button 
                      onClick={() => toggleStatus(loan)}
                      className={cn(
                        "flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                        loan.status === 'cleared' 
                          ? "bg-slate-50 text-slate-300 hover:bg-slate-100" 
                          : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100"
                      )}
                     >
                       {loan.status === 'cleared' ? 'Reopen' : (lang === 'en' ? 'Clear' : 'পরিশোধিত')}
                     </button>
                     <button 
                      onClick={() => dataService.deleteDocument('loans', loan.id!)}
                      className="p-4 bg-slate-50 text-slate-200 hover:text-rose-500 transition-all rounded-2xl"
                     >
                       <Trash2 className="w-5 h-5" />
                     </button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-[40px] p-12 border border-slate-100 shadow-2xl max-w-2xl mx-auto"
          >
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Engagement Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'taken' })}
                    className={cn(
                      "p-6 rounded-[28px] text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-3",
                      formData.type === 'taken' 
                        ? "bg-rose-500 border-rose-500 text-white shadow-xl shadow-rose-100" 
                        : "bg-slate-50 border-slate-100 text-slate-400"
                    )}
                  >
                    <ArrowDownRight className="w-5 h-5" />
                    {lang === 'en' ? 'Taken' : 'নিয়েছি'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'given' })}
                    className={cn(
                      "p-6 rounded-[28px] text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-3",
                      formData.type === 'given' 
                        ? "bg-teal-600 border-teal-600 text-white shadow-xl shadow-teal-100" 
                        : "bg-slate-50 border-slate-100 text-slate-400"
                    )}
                  >
                    <ArrowUpRight className="w-5 h-5" />
                    {lang === 'en' ? 'Given' : 'দিয়েছি'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="col-span-full space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Person / Entity Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 font-black text-xl tracking-tight focus:ring-4 focus:ring-indigo-500/10 outline-none"
                    value={formData.personName}
                    onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Amount (৳)</label>
                  <input 
                    type="number"
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 font-black text-3xl tracking-tighter focus:ring-4 focus:ring-indigo-500/10 outline-none"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Date</label>
                  <input 
                    type="date"
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 font-black text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{t.remarks[lang]}</label>
                 <textarea 
                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 font-bold text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none resize-none"
                    rows={3}
                    placeholder="..."
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                 />
              </div>

              <div className="flex gap-4">
                 <button 
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-400 font-black py-5 rounded-3xl transition-all uppercase tracking-widest text-[10px]"
                 >
                   {t.cancel[lang]}
                 </button>
                 <button 
                  type="submit"
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-3xl shadow-2xl shadow-indigo-100 transition-all uppercase tracking-widest text-[10px]"
                 >
                   {t.save[lang]}
                 </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
