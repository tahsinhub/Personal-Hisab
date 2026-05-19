import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  ReceiptText, 
  GraduationCap, 
  HandCoins, 
  Database,
  ArrowUpCircle,
  Menu,
  X,
  LogOut,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  User,
  ArrowLeftRight
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
type AppMode = 'personal' | 'business' | null;

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [history, setHistory] = useState<Tab[]>(['dashboard']);
  const [personalUnlocked, setPersonalUnlocked] = useState(false);
  const [businessUnlocked, setBusinessUnlocked] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appMode, setAppMode] = useState<AppMode>(null);

  const navigateTo = (tab: Tab) => {
    setActiveTab(tab);
    setHistory(prev => [...prev, tab]);
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop(); // remove current
      const lastTab = newHistory[newHistory.length - 1];
      setActiveTab(lastTab);
      setHistory(newHistory);
    } else if (appMode) {
       // if we are at home of a mode, maybe go back to mode selection?
       // but user might want to stay. Let's provide a switch button instead.
    }
  };

  useEffect(() => {
    // We could persist these but for "session" feel, let's keep them in memory for now
    // or use a short-lived localStorage if user really wants persistence.
    // The user's request sounds like they want to be prompted when entering.
  }, []);

  const lang = dataService.getLanguage() as 'en' | 'bn';
  const t = UI_STRINGS;

  const allTabs: { id: Tab; label: string; icon: any; mode: 'personal' | 'business' | 'both' }[] = [
    { id: 'dashboard', label: t.dashboard[lang], icon: LayoutDashboard, mode: 'personal' },
    { id: 'income', label: t.income[lang], icon: ArrowUpCircle, mode: 'personal' },
    { id: 'bazar', label: t.bazar[lang], icon: Wallet, mode: 'personal' },
    { id: 'bills', label: t.bills[lang], icon: ReceiptText, mode: 'personal' },
    { id: 'school', label: t.school[lang], icon: GraduationCap, mode: 'personal' },
    { id: 'loans', label: t.loans[lang], icon: HandCoins, mode: 'personal' },
    { id: 'business', label: t.business[lang], icon: Briefcase, mode: 'business' },
    { id: 'backup', label: t.backup[lang], icon: Database, mode: 'both' },
  ];

  const tabs = allTabs.filter(tab => tab.mode === appMode || tab.mode === 'both');

  if (!appMode) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.05),transparent),radial-gradient(circle_at_bottom_left,rgba(79,70,229,0.05),transparent)]">
        <div className="w-full max-w-4xl space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-[32px] bg-white border border-slate-100 shadow-xl mb-6">
              <Logo size={64} className="rotate-6" />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">Humaid's Corner Premium Access</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
            <motion.button
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setAppMode('personal'); setActiveTab('dashboard'); }}
              className="group relative bg-white border border-slate-100 p-10 rounded-[48px] shadow-2xl hover:shadow-teal-100/50 transition-all text-left overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-teal-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <div className="relative z-10 space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-200">
                  <User className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{t.personal[lang]}</h2>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">{lang === 'en' ? 'Expenses, Income & Bills' : 'খরচ, আয় ও বিলের হিসাব'}</p>
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setAppMode('business'); setActiveTab('business'); }}
              className="group relative bg-slate-900 border border-slate-800 p-10 rounded-[48px] shadow-2xl hover:shadow-indigo-900/40 transition-all text-left overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <div className="relative z-10 space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-900/50">
                  <Briefcase className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight">{t.business[lang]}</h2>
                  <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2">{lang === 'en' ? 'Sales, Stock & Customers' : 'বিক্রয়, স্টক ও কাস্টমার'}</p>
                </div>
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  if (appMode === 'personal' && !personalUnlocked) {
    return (
      <LockScreen 
        onUnlock={() => setPersonalUnlocked(true)} 
        expectedPassword="43625391"
        title={t.personal[lang]}
        subtitle={lang === 'en' ? 'Personal Access Key Required' : 'ব্যক্তিগত এক্সেস কি প্রয়োজন'}
      />
    );
  }

  if (appMode === 'business' && !businessUnlocked) {
    return (
      <LockScreen 
        onUnlock={() => setBusinessUnlocked(true)} 
        expectedPassword="hcb11121"
        title={t.business[lang]}
        subtitle={lang === 'en' ? 'Business Access Key Required' : 'বিজনেস এক্সেস কি প্রয়োজন'}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row pb-20 md:pb-0 font-sans">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 p-8 sticky top-0 h-screen">
        <div className="flex items-center gap-4 mb-12 px-2 cursor-pointer" onClick={() => setActiveTab(tabs[0].id)}>
          <Logo size={48} className="rotate-3" />
          <div>
            <h1 className="font-black text-xl text-slate-900 tracking-tighter leading-none">Humaid's</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{appMode === 'personal' ? t.personal[lang] : t.business[lang]}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigateTo(tab.id)}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all text-sm font-black uppercase tracking-widest",
                activeTab === tab.id 
                  ? (appMode === 'personal' ? "bg-teal-600 text-white shadow-xl shadow-teal-100 scale-[1.02]" : "bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02]") 
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              )}
            >
              <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "stroke-[3px]" : "stroke-[2px]")} />
              {tab.label}
            </button>
          ))}
          
          <button
            onClick={() => setAppMode(null)}
            className="w-full mt-4 flex items-center gap-4 px-5 py-4 rounded-2xl transition-all text-sm font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50"
          >
            <ArrowLeftRight className="w-5 h-5" />
            {t.switchMode[lang]}
          </button>
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
              setPersonalUnlocked(false);
              setBusinessUnlocked(false);
              setAppMode(null);
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
        <header className="md:hidden bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-2">
            {activeTab !== tabs[0].id ? (
              <button 
                onClick={goBack}
                className="p-2 -ml-2 text-slate-400 hover:text-teal-600 transition-all border border-slate-100 rounded-xl bg-slate-50 mr-1"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={() => setAppMode(null)}
                className="p-2 -ml-2 text-slate-400 hover:text-teal-600 transition-all border border-slate-100 rounded-xl bg-slate-50 mr-1"
              >
                <ArrowLeftRight className="w-5 h-5" />
              </button>
            )}
            <div className="flex flex-col">
              <h1 className="font-black text-lg text-slate-900 tracking-tighter shrink-0 leading-none">Humaid's Corner</h1>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{appMode === 'personal' ? t.personal[lang] : t.business[lang]}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                const currentIndex = tabs.findIndex(t => t.id === activeTab);
                const nextIndex = (currentIndex + 1) % tabs.length;
                navigateTo(tabs[nextIndex].id);
              }}
              className="p-2 text-slate-400 hover:text-teal-600 transition-all border border-slate-100 rounded-xl bg-slate-50"
              title="Next Tab"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-teal-600 transition-all border border-slate-100 rounded-xl bg-slate-50"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
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
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Logo size={40} />
                    <div>
                      <h1 className="font-black text-xl text-slate-900 tracking-tighter leading-none">Humaid's</h1>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{appMode === 'personal' ? t.personal[lang] : t.business[lang]}</p>
                    </div>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-300">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => { navigateTo(tab.id); setMobileMenuOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-4 px-6 py-5 rounded-2xl transition-all text-sm font-black uppercase tracking-[0.2em]",
                        activeTab === tab.id 
                          ? (appMode === 'personal' ? "bg-teal-600 text-white shadow-xl shadow-teal-100" : "bg-indigo-600 text-white shadow-xl shadow-indigo-100") 
                          : "text-slate-400 hover:bg-slate-50"
                      )}
                    >
                      <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "stroke-[3px]" : "stroke-[2px]")} />
                      {tab.label}
                    </button>
                  ))}
                  <button
                    onClick={() => { setAppMode(null); setMobileMenuOpen(false); }}
                    className="w-full mt-4 flex items-center gap-4 px-6 py-5 rounded-2xl transition-all text-sm font-black uppercase tracking-[0.2em] text-rose-500 hover:bg-rose-50"
                  >
                    <ArrowLeftRight className="w-5 h-5" />
                    {t.switchMode[lang]}
                  </button>
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
            onClick={() => navigateTo(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-all",
              activeTab === tab.id 
                ? (appMode === 'personal' ? "text-teal-600 scale-110" : "text-indigo-600 scale-110") 
                : "text-slate-300"
            )}
          >
            <tab.icon className={cn("w-6 h-6", activeTab === tab.id ? "stroke-[2.5px]" : "stroke-[2px]")} />
          </button>
        ))}
      </nav>
    </div>
  );
}
