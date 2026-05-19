import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  Calendar,
  Printer,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { Income, BazarLog, Bill, EducationExpense, Loan } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { MONTHS, UI_STRINGS } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export const Dashboard: React.FC = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [bazarLogs, setBazarLogs] = useState<BazarLog[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [education, setEducation] = useState<EducationExpense[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const lang = dataService.getLanguage() as 'en' | 'bn';
  const t = UI_STRINGS;

  useEffect(() => {
    const unsubIncomes = dataService.subscribeToCollection<Income>('incomes', setIncomes);
    const unsubBazar = dataService.subscribeToCollection<BazarLog>('bazar_logs', setBazarLogs);
    const unsubBills = dataService.subscribeToCollection<Bill>('bills', setBills);
    const unsubEdu = dataService.subscribeToCollection<EducationExpense>('education_expenses', setEducation);

    return () => {
      unsubIncomes && unsubIncomes();
      unsubBazar && unsubBazar();
      unsubBills && unsubBills();
      unsubEdu && unsubEdu();
    };
  }, []);

  // Filter logic
  const currentMonthIncomes = incomes.filter(inc => {
    const d = new Date(inc.date as any);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const currentMonthBazar = bazarLogs.filter(log => {
    const d = new Date(log.date as any);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const currentMonthBills = bills.filter(bill => bill.month === selectedMonth && bill.year === selectedYear);
  
  const currentMonthEdu = education.filter(exp => {
    const d = new Date(exp.date as any);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const totalIncome = currentMonthIncomes.reduce((sum, item) => sum + item.amount, 0);
  const totalBazar = currentMonthBazar.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalBills = currentMonthBills.reduce((sum, item) => sum + item.amount, 0);
  const totalEdu = currentMonthEdu.reduce((sum, item) => sum + item.amount, 0);
  
  const totalExpense = totalBazar + totalBills + totalEdu;
  const balance = totalIncome - totalExpense;

  const chartData = [
    { name: t.bazar[lang], value: totalBazar, color: '#0d9488' },
    { name: t.bills[lang], value: totalBills, color: '#0891b2' },
    { name: t.school[lang], value: totalEdu, color: '#4f46e5' },
  ];

  const handlePrint = () => {
    window.print();
  };

  const changeMonth = (delta: number) => {
    let newMonth = selectedMonth + delta;
    let newYear = selectedYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  return (
    <div className="space-y-10 pb-20 print:p-0 print:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {lang === 'en' ? 'Summary for' : 'সারসংক্ষেপ -'} {MONTHS[selectedMonth][lang]} {selectedYear}
          </h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1 print:hidden">
            {lang === 'en' ? 'Local Financial Overview' : 'আপনার স্থানীয় আর্থিক চিত্র'}
          </p>
        </div>
        
        <div className="flex items-center gap-3 print:hidden">
           <div className="flex items-center gap-1 bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
              <button 
                onClick={() => changeMonth(-1)}
                className="p-3 hover:bg-slate-50 rounded-xl text-slate-400"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="px-4 font-black text-sm text-slate-900 uppercase tracking-tighter">
                {MONTHS[selectedMonth][lang]}
              </div>
              <button 
                onClick={() => changeMonth(1)}
                className="p-3 hover:bg-slate-50 rounded-xl text-slate-400"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
           </div>

           <button 
            onClick={handlePrint}
            className="p-4 bg-white border border-slate-200 text-slate-500 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
            title="Print PDF Report"
           >
             <Printer className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatsCard 
          title={t.totalIncome[lang]} 
          amount={totalIncome} 
          icon={TrendingUp} 
          color="teal"
          lang={lang}
        />
        <StatsCard 
          title={t.totalExpense[lang]} 
          amount={totalExpense} 
          icon={TrendingDown} 
          color="rose"
          lang={lang}
        />
        <StatsCard 
          title={t.balance[lang]} 
          amount={balance} 
          icon={Wallet} 
          color="indigo"
          isBalance
          lang={lang}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Spending Distribution */}
        <div className="lg:col-span-2 bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 min-h-[400px]">
          <h3 className="text-xl font-black text-slate-900 mb-10 flex items-center gap-3 uppercase tracking-tighter">
            <ArrowUpRight className="w-6 h-6 text-teal-600" />
            {lang === 'en' ? 'Expense Distribution' : 'ব্যয় বিভাজন'}
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} dy={10} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc', radius: 12 }}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '16px' }}
                />
                <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={50}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart Legend */}
        <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 flex flex-col justify-center">
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.filter(d => d.value > 0)}
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 mt-8">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{item.name}</span>
                </div>
                <div className="text-sm font-black text-slate-900">{formatCurrency(item.value)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Print Content (Only visible in Print) */}
      <div className="hidden print:block space-y-10 pt-10 border-t-4 border-slate-900">
        <h3 className="text-2xl font-black uppercase underline">Detailed Transaction List</h3>
        
        <section className="space-y-4">
          <h4 className="text-lg font-black uppercase text-teal-600">Monthly Incomes</h4>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100 uppercase text-[10px] font-black">
                <th className="p-3 text-left border">Date</th>
                <th className="p-3 text-left border">Source</th>
                <th className="p-3 text-left border">Remarks</th>
                <th className="p-3 text-right border">Amount</th>
              </tr>
            </thead>
            <tbody>
              {currentMonthIncomes.map((inc, i) => (
                <tr key={i} className="text-xs font-bold border-b">
                  <td className="p-3 border">{new Date(inc.date as any).toLocaleDateString()}</td>
                  <td className="p-3 border">{inc.source}</td>
                  <td className="p-3 border italic text-slate-400">{inc.remarks || '-'}</td>
                  <td className="p-3 text-right border font-black">{formatCurrency(inc.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="space-y-4">
          <h4 className="text-lg font-black uppercase text-rose-600">Monthly Expenses</h4>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100 uppercase text-[10px] font-black">
                <th className="p-3 text-left border">Date</th>
                <th className="p-3 text-left border">Type</th>
                <th className="p-3 text-left border">Description</th>
                <th className="p-3 text-right border">Amount</th>
              </tr>
            </thead>
            <tbody>
              {currentMonthBazar.map((log, i) => (
                <tr key={`bazar-${i}`} className="text-xs font-bold border-b">
                  <td className="p-3 border">{new Date(log.date as any).toLocaleDateString()}</td>
                  <td className="p-3 border">{t.bazar[lang]}</td>
                  <td className="p-3 border text-slate-400 italic">{lang === 'en' ? 'Daily Expense' : 'দৈনিক খরচ'}</td>
                  <td className="p-3 text-right border font-black">{formatCurrency(log.totalAmount)}</td>
                </tr>
              ))}
              {currentMonthBills.map((bill, i) => (
                <tr key={`bill-${i}`} className="text-xs font-bold border-b">
                  <td className="p-3 border">-</td>
                  <td className="p-3 border">{bill.category}</td>
                  <td className="p-3 border text-slate-400 italic">{bill.remarks || 'Monthly Bill'}</td>
                  <td className="p-3 text-right border font-black">{formatCurrency(bill.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {/* Mini Recent List in UI */}
      <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 print:hidden">
        <h3 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tighter">
          {lang === 'en' ? 'Recent Income Activity' : 'সাম্প্রতিক আয়'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentMonthIncomes.length === 0 ? (
            <p className="text-slate-300 font-bold uppercase text-[10px] tracking-widest text-center py-8 col-span-full">No records found</p>
          ) : (
            currentMonthIncomes.slice(0, 6).map((inc, i) => (
              <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl hover:bg-slate-100 transition-all border border-transparent hover:border-teal-100">
                <div>
                  <div className="font-black text-slate-900 uppercase tracking-tighter text-sm">{inc.source}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{new Date(inc.date as any).toLocaleDateString()}</div>
                </div>
                <div className="flex flex-col items-end">
                   <div className="font-black text-teal-600">+{formatCurrency(inc.amount)}</div>
                   {inc.remarks && <p className="text-[8px] font-bold text-slate-300 max-w-[100px] truncate">{inc.remarks}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const StatsCard: React.FC<{ 
  title: string; 
  amount: number; 
  icon: any; 
  color: 'teal' | 'rose' | 'indigo';
  isBalance?: boolean;
  lang: 'en' | 'bn';
}> = ({ title, amount, icon: Icon, color, isBalance, lang }) => {
  const colors = {
    teal: "bg-teal-50 text-teal-600 border-teal-100 shadow-teal-100/20",
    rose: "bg-rose-50 text-rose-600 border-rose-100 shadow-rose-100/20",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-100/20"
  };

  const isZero = amount === 0;
  const isNegative = isBalance && amount < 0;

  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 relative overflow-hidden group"
    >
      <div className={cn(
        "absolute -right-8 -top-8 w-40 h-40 opacity-[0.03] group-hover:opacity-[0.06] transition-all rounded-full",
        colors[color].split(' ')[0]
      )} />
      
      <div className="flex items-center justify-between mb-8">
        <div className={cn("p-4 rounded-2xl shadow-lg border", colors[color])}>
          <Icon className="w-7 h-7" />
        </div>
        {isBalance && (
          <span className={cn(
            "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
            isNegative ? "bg-rose-500 text-white" : "bg-teal-500 text-white"
          )}>
            {isNegative ? (lang === 'en' ? 'OVERSPENT' : 'অতিরিক্ত ব্যয়') : (lang === 'en' ? 'SAFE' : 'সঠিক')}
          </span>
        )}
      </div>
      <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">{title}</p>
      <h4 className={cn(
        "text-3xl font-black mt-2 tracking-tighter",
        isNegative ? "text-rose-600" : "text-slate-900"
      )}>
        {formatCurrency(amount)}
      </h4>
    </motion.div>
  );
};
