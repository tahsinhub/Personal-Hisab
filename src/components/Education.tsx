import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  Plus, 
  BookOpen, 
  Bus, 
  PenTool, 
  Shirt, 
  ClipboardCheck,
  History,
  Trash2,
  Calendar,
  StickyNote
} from 'lucide-react';
import { EDUCATION_SUB_CATEGORIES, UI_STRINGS } from '../constants';
import { EducationExpense } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { dataService } from '../services/dataService';

export const Education: React.FC = () => {
  const [expenses, setExpenses] = useState<EducationExpense[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const lang = dataService.getLanguage() as 'en' | 'bn';
  const t = UI_STRINGS;

  const [formData, setFormData] = useState({
    subCategory: EDUCATION_SUB_CATEGORIES[0].en,
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  useEffect(() => {
    const unsub = dataService.subscribeToCollection<EducationExpense>('education_expenses', setExpenses);
    return () => unsub && unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) return;
    try {
      await dataService.addDocument<EducationExpense>('education_expenses', {
        ...formData,
        date: new Date(formData.date)
      });
      setShowAdd(false);
      setFormData({ subCategory: EDUCATION_SUB_CATEGORIES[0].en, amount: 0, description: '', date: new Date().toISOString().split('T')[0], remarks: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const getSubCategoryIcon = (catEn: string) => {
    switch (catEn) {
      case 'Monthly Tuition Fee': return BookOpen;
      case 'School Transport': return Bus;
      case 'Stationery': return PenTool;
      case 'Uniform': return Shirt;
      case 'Exam Fee': return ClipboardCheck;
      default: return GraduationCap;
    }
  };

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t.school[lang]}</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">{lang === 'en' ? "Tracking Humaid's academic costs" : 'শিক্ষার ব্যয় রক্ষণাবেক্ষণ'}</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-black px-8 py-4 rounded-3xl shadow-xl shadow-teal-100 transition-all uppercase tracking-widest text-[10px]"
        >
          {showAdd ? <History className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showAdd ? (lang === 'en' ? 'View Logs' : 'হিসাব দেখুন') : (lang === 'en' ? 'Add Expense' : 'খরচ যোগ করুন')}
        </button>
      </div>

      <div className="bg-teal-600 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-teal-100/50">
        <div className="relative z-10">
          <p className="text-teal-100 text-[10px] font-black uppercase tracking-[0.3em] mb-2">{lang === 'en' ? 'Lifetime Academic Spending' : 'মোট শিক্ষামুলক ব্যয়'}</p>
          <h3 className="text-5xl font-black tracking-tighter">{formatCurrency(totalSpent)}</h3>
          <div className="mt-8 flex items-center gap-4">
             <div className="bg-white/10 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest backdrop-blur-md border border-white/10">
               {expenses.length} records
             </div>
          </div>
        </div>
        <GraduationCap className="absolute right-[-40px] bottom-[-40px] w-80 h-80 text-white/5 rotate-12" />
      </div>

      <AnimatePresence mode="wait">
        {!showAdd ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {expenses.length === 0 ? (
              <div className="col-span-full bg-white p-24 rounded-[40px] text-center border border-dashed border-slate-100">
                <BookOpen className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No expenses recorded yet</p>
                <button 
                  onClick={() => setShowAdd(true)}
                  className="mt-6 text-teal-600 font-black uppercase tracking-widest text-[10px] hover:underline"
                >
                  Start tracking now
                </button>
              </div>
            ) : (
              expenses.map((exp) => {
                const Icon = getSubCategoryIcon(exp.subCategory);
                return (
                  <motion.div 
                    key={exp.id}
                    className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-teal-200 transition-all relative"
                  >
                    <div className="flex items-center gap-6">
                      <div className="p-6 bg-slate-50 text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 rounded-[32px] transition-all">
                        <Icon className="w-10 h-10" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-lg leading-tight uppercase tracking-tighter">
                          {EDUCATION_SUB_CATEGORIES.find(c => c.en === exp.subCategory)?.[lang] || exp.subCategory}
                        </h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                           {new Date(exp.date as any).toLocaleDateString()}
                        </p>
                        {exp.remarks && <p className="text-[8px] font-bold text-slate-300 italic mt-2">"{exp.remarks}"</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-slate-900 tracking-tighter">{formatCurrency(exp.amount)}</div>
                      <button 
                        onClick={() => dataService.deleteDocument('education_expenses', exp.id!)}
                        className="p-3 text-slate-100 hover:text-rose-500 transition-all mt-3"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })
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
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Select Expense Category</label>
                <div className="grid grid-cols-2 gap-4">
                  {EDUCATION_SUB_CATEGORIES.map(cat => (
                    <button
                      key={cat.en}
                      type="button"
                      onClick={() => setFormData({ ...formData, subCategory: cat.en })}
                      className={cn(
                        "p-5 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all border text-center leading-relaxed",
                        formData.subCategory === cat.en 
                          ? "bg-teal-600 border-teal-600 text-white shadow-xl shadow-teal-100" 
                          : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100"
                      )}
                    >
                      {cat[lang]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Amount (৳)</label>
                  <input 
                    type="number"
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 font-black text-3xl tracking-tighter focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Date</label>
                  <input 
                    type="date"
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 font-black text-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{t.remarks[lang]} (Optional)</label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 font-bold text-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all resize-none"
                  rows={3}
                  placeholder="..."
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                />
              </div>

              <div className="flex gap-4 pt-6">
                 <button 
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-400 font-black py-5 rounded-3xl transition-all uppercase tracking-widest text-xs"
                 >
                   {t.cancel[lang]}
                 </button>
                 <button 
                  type="submit"
                  className="flex-[2] bg-teal-600 hover:bg-teal-700 text-white font-black py-5 rounded-3xl shadow-2xl shadow-teal-100 transition-all uppercase tracking-widest text-xs"
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
