import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ReceiptText, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Calendar, 
  Trash2,
  AlertCircle,
  X,
  StickyNote
} from 'lucide-react';
import { BILL_CATEGORIES, MONTHS, UI_STRINGS } from '../constants';
import { Bill } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { dataService } from '../services/dataService';

export const Bills: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showAddModal, setShowAddModal] = useState(false);
  const lang = dataService.getLanguage() as 'en' | 'bn';
  const t = UI_STRINGS;
  
  const [newBill, setNewBill] = useState({ category: BILL_CATEGORIES[0].en, amount: 0, isPaid: false, remarks: '' });

  useEffect(() => {
    const unsub = dataService.subscribeToCollection<Bill>('bills', (data) => {
      setBills(data.filter(b => b.year === selectedYear));
    });
    return () => unsub && unsub();
  }, [selectedYear]);

  const currentMonthBills = bills.filter(b => b.month === selectedMonth);

  const handleAddBill = async () => {
    if (newBill.amount <= 0) return;
    try {
      await dataService.addDocument<Bill>('bills', {
        ...newBill,
        month: selectedMonth,
        year: selectedYear,
        paidAt: newBill.isPaid ? new Date() : undefined
      });
      setShowAddModal(false);
      setNewBill({ category: BILL_CATEGORIES[0].en, amount: 0, isPaid: false, remarks: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const togglePaidStatus = async (bill: Bill) => {
    try {
      await dataService.updateDocument('bills', bill.id!, {
        isPaid: !bill.isPaid,
        paidAt: !bill.isPaid ? new Date() : null
      });
    } catch (err) {
      console.error(err);
    }
  };

  const totalMonthlyBills = currentMonthBills.reduce((sum, b) => sum + b.amount, 0);
  const paidCount = currentMonthBills.filter(b => b.isPaid).length;

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t.bills[lang]}</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">{lang === 'en' ? 'Monthly Utility Records' : 'মাসিক বিলের হিসাব'}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="bg-transparent text-xs font-black px-4 py-2 focus:outline-none uppercase tracking-tighter"
            >
              {MONTHS.map((m, i) => <option key={m.en} value={i}>{m[lang]}</option>)}
            </select>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-transparent text-xs font-black px-4 py-2 focus:outline-none uppercase tracking-tighter"
            >
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="p-4 bg-teal-600 text-white rounded-2xl shadow-xl shadow-teal-100 hover:bg-teal-700 transition-all"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center justify-between col-span-1 md:col-span-2">
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{lang === 'en' ? 'Total Bills' : 'মোট বিল'}</p>
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{formatCurrency(totalMonthlyBills)}</h3>
          </div>
          <div className="p-5 bg-teal-50 rounded-3xl text-teal-600">
             <ReceiptText className="w-10 h-10" />
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm col-span-1">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{lang === 'en' ? 'Paid Status' : 'পরিশোধের অবস্থা'}</p>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-black text-slate-900 tracking-tighter">{paidCount}/{currentMonthBills.length}</div>
            <div className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{lang === 'en' ? 'Complete' : 'সম্পন্ন'}</div>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full mt-4 overflow-hidden">
             <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(paidCount / (currentMonthBills.length || 1)) * 100}%` }}
                className="bg-teal-500 h-full rounded-full"
             />
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm col-span-1">
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{lang === 'en' ? 'Pending' : 'বাকি'}</p>
           <div className="text-3xl font-black text-rose-500 tracking-tighter">
             {formatCurrency(currentMonthBills.filter(b => !b.isPaid).reduce((s, b) => s + b.amount, 0))}
           </div>
        </div>
      </div>

      {/* Bills list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentMonthBills.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-white rounded-[40px] border border-dashed border-slate-100">
            <AlertCircle className="w-12 h-12 text-slate-100 mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No bills recorded for this month</p>
          </div>
        ) : (
          currentMonthBills.map((bill) => (
            <motion.div 
              key={bill.id}
              whileHover={{ y: -8 }}
              className={cn(
                "p-8 rounded-[40px] border transition-all cursor-pointer bg-white group",
                bill.isPaid ? "border-teal-50 shadow-sm" : "border-rose-50 shadow-sm"
              )}
            >
              <div className="flex items-center justify-between mb-6">
                <div className={cn(
                  "p-4 rounded-2xl",
                  bill.isPaid ? "bg-teal-50 text-teal-600" : "bg-rose-50 text-rose-600"
                )}>
                  <ReceiptText className="w-6 h-6" />
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); dataService.deleteDocument('bills', bill.id!); }}
                  className="p-3 text-slate-100 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <h4 className="font-black text-xl text-slate-900 tracking-tight">
                {BILL_CATEGORIES.find(c => c.en === bill.category)?.[lang] || bill.category}
              </h4>
              <p className="text-2xl font-black text-teal-600 mt-1 tracking-tighter">{formatCurrency(bill.amount)}</p>
              
              {bill.remarks && <p className="mt-4 text-[10px] font-bold text-slate-400 italic">"{bill.remarks}"</p>}

              <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex items-center gap-2">
                  {bill.isPaid ? (
                    <CheckCircle2 className="w-5 h-5 text-teal-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400" />
                  )}
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    bill.isPaid ? "text-teal-600" : "text-rose-500"
                  )}>
                    {bill.isPaid ? (lang === 'en' ? 'Paid' : 'পরিশোধিত') : (lang === 'en' ? 'Unpaid' : 'বাকি')}
                  </span>
                </div>
                <button 
                  onClick={() => togglePaidStatus(bill)}
                  className={cn(
                    "px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    bill.isPaid ? "bg-slate-50 text-slate-400 hover:bg-slate-100" : "bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-100"
                  )}
                >
                  {bill.isPaid ? (lang === 'en' ? 'Mark Unpaid' : 'বাকি চিহ্নিত করুন') : (lang === 'en' ? 'Mark Paid' : 'পরিশোধিত করুন')}
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl relative"
           >
             <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 p-3 text-slate-300 hover:text-slate-600 transition-all">
                <X className="w-6 h-6" />
             </button>

             <div className="mb-10">
               <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{lang === 'en' ? 'Add Monthly Bill' : 'মাসিক বিল যোগ করুন'}</h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">New Entry for {MONTHS[selectedMonth][lang]} {selectedYear}</p>
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Bill Category</label>
                  <select 
                    value={newBill.category}
                    onChange={(e) => setNewBill({ ...newBill, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-black text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
                  >
                    {BILL_CATEGORIES.map(c => <option key={c.en} value={c.en}>{c[lang]}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Amount (৳)</label>
                  <input 
                    type="number"
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-black text-2xl tracking-tighter focus:ring-2 focus:ring-teal-500/20 outline-none"
                    value={newBill.amount || ''}
                    onChange={(e) => setNewBill({ ...newBill, amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{t.remarks[lang]}</label>
                  <textarea 
                    placeholder="..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-sm focus:ring-2 focus:ring-teal-500/20 outline-none resize-none"
                    rows={2}
                    value={newBill.remarks}
                    onChange={(e) => setNewBill({ ...newBill, remarks: e.target.value })}
                  />
                </div>

                <label className="flex items-center gap-4 cursor-pointer group">
                  <div className={cn(
                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                    newBill.isPaid ? "bg-teal-600 border-teal-600 text-white" : "border-slate-200"
                  )}>
                    {newBill.isPaid && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={newBill.isPaid}
                    onChange={(e) => setNewBill({ ...newBill, isPaid: e.target.checked })}
                  />
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Already Paid?</span>
                </label>

                <div className="pt-4">
                  <button 
                    onClick={handleAddBill}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black py-5 rounded-3xl shadow-xl shadow-teal-100 transition-all uppercase tracking-widest text-xs"
                  >
                    {t.save[lang]}
                  </button>
                </div>
             </div>
           </motion.div>
        </div>
      )}
    </div>
  );
};
