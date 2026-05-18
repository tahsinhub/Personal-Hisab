import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  ReceiptText, 
  GraduationCap, 
  HandCoins, 
  Database,
  ArrowUpCircle,
  Menu,
  X,
  LogOut,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Dashboard } from './components/Dashboard';
import { Bazar } from './components/Bazar';
import { Bills } from './components/Bills';
import { Education } from './components/Education';
import { Loans } from './components/Loans';
import { Incomes } from './components/Incomes';
import { Backup } from './components/Backup';
import Business from './components/Business';
import { LockScreen } from './components/LockScreen';
import { Logo } from './components/Logo';
import { cn } from './lib/utils';
import { dataService } from './services/dataService';
import { UI_STRINGS } from './constants';

type Tab = 'dashboard' | 'income' | 'bazar' | 'bills' | 'school' | 'loans' | 'backup' | 'business';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isUnlocked, setIsUnlocked] = useState(dataService.getAuthState().authenticated);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const state = dataService.getAuthState();
    if (state.authenticated && Date.now() - (state.lastAuthenticated || 0) < 1000 * 60 * 60) {
      setIsUnlocked(true);
    }
  }, []);

  const lang = dataService.getLanguage() as 'en' | 'bn';
  const t = UI_STRINGS;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'dashboard', label: t.dashboard[lang], icon: LayoutDashboard },
    { id: 'business', label: t.business[lang], icon: Briefcase },
    { id: 'income', label: t.income[lang], icon: ArrowUpCircle },
    { id: 'bazar', label: t.bazar[lang], icon: ShoppingCart },
    { id: 'bills', label: t.bills[lang], icon: ReceiptText },
    { id: 'school', label: t.school[lang], icon: GraduationCap },
    { id: 'loans', label: t.loans[lang], icon: HandCoins },
    { id: 'backup', label: t.backup[lang], icon: Database },
  ];

  if (!isUnlocked) {
    return <LockScreen onUnlock={() => setIsUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row pb-20 md:pb-0 font-sans">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 p-8 sticky top-0 h-screen">
        <div className="flex items-center gap-4 mb-12 px-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <Logo size={48} className="rotate-3" />
          <h1 className="font-black text-2xl text-slate-900 tracking-tighter">Humaid's Corner</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all text-sm font-black uppercase tracking-widest",
                activeTab === tab.id 
                  ? "bg-teal-600 text-white shadow-xl shadow-teal-100 scale-[1.02]" 
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              )}
            >
              <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "stroke-[3px]" : "stroke-[2px]")} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-slate-100 flex items-center gap-4 px-4">
          <div className="relative">
            <Logo size={40} className="rounded-xl border-2 border-white shadow-sm" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-teal-500 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1 overflow-hidden">
             <p className="text-xs font-black text-slate-900 truncate uppercase tracking-tighter">Owner</p>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Offline Mode</p>
          </div>
          <button 
            onClick={() => {
              dataService.saveAuthState({ authenticated: false, failedAttempts: 0, lastFailedTime: 0 });
              setIsUnlocked(false);
            }}
            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
            title="Lock App"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50/50">
        <header className="md:hidden bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <Logo size={32} />
            <h1 className="font-black text-lg text-slate-900 tracking-tighter">Humaid's Corner</h1>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-teal-600 transition-all border border-slate-100 rounded-xl bg-slate-50"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile menu overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] md:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="fixed top-0 right-0 bottom-0 w-80 bg-white z-[70] p-8 md:hidden"
              >
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-3">
                    <Logo size={40} />
                    <h1 className="font-black text-xl text-slate-900 tracking-tighter">Corner</h1>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-300">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-4 px-6 py-5 rounded-2xl transition-all text-sm font-black uppercase tracking-[0.2em]",
                        activeTab === tab.id 
                          ? "bg-teal-600 text-white shadow-xl shadow-teal-100" 
                          : "text-slate-400 hover:bg-slate-50"
                      )}
                    >
                      <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "stroke-[3px]" : "stroke-[2px]")} />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="p-6 md:p-12 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'income' && <Incomes />}
              {activeTab === 'bazar' && <Bazar />}
              {activeTab === 'bills' && <Bills />}
              {activeTab === 'school' && <Education />}
              {activeTab === 'loans' && <Loans />}
              {activeTab === 'backup' && <Backup />}
              {activeTab === 'business' && <Business />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-3 flex justify-around items-center z-50 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {tabs.slice(0, 5).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-all",
              activeTab === tab.id ? "text-teal-600 scale-110" : "text-slate-300"
            )}
          >
            <tab.icon className={cn("w-6 h-6", activeTab === tab.id ? "stroke-[2.5px]" : "stroke-[2px]")} />
          </button>
        ))}
      </nav>
    </div>
  );
}
