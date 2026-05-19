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
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedItems, setSelectedItems] = useState<BazarItem[]>([]);
  const [customItems, setCustomItems] = useState<any[]>([]);
  const [history, setHistory] = useState<BazarLog[]>([]);
  const [activeTab, setActiveTab] = useState<'new' | 'history' | 'settings'>('new');
  const [isSaving, setIsSaving] = useState(false);
  const [newItemForm, setNewItemForm] = useState({ name: '', bn: '', category: 'Vegetables', unit: 'kg' });
  const [showAddForm, setShowAddForm] = useState(false);

  const lang = dataService.getLanguage() as 'en' | 'bn';
  const t = UI_STRINGS;

  useEffect(() => {
    const unsubHistory = dataService.subscribeToCollection<BazarLog>('bazar_logs', setHistory);
    const unsubItems = dataService.subscribeToCollection<any>('custom_bazar_items', setCustomItems);
    return () => {
      unsubHistory && unsubHistory();
      unsubItems && unsubItems();
    };
  }, []);

  useEffect(() => {
    if (selectedCategory !== 'All') {
      setNewItemForm(prev => ({ ...prev, category: selectedCategory }));
    }
  }, [selectedCategory]);

  const allAvailableItems = [...PRELOADED_BAZAR_ITEMS, ...customItems];

  const filteredItems = allAvailableItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.bn && item.bn.includes(searchTerm));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  const handleAddNewItem = async () => {
    if (!newItemForm.name) return;
    await dataService.addDocument('custom_bazar_items', newItemForm);
    setNewItemForm({ name: '', bn: '', category: 'Vegetables', unit: 'kg' });
    setShowAddForm(false);
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
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">{lang === 'en' ? 'Track your daily expenses' : 'দৈনন্দিন সকল খরচের হিসাব রাখুন'}</p>
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
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === 'settings' ? "bg-teal-600 text-white shadow-lg shadow-teal-100" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {activeTab === 'new' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Item Selector */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="text"
                  placeholder={lang === 'en' ? "Search items..." : "খুঁজুন..."}
                  className="w-full bg-white border border-slate-200 rounded-3xl py-5 pl-14 pr-6 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-bold outline-none shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setActiveTab('settings')}
                className="p-5 bg-white border border-slate-200 rounded-[28px] text-teal-600 hover:bg-teal-50 transition-all shadow-sm"
                title={lang === 'en' ? "Add Custom Item" : "নতুন আইটেম যোগ করুন"}
              >
                <PlusCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
              <button
                onClick={() => setSelectedCategory('All')}
                className={cn(
                  "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border",
                  selectedCategory === 'All' ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                )}
              >
                {lang === 'en' ? 'All' : 'সব'}
              </button>
              {BAZAR_CATEGORIES.map(cat => (
                <button
                  key={cat.en}
                  onClick={() => setSelectedCategory(cat.en)}
                  className={cn(
                    "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border",
                    selectedCategory === cat.en ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                  )}
                >
                  {cat[lang]}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredItems.map((item) => (
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

              <button
                onClick={() => setActiveTab('settings')}
                className="p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl text-center hover:border-teal-500 hover:bg-teal-50 group transition-all"
              >
                <div className="flex flex-col items-center justify-center gap-1">
                  <PlusCircle className="w-6 h-6 text-slate-300 group-hover:text-teal-500 transition-colors" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-teal-600">
                    {lang === 'en' ? 'Add Others' : 'অন্যান্য যোগ করুন'}
                  </p>
                </div>
              </button>

              {filteredItems.length === 0 && (
                <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                   <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                     {lang === 'en' ? `No ${selectedCategory === 'All' ? '' : selectedCategory} items found` : `কোনো ${selectedCategory === 'All' ? '' : BAZAR_CATEGORIES.find(c => c.en === selectedCategory)?.[lang]} খুঁজে পাওয়া যায়নি`}
                   </p>
                   <button 
                     onClick={() => setActiveTab('settings')}
                     className="mt-4 px-6 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-teal-600 transition-all"
                   >
                     {lang === 'en' ? 'Add to list' : 'তালিকায় যোগ করুন'}
                   </button>
                </div>
              )}
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
      ) : activeTab === 'settings' ? (
        /* Settings / Add New Item View */
        <div className="max-w-2xl mx-auto w-full">
           <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-sm">
             <div className="flex items-center gap-4 mb-10">
               <div className="p-4 bg-teal-50 text-teal-600 rounded-3xl">
                 <PlusCircle className="w-8 h-8" />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {lang === 'en' ? 'Add New Product' : 'নতুন পণ্য যোগ করুন'}
                  </h3>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">
                    {lang === 'en' ? 'Expand your market list' : 'আপনার বাজারের তালিকা বড় করুন'}
                  </p>
               </div>
             </div>

             <div className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Name (English)</label>
                   <input 
                     type="text"
                     placeholder="e.g. Brokkoli"
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-teal-500 transition-all"
                     value={newItemForm.name}
                     onChange={e => setNewItemForm({...newItemForm, name: e.target.value})}
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Name (Bengali)</label>
                   <input 
                     type="text"
                     placeholder="উদাঃ ব্রকলি"
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-teal-500 transition-all"
                     value={newItemForm.bn}
                     onChange={e => setNewItemForm({...newItemForm, bn: e.target.value})}
                   />
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Category</label>
                   <select 
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none appearance-none"
                     value={newItemForm.category}
                     onChange={e => setNewItemForm({...newItemForm, category: e.target.value})}
                   >
                     {BAZAR_CATEGORIES.map(cat => (
                       <option key={cat.en} value={cat.en}>{cat[lang]}</option>
                     ))}
                   </select>
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Default Unit</label>
                   <select 
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold outline-none appearance-none"
                     value={newItemForm.unit}
                     onChange={e => setNewItemForm({...newItemForm, unit: e.target.value})}
                   >
                     <option value="kg">kg</option>
                     <option value="gram">gram</option>
                     <option value="piece">piece</option>
                     <option value="dozen">dozen</option>
                     <option value="packet">packet</option>
                     <option value="litre">litre</option>
                     <option value="bundle">bundle</option>
                   </select>
                 </div>
               </div>

               <button 
                 onClick={handleAddNewItem}
                 disabled={!newItemForm.name}
                 className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-black py-5 rounded-3xl transition-all shadow-xl shadow-slate-100 uppercase tracking-widest text-xs mt-4"
               >
                 {lang === 'en' ? 'Add to Permanent List' : 'স্থায়ী তালিকায় যোগ করুন'}
               </button>
             </div>

             <div className="mt-12 pt-12 border-t border-slate-100">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Your Custom Items</h4>
                <div className="space-y-3">
                   {customItems.length === 0 ? (
                      <p className="text-[10px] text-slate-400 font-bold italic">No custom items added yet</p>
                   ) : (
                      customItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                           <div>
                              <p className="font-black text-slate-900 text-sm">{item[lang] || item.name}</p>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.category} • {item.unit}</p>
                           </div>
                           <button 
                             onClick={() => dataService.deleteDocument('custom_bazar_items', item.id)}
                             className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-all"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      ))
                   )}
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
                       {lang === 'en' ? 'Personal Expense' : 'ব্যক্তিগত খরচ'}
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
