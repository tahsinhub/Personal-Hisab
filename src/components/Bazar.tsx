import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  PlusCircle,
  History,
  Tag,
  StickyNote
} from 'lucide-react';
import { PRELOADED_BAZAR_ITEMS, BAZAR_CATEGORIES, UI_STRINGS } from '../constants';
import { BazarItem, BazarLog } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { dataService } from '../services/dataService';

export const Bazar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<BazarItem[]>([]);
  const [history, setHistory] = useState<BazarLog[]>([]);
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [isSaving, setIsSaving] = useState(false);
  const lang = dataService.getLanguage() as 'en' | 'bn';
  const t = UI_STRINGS;

  useEffect(() => {
    const unsub = dataService.subscribeToCollection<BazarLog>('bazar_logs', setHistory);
    return () => unsub && unsub();
  }, []);

  const filteredItems = PRELOADED_BAZAR_ITEMS.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.bn && item.bn.includes(searchTerm))
  );

  const addItemToCart = (item: any) => {
    const existing = selectedItems.find(i => i.name === item.name);
    if (existing) {
      setSelectedItems(selectedItems.map(i => 
        i.name === item.name ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice } : i
      ));
    } else {
      setSelectedItems([
        ...selectedItems, 
        { ...item, quantity: 1, unitPrice: 0, total: 0 }
      ]);
    }
  };

  const updateItem = (name: string, updates: Partial<BazarItem>) => {
    setSelectedItems(selectedItems.map(i => {
      if (i.name === name) {
        const newItem = { ...i, ...updates };
        newItem.total = newItem.quantity * newItem.unitPrice;
        return newItem;
      }
      return i;
    }));
  };

  const removeItem = (name: string) => {
    setSelectedItems(selectedItems.filter(i => i.name !== name));
  };

  const grandTotal = selectedItems.reduce((sum, i) => sum + i.total, 0);

  const handleSaveBazar = async () => {
    if (selectedItems.length === 0) return;
    setIsSaving(true);
    try {
      await dataService.addDocument<BazarLog>('bazar_logs', {
        date: new Date(),
        totalAmount: grandTotal,
        items: selectedItems
      });
      setSelectedItems([]);
      setActiveTab('history');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t.bazar[lang]}</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">{lang === 'en' ? 'Weekly Shopping List' : 'সাপ্তাহিক বাজার তালিকা'}</p>
        </div>

        <div className="flex p-1 bg-white rounded-2xl shadow-sm border border-slate-100">
          <button 
            onClick={() => setActiveTab('new')}
            className={cn(
              "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === 'new' ? "bg-teal-600 text-white shadow-lg shadow-teal-100" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {lang === 'en' ? 'New List' : 'নতুন তালিকা'}
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={cn(
              "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === 'history' ? "bg-teal-600 text-white shadow-lg shadow-teal-100" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {lang === 'en' ? 'History' : 'পূর্বের তালিকা'}
          </button>
        </div>
      </div>

      {activeTab === 'new' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Item Selector */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                type="text"
                placeholder={lang === 'en' ? "Search items (Potato, Onion...)" : "খুঁজুন (আলু, পেঁয়াজ...)"}
                className="w-full bg-white border border-slate-200 rounded-3xl py-5 pl-14 pr-6 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-bold outline-none shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredItems.slice(0, 15).map((item) => (
                <button
                  key={item.name}
                  onClick={() => addItemToCart(item)}
                  className="p-4 bg-white border border-slate-100 rounded-3xl text-left hover:border-teal-500 hover:bg-teal-50/50 group transition-all shadow-sm"
                >
                  <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1 group-hover:scale-105 transition-transform">
                    {BAZAR_CATEGORIES.find(c => c.en === item.category)?.[lang] || item.category}
                  </p>
                  <p className="font-black text-slate-900 tracking-tight">{item[lang] || item.name}</p>
                  <div className="flex items-center justify-between mt-3 text-[10px] font-black text-slate-400">
                    <span className="uppercase tracking-widest">{item.unit}</span>
                    <PlusCircle className="w-5 h-5 text-slate-100 group-hover:text-teal-500" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Cart / Selection */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm sticky top-10">
              <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center justify-between uppercase tracking-tighter">
                {lang === 'en' ? 'Current List' : 'বর্তমান তালিকা'}
                <span className="text-[10px] font-black px-3 py-1 bg-slate-100 rounded-full text-slate-500 uppercase tracking-widest">
                  {selectedItems.length} {lang === 'en' ? 'Items' : 'টি আইটেম'}
                </span>
              </h3>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence>
                  {selectedItems.map((item) => (
                    <motion.div 
                      key={item.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.category}</p>
                          <h4 className="font-black text-slate-900 leading-tight">{item[lang] || item.name}</h4>
                        </div>
                        <button onClick={() => removeItem(item.name)} className="text-rose-500 hover:scale-110 transition-transform">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity ({item.unit})</label>
                          <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl p-1 px-2">
                            <button onClick={() => updateItem(item.name, { quantity: Math.max(0.01, item.quantity - 1) })} className="p-2 text-slate-400 hover:text-teal-600">
                              <Minus className="w-3 h-3" />
                            </button>
                            <input 
                              type="number"
                              step="0.01"
                              className="flex-1 text-center font-black text-slate-900 text-sm bg-transparent outline-none w-16"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.name, { quantity: parseFloat(e.target.value) || 0 })}
                            />
                            <button onClick={() => updateItem(item.name, { quantity: item.quantity + 1 })} className="p-2 text-slate-400 hover:text-teal-600">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Price / {item.unit}</label>
                          <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300" />
                            <input 
                              type="number" 
                              className="w-full bg-white border border-slate-100 rounded-2xl p-2.5 pl-8 font-black text-slate-900 text-sm focus:outline-none"
                              value={item.unitPrice || ''}
                              placeholder="0.00"
                              onChange={(e) => updateItem(item.name, { unitPrice: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <StickyNote className="w-3 h-3 text-slate-300" />
                            <input 
                               placeholder={t.remarks[lang]}
                               className="bg-transparent text-[10px] font-bold text-slate-400 outline-none w-32"
                               value={item.remarks || ''}
                               onChange={(e) => updateItem(item.name, { remarks: e.target.value })}
                            />
                         </div>
                         <span className="text-sm font-black text-teal-600">{formatCurrency(item.total)}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="mt-8 pt-8 border-t-2 border-dashed border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.balance[lang]}</span>
                  <span className="text-2xl font-black text-slate-900">{formatCurrency(grandTotal)}</span>
                </div>
                <button
                  onClick={handleSaveBazar}
                  disabled={selectedItems.length === 0 || isSaving}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 text-white font-black py-5 rounded-3xl transition-all shadow-xl shadow-teal-100 uppercase tracking-widest text-xs"
                >
                  {isSaving ? 'Saving...' : (lang === 'en' ? 'Add Records' : 'হিসাব সংরক্ষণ করুন')}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* History View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {history.length === 0 ? (
            <div className="col-span-full py-20 text-center">
               <History className="w-12 h-12 text-slate-100 mx-auto mb-4" />
               <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No previous history found</p>
            </div>
          ) : (
            history.map((log) => (
              <div key={log.id} className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm group hover:border-teal-100 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="font-black text-slate-900 leading-tight">
                       {lang === 'en' ? 'Bazar Shopping' : 'বাজার খরচ'}
                    </h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                      {new Date(log.date as any).toLocaleDateString()} at {new Date(log.date as any).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button 
                    onClick={() => dataService.deleteDocument('bazar_logs', log.id!)}
                    className="p-2 text-slate-200 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2 mb-6">
                  {log.items.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex justify-between text-xs font-bold text-slate-500">
                      <span>{item.quantity}{item.unit} {item[lang] || item.name}</span>
                      <span className="text-slate-400">{formatCurrency(item.total)}</span>
                    </div>
                  ))}
                  {log.items.length > 3 && (
                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest pt-1">
                      + {log.items.length - 3} more items
                    </p>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                  {log.remarks && <p className="text-[8px] font-bold text-slate-300 italic">{log.remarks}</p>}
                  <span className="text-lg font-black text-teal-600 ml-auto">{formatCurrency(log.totalAmount)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
