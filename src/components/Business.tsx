import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  TrendingUp, 
  CreditCard, 
  Plus, 
  PlusCircle, 
  Search, 
  Trash2, 
  Phone, 
  Calendar,
  Layers,
  ArrowRight,
  UserPlus,
  MessageSquare,
  ChevronRight,
  Filter,
  History,
  Package,
  ArrowDownCircle,
  AlertCircle,
  RefreshCw,
  Printer,
  Building2,
  Smartphone,
  FileText,
  ChevronLeft
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { BusinessCustomer, BusinessSale, BusinessProduct, ActivityLog } from '../types';
import { BUSINESS_PRODUCTS as DEFAULT_PRODUCTS, BUSINESS_UNITS } from '../constants';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const Business = () => {
  const [activeTab, setActiveTab] = useState<'sales' | 'due' | 'customers' | 'stock' | 'logs'>('sales');
  const [lang, setLang] = useState(dataService.getLanguage());
  const [customers, setCustomers] = useState<BusinessCustomer[]>([]);
  const [sales, setSales] = useState<BusinessSale[]>([]);
  const [products, setProducts] = useState<BusinessProduct[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUnit, setFilterUnit] = useState<string>('All');
  
  // Modals / Forms
  const [showAddSale, setShowAddSale] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showRestock, setShowRestock] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [restockAmount, setRestockAmount] = useState({ quantity: 1, unit: 'drum' });
  
  const tabsRef = useRef<HTMLDivElement>(null);
  const unitsRef = useRef<HTMLDivElement>(null);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 200;
      ref.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };
  const [newSale, setNewSale] = useState<Partial<BusinessSale>>({
    productId: '',
    productName: '',
    unit: BUSINESS_UNITS[0],
    quantity: 1,
    salePrice: 0,
    paidAmount: 0,
    paymentMethod: 'Cash',
    bankAccountNumber: '',
    remarks: '',
    date: new Date(),
    adjustmentQuantity: 0,
    adjustmentAmount: 0
  });
  
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    whatsapp: ''
  });

  const [newProduct, setNewProduct] = useState({
    name: '',
    bn: '',
    unit: BUSINESS_UNITS[1], // kg
    stock: 0
  });

  useEffect(() => {
    const unsubCustomers = dataService.subscribeToCollection<BusinessCustomer>('business_customers', setCustomers);
    const unsubSales = dataService.subscribeToCollection<BusinessSale>('business_sales', setSales);
    const unsubProducts = dataService.subscribeToCollection<BusinessProduct>('business_products', (data) => {
      if (data.length === 0) {
        // Initialize with default products if empty
        const initial = DEFAULT_PRODUCTS.map(p => ({
          ...p,
          stock: 0,
          unit: p.name.toLowerCase().includes('liquid') ? 'litre' : 'kg'
        }));
        dataService.saveCollection('business_products', initial as BusinessProduct[]);
      } else {
        setProducts(data);
      }
    });
    const unsubLogs = dataService.subscribeToCollection<ActivityLog>('activity_logs', setLogs);
    
    return () => {
      unsubCustomers();
      unsubSales();
      unsubProducts();
      unsubLogs();
    };
  }, []);

  // Initialize newSale with first product when products load
  useEffect(() => {
    if (products.length > 0 && !newSale.productId) {
      setNewSale(prev => ({
        ...prev,
        productId: products[0].id,
        productName: products[0].name,
        unit: products[0].unit
      }));
    }
  }, [products]);

  const handlePickContact = async () => {
    try {
      // @ts-ignore - Contact Picker API
      if ('contacts' in navigator && 'select' in navigator.contacts) {
        // @ts-ignore
        const contacts = await navigator.contacts.select(['name', 'tel'], { multiple: false });
        if (contacts && contacts.length > 0) {
          const contact = contacts[0];
          setNewCustomer({
            name: contact.name?.[0] || '',
            whatsapp: contact.tel?.[0]?.replace(/\s/g, '') || ''
          });
        }
      } else {
        alert(lang === 'en' ? 'Contact picker not supported on this browser.' : 'আপনার ব্রাউজারে কন্টাক্ট পিকার সাপোর্ট করে না।');
      }
    } catch (err) {
      console.error('Contact selection failed', err);
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.name) return;
    
    const customer: BusinessCustomer = {
      id: Date.now().toString(),
      name: newCustomer.name,
      whatsapp: newCustomer.whatsapp,
      totalDue: 0,
      createdAt: new Date()
    };
    
    await dataService.addDocument('business_customers', customer);
    dataService.logActivity('create', 'Business Customer', `Added customer: ${customer.name}`);
    setNewCustomer({ name: '', whatsapp: '' });
    setShowAddCustomer(false);
  };

  const handleAddProduct = async () => {
    if (!newProduct.name) return;
    const product: BusinessProduct = {
      id: Date.now().toString(),
      name: newProduct.name,
      bn: newProduct.bn,
      unit: newProduct.unit,
      stock: newProduct.stock
    };
    await dataService.addDocument('business_products', product);
    dataService.logActivity('create', 'Business Product', `Added product: ${product.name} with stock ${product.stock} ${product.unit}`);
    setNewProduct({ name: '', bn: '', unit: BUSINESS_UNITS[1], stock: 0 });
    setShowAddProduct(false);
  };

  const handleUpdateStock = async (productId: string, newStock: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    await dataService.updateDocument('business_products', productId, { stock: newStock });
    dataService.logActivity('update', 'Business Stock', `Updated stock for ${product.name} to ${newStock} ${product.unit}`);
  };

  const handleDeleteProduct = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    if (!window.confirm(lang === 'en' ? 'Are you sure? This will not delete sales history.' : 'আপনি কি নিশ্চিত? এটি বিক্রয়ের তথ্য মুছবে না।')) return;
    await dataService.deleteDocument('business_products', productId);
    dataService.logActivity('delete', 'Business Product', `Deleted product: ${product.name}`);
  };
  
  const handleDeleteCustomer = async (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    
    // Check if customer has any sales
    const hasSales = sales.some(s => s.customerId === customerId);
    if (hasSales) {
      alert(lang === 'en' ? 'Cannot delete customer with transaction history!' : 'লেনদেনের ইতিহাস আছে এমন কাস্টমার মুছে ফেলা সম্ভব নয়!');
      return;
    }
    
    if (!window.confirm(lang === 'en' ? 'Delete this customer?' : 'কাস্টমারটি মুছে ফেলতে চান?')) return;
    
    await dataService.deleteDocument('business_customers', customerId);
    dataService.logActivity('delete', 'Business Customer', `Deleted customer: ${customer.name}`);
  };

  const convertToKg = (qty: number, unit: string): number => {
    const u = unit.toLowerCase();
    if (u === 'drum') return qty * 25;
    if (u === 'ml') return qty / 1000;
    if (u === 'gram') return qty / 1000;
    return qty; // kg and litre are treated as base 1
  };

  const handleRestock = async () => {
    const product = products.find(p => p.id === showRestock);
    if (!product || !restockAmount.quantity) return;

    const addedKg = convertToKg(restockAmount.quantity, restockAmount.unit);
    const newStock = (product.stock || 0) + addedKg;

    await dataService.updateDocument('business_products', product.id, { stock: newStock });
    dataService.logActivity('update', 'Business Stock', `Restocked ${product.name}: Added ${restockAmount.quantity} ${restockAmount.unit} (${addedKg}kg base)`);
    
    setShowRestock(null);
    setRestockAmount({ quantity: 1, unit: 'drum' });
  };

  const handleAddSale = async () => {
    if (!newSale.customerId || !newSale.quantity || !newSale.salePrice) return;
    
    const customer = customers.find(c => c.id === newSale.customerId);
    const product = products.find(p => p.id === newSale.productId);
    
    const netQuantity = (newSale.quantity || 0) - (newSale.adjustmentQuantity || 0);
    const totalAmount = netQuantity * (newSale.salePrice || 0) - (newSale.adjustmentAmount || 0);
    const dueAmount = totalAmount - (newSale.paidAmount || 0);
    
    const sale: BusinessSale = {
      id: Date.now().toString(),
      customerId: newSale.customerId,
      customerName: customer?.name || '',
      productId: newSale.productId || '',
      productName: product?.name || '',
      quantity: newSale.quantity || 0,
      unit: newSale.unit || '',
      buyPrice: newSale.buyPrice,
      salePrice: newSale.salePrice || 0,
      totalAmount,
      paidAmount: newSale.paidAmount || 0,
      dueAmount,
      paymentMethod: newSale.paymentMethod as any,
      bankAccountNumber: newSale.bankAccountNumber,
      adjustmentQuantity: newSale.adjustmentQuantity,
      adjustmentAmount: newSale.adjustmentAmount,
      date: new Date(newSale.date || Date.now()), // Handle string from input
      remarks: newSale.remarks
    };
    
    await dataService.addDocument('business_sales', sale);
    dataService.logActivity('create', 'Business Sale', `Recorded sale for ${customer?.name}: ${sale.productName} (${sale.quantity} ${sale.unit})`);
    
    // Update customer due
    if (customer) {
      await dataService.updateDocument('business_customers', customer.id, {
        totalDue: (customer.totalDue || 0) + dueAmount
      });
    }

    // Deduct from product stock with conversion
    if (product) {
      const deductionKg = convertToKg(netQuantity, newSale.unit || 'kg');
      await dataService.updateDocument('business_products', product.id, {
        stock: (product.stock || 0) - deductionKg
      });
    }
    
    setShowAddSale(false);
    setNewSale({
      productId: products[0]?.id || '',
      productName: products[0]?.name || '',
      unit: products[0]?.unit || BUSINESS_UNITS[0],
      quantity: 1,
      salePrice: 0,
      paidAmount: 0,
      paymentMethod: 'Cash',
      bankAccountNumber: '',
      remarks: '',
      date: new Date(),
      adjustmentQuantity: 0,
      adjustmentAmount: 0
    });
  };

  const handleDeleteSale = async (sale: BusinessSale) => {
    if (!window.confirm(lang === 'en' ? 'Are you sure?' : 'আপনি কি নিশ্চিত?')) return;
    
    await dataService.deleteDocument('business_sales', sale.id);
    dataService.logActivity('delete', 'Business Sale', `Deleted sale record for ${sale.customerName}: ${sale.productName}`);
    
    // Update customer due
    const customer = customers.find(c => c.id === sale.customerId);
    if (customer) {
      await dataService.updateDocument('business_customers', customer.id, {
        totalDue: Math.max(0, (customer.totalDue || 0) - sale.dueAmount)
      });
    }

    // Add back to stock
    const product = products.find(p => p.id === sale.productId);
    if (product) {
      const netQuantity = (sale.quantity || 0) - (sale.adjustmentQuantity || 0);
      await dataService.updateDocument('business_products', product.id, {
        stock: (product.stock || 0) + netQuantity
      });
    }
  };

  const totalSalesAmount = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalDueAmount = customers.reduce((acc, c) => acc + (c.totalDue || 0), 0);
  const totalProfit = sales.reduce((acc, s) => acc + (s.buyPrice ? (s.totalAmount - (s.buyPrice * s.quantity)) : 0), 0);

  const filteredSales = sales.filter(s => {
    const matchesSearch = s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnit = filterUnit === 'All' || s.unit === filterUnit;
    
    const saleDate = new Date(s.date);
    const matchesStartDate = !dateFilter.start || saleDate >= new Date(dateFilter.start);
    const matchesEndDate = !dateFilter.end || saleDate <= new Date(dateFilter.end + 'T23:59:59');
    
    return matchesSearch && matchesUnit && matchesStartDate && matchesEndDate;
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-16 h-16 text-teal-600" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{lang === 'en' ? 'Business Sales' : 'ব্যবসা বিক্রয়'}</p>
          <h2 className="text-2xl font-black text-slate-900">৳{totalSalesAmount.toLocaleString()}</h2>
        </div>
        
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <CreditCard className="w-16 h-16 text-rose-600" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{lang === 'en' ? 'Total Due' : 'মোট বকেয়া'}</p>
          <h2 className="text-2xl font-black text-rose-600">৳{totalDueAmount.toLocaleString()}</h2>
        </div>

        <div className="hidden md:block bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <Users className="w-16 h-16 text-blue-600" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{lang === 'en' ? 'Total Customers' : 'মোট কাস্টমার'}</p>
          <h2 className="text-2xl font-black text-slate-900">{customers.length}</h2>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative group w-full md:w-auto overflow-hidden">
          <div 
            ref={tabsRef}
            className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-full md:w-auto overflow-x-auto no-scrollbar scroll-smooth"
          >
            <button 
              onClick={() => setActiveTab('sales')}
              className={cn(
                "flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === 'sales' ? "bg-teal-600 text-white shadow-lg shadow-teal-100" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {lang === 'en' ? 'Sales' : 'বিক্রয়'}
            </button>
            <button 
              onClick={() => setActiveTab('due')}
              className={cn(
                "flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === 'due' ? "bg-rose-600 text-white shadow-lg shadow-rose-100" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {lang === 'en' ? 'Due' : 'বকেয়া'}
            </button>
            <button 
              onClick={() => setActiveTab('customers')}
              className={cn(
                "flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === 'customers' ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {lang === 'en' ? 'Customers' : 'কাস্টমার'}
            </button>
            <button 
              onClick={() => setActiveTab('stock')}
              className={cn(
                "flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === 'stock' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {lang === 'en' ? 'Stock' : 'স্টক'}
            </button>
            <button 
              onClick={() => setActiveTab('logs')}
              className={cn(
                "flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === 'logs' ? "bg-slate-900 text-white shadow-lg shadow-slate-100" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {lang === 'en' ? 'Logs' : 'লগ'}
            </button>
          </div>
          
          <button 
            onClick={() => scrollContainer(tabsRef, 'left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 p-2 md:hidden shadow-lg border border-slate-100 rounded-full"
          >
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          </button>
          <button 
            onClick={() => scrollContainer(tabsRef, 'right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 p-2 md:hidden shadow-lg border border-slate-100 rounded-full"
          >
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              type="text"
              placeholder={lang === 'en' ? "Search..." : "খুঁজুন..."}
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-11 pr-4 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-bold outline-none shadow-sm text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => {
              if (activeTab === 'customers') setShowAddCustomer(true);
              else if (activeTab === 'stock') setShowAddProduct(true);
              else setShowAddSale(true);
            }}
            className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-teal-600 transition-all shadow-lg shadow-slate-100"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Unit Sorting / Filtering & Date Filters */}
      {activeTab === 'sales' && (
        <div className="flex flex-col gap-4 no-print">
          <div className="relative overflow-hidden group">
            <div 
              ref={unitsRef}
              className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth"
            >
              {['All', ...BUSINESS_UNITS].map(unit => (
                <button
                  key={unit}
                  onClick={() => setFilterUnit(unit)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                    filterUnit === unit ? "bg-slate-900 text-white" : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50"
                  )}
                >
                  {unit === 'All' ? (lang === 'en' ? 'All Units' : 'সব ইউনিট') : unit}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => scrollContainer(unitsRef, 'left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 p-1.5 md:hidden shadow border border-slate-100 rounded-full"
            >
              <ChevronLeft className="w-3 h-3 text-slate-400" />
            </button>
            <button 
              onClick={() => scrollContainer(unitsRef, 'right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 p-1.5 md:hidden shadow border border-slate-100 rounded-full"
            >
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2">
               <Calendar className="w-4 h-4 text-slate-400" />
               <input 
                 type="date"
                 className="bg-slate-50 border border-slate-100 rounded-xl p-2 text-[10px] font-bold outline-none"
                 value={dateFilter.start}
                 onChange={e => setDateFilter({ ...dateFilter, start: e.target.value })}
               />
               <span className="text-slate-300 font-bold">→</span>
               <input 
                 type="date"
                 className="bg-slate-50 border border-slate-100 rounded-xl p-2 text-[10px] font-bold outline-none"
                 value={dateFilter.end}
                 onChange={e => setDateFilter({ ...dateFilter, end: e.target.value })}
               />
            </div>
            
            <div className="flex-1" />

            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm shadow-slate-100"
            >
              <Printer className="w-4 h-4" />
              {lang === 'en' ? 'Print Report' : 'রিপোর্ট প্রিন্ট'}
            </button>
          </div>
        </div>
      )}

      {/* Main Content Areas */}
      <div className="space-y-6">
        {activeTab === 'sales' && (
          <div className="space-y-4">
            {filteredSales.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-[40px] border border-slate-100">
                <TrendingUp className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">{lang === 'en' ? 'No sales recorded yet' : 'এখনো কোনো বিক্রয় নেই'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSales.map(sale => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={sale.id} 
                    className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <button 
                        onClick={() => handleDeleteSale(sale)}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-1 mb-4">
                      <h4 className="font-black text-slate-900 text-lg group-hover:text-teal-600 transition-colors uppercase tracking-tight line-clamp-1">{sale.productName}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Users className="w-3 h-3" /> {sale.customerName}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{lang === 'en' ? 'Quantity' : 'পরিমাণ'}</p>
                        <p className="font-bold text-slate-900">{sale.quantity} {sale.unit}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{lang === 'en' ? 'Total' : 'মোট'}</p>
                        <p className="font-black text-slate-900">৳{sale.totalAmount}</p>
                      </div>
                    </div>

                    {(sale.remarks || sale.paymentMethod) && (
                      <div className="mt-4 p-3 bg-slate-50 rounded-2xl space-y-2">
                        {sale.paymentMethod && (
                          <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-slate-500">
                             {sale.paymentMethod === 'Cash' ? <CreditCard className="w-3 h-3" /> :
                              sale.paymentMethod === 'Bank' ? <Building2 className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                             {sale.paymentMethod} {sale.bankAccountNumber ? `(${sale.bankAccountNumber})` : ''}
                          </div>
                        )}
                        {sale.remarks && (
                          <div className="flex items-start gap-2">
                             <FileText className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                             <p className="text-[10px] font-bold text-slate-600 italic line-clamp-2">{sale.remarks}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                        sale.dueAmount > 0 ? "bg-rose-50 text-rose-600" : "bg-teal-50 text-teal-600"
                      )}>
                        {sale.dueAmount > 0 ? (lang === 'en' ? `Due: ৳${sale.dueAmount}` : `বকেয়া: ৳${sale.dueAmount}`) : (lang === 'en' ? 'Paid' : 'পরিশোধিত')}
                      </div>
                      <p className="text-[8px] font-bold text-slate-400">{new Date(sale.date).toLocaleDateString()}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'due' && (
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{lang === 'en' ? 'Active Dues/Credit' : 'সক্রিয় বকেয়া তালিকা'}</h3>
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {customers.filter(c => (c.totalDue || 0) > 0).length === 0 ? (
                <div className="p-20 text-center">
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{lang === 'en' ? 'No outstanding dues' : 'কোনো বকেয়া নেই'}</p>
                </div>
              ) : (
                customers.filter(c => (c.totalDue || 0) > 0).map(customer => (
                  <div key={customer.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black">
                        {customer.name[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900">{customer.name}</h4>
                        {customer.whatsapp && (
                          <a 
                            href={`https://wa.me/${customer.whatsapp}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] font-bold text-teal-600 hover:underline"
                          >
                            <MessageSquare className="w-3 h-3" /> {customer.whatsapp}
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{lang === 'en' ? 'Balance Due' : 'বকেয়া ব্যালেন্স'}</p>
                      <p className="text-lg font-black text-rose-600">৳{customer.totalDue.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-[40px] border border-slate-100">
                <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">{lang === 'en' ? 'No customers added' : 'কোনো কাস্টমার নেই'}</p>
              </div>
            ) : (
              filteredCustomers.map(customer => (
                <div key={customer.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer relative">
                  <div className="absolute top-6 right-6 flex gap-2 no-print">
                     { !sales.some(s => s.customerId === customer.id) && (
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           handleDeleteCustomer(customer.id);
                         }}
                         className="p-2 text-slate-300 hover:text-rose-500 rounded-xl hover:bg-rose-50"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                     )}
                     <ChevronRight className="w-5 h-5 text-slate-300" onClick={() => setSelectedCustomerId(customer.id)} />
                  </div>
                  
                  <div onClick={() => setSelectedCustomerId(customer.id)} className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl">
                      {customer.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight">{customer.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400">{lang === 'en' ? 'Member since' : 'সদস্য হয়েছেন'}: {new Date(customer.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-4 border-t border-slate-50">
                    {customer.whatsapp && (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</span>
                        <a href={`https://wa.me/${customer.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-teal-600 flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" /> {customer.whatsapp}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'en' ? 'Dues' : 'বকেয়া'}</span>
                      <span className="text-sm font-black text-rose-600">৳{customer.totalDue}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'stock' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <div key={product.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <Package className="w-5 h-5" />
                  </div>
                  <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-slate-300 hover:text-rose-500 rounded-xl">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight mb-4">{product.name}</h4>
                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'en' ? 'Current Stock' : 'বর্তমান স্টক'}</span>
                    <span className={cn(
                      "text-xl font-black",
                      (product.stock || 0) < 10 ? "text-rose-600" : "text-teal-600"
                    )}>
                      {((product.stock || 0) / 25).toFixed(2)} {lang === 'en' ? 'Drum' : 'ড্রাম'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowRestock(product.id)}
                      className="flex-1 bg-slate-900 text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowDownCircle className="w-3 h-3" />
                      {lang === 'en' ? 'Add Stock' : 'মাল ঢোকান'}
                    </button>
                    <button 
                      onClick={() => {
                        const newStock = prompt(lang === 'en' ? 'Enter exact stock value:' : 'সঠিক স্টক পরিমাণ দিন:');
                        if (newStock !== null) handleUpdateStock(product.id, Number(newStock));
                      }}
                      className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900"
                    >
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{lang === 'en' ? 'Activity Timeline' : 'কার্যকলাপ ইতিহাস'}</h3>
              <History className="w-6 h-6 text-slate-400" />
            </div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {logs.length === 0 ? (
                <div className="p-20 text-center">
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{lang === 'en' ? 'No logs yet' : 'এখনো কোনো ইতিহাস নেই'}</p>
                </div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex gap-4">
                      <div className={cn(
                        "p-2 rounded-xl h-fit",
                        log.action === 'create' ? "bg-teal-50 text-teal-600" :
                        log.action === 'update' ? "bg-blue-50 text-blue-600" : "bg-rose-50 text-rose-600"
                      )}>
                        {log.action === 'create' ? <PlusCircle className="w-4 h-4" /> :
                         log.action === 'update' ? <RefreshCw className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.module}</p>
                          <p className="text-[8px] font-bold text-slate-400">{log.timestamp instanceof Date ? log.timestamp.toLocaleString() : new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                        <p className="text-sm font-bold text-slate-900">{log.details}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Sale Modal */}
      <AnimatePresence>
        {showAddSale && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddSale(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-6 md:p-8 overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center gap-4 mb-8">
                <button 
                  onClick={() => setShowAddSale(false)}
                  className="md:hidden p-2 -ml-2 text-slate-400 bg-slate-50 border border-slate-100 rounded-xl"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="p-4 bg-teal-50 text-teal-600 rounded-3xl">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{lang === 'en' ? 'New Sale' : 'নতুন বিক্রয় রেকর্ড'}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'en' ? 'Fill following details' : 'তথ্যগুলো পূরণ করুন'}</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Product Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{lang === 'en' ? 'Product' : 'পণ্য'}</label>
                  <select 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-teal-500 transition-all appearance-none"
                    value={newSale.productId}
                    onChange={(e) => {
                      const prod = products.find(p => p.id === e.target.value);
                      setNewSale({ ...newSale, productId: e.target.value, productName: prod?.name || '', unit: prod?.unit || BUSINESS_UNITS[0] });
                    }}
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({(p.stock / 25).toFixed(2)} {lang === 'en' ? 'Drum' : 'ড্রাম'} left)</option>
                    ))}
                  </select>
                </div>

                {/* Customer Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{lang === 'en' ? 'Customer' : 'কাস্টমার'}</label>
                  <div className="flex gap-2">
                    <select 
                      className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-teal-500 transition-all appearance-none"
                      value={newSale.customerId}
                      onChange={(e) => setNewSale({ ...newSale, customerId: e.target.value })}
                    >
                      <option value="">{lang === 'en' ? 'Select Customer' : 'কাস্টমার সিলেক্ট করুন'}</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <button 
                      onClick={() => { setShowAddSale(false); setShowAddCustomer(true); }}
                      className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-400 hover:border-teal-500 hover:text-teal-600 transition-all"
                    >
                      <UserPlus className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{lang === 'en' ? 'Quantity' : 'পরিমাণ'}</label>
                    <input 
                      type="number"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-teal-500 transition-all"
                      value={newSale.quantity}
                      onChange={e => setNewSale({ ...newSale, quantity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{lang === 'en' ? 'Unit' : 'ইউনিট'}</label>
                    <select 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-teal-500 transition-all appearance-none"
                      value={newSale.unit}
                      onChange={e => setNewSale({ ...newSale, unit: e.target.value })}
                    >
                      {BUSINESS_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{lang === 'en' ? 'Date' : 'তারিখ'}</label>
                    <input 
                      type="date"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-teal-500 transition-all"
                      value={newSale.date instanceof Date ? newSale.date.toISOString().split('T')[0] : new Date(newSale.date || Date.now()).toISOString().split('T')[0]}
                      onChange={e => setNewSale({ ...newSale, date: new Date(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{lang === 'en' ? 'Sale Rate' : 'বিক্রয় দর'}</label>
                    <input 
                      type="number"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-teal-500 transition-all"
                      value={newSale.salePrice}
                      onChange={e => setNewSale({ ...newSale, salePrice: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Adjustments */}
                <div className="p-6 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                   <div className="flex items-center gap-2 mb-4 text-slate-500">
                     <AlertCircle className="w-4 h-4" />
                     <p className="text-[10px] font-black uppercase tracking-widest">{lang === 'en' ? 'Samples / Returns' : 'স্যাম্পল / রিটার্ন'}</p>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                       <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">{lang === 'en' ? 'Quantity' : 'পরিমাণ'}</label>
                       <input 
                         type="number"
                         className="w-full bg-white border border-slate-200 rounded-xl p-3 font-bold outline-none focus:border-teal-500"
                         value={newSale.adjustmentQuantity}
                         placeholder="0"
                         onChange={e => setNewSale({ ...newSale, adjustmentQuantity: Number(e.target.value) })}
                       />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">{lang === 'en' ? 'Amount Deduction' : 'টাকা বাদ'}</label>
                       <input 
                         type="number"
                         className="w-full bg-white border border-slate-200 rounded-xl p-3 font-bold outline-none focus:border-teal-500"
                         value={newSale.adjustmentAmount}
                         placeholder="0"
                         onChange={e => setNewSale({ ...newSale, adjustmentAmount: Number(e.target.value) })}
                       />
                     </div>
                   </div>
                </div>

                <div className="p-6 bg-slate-900 rounded-[32px] text-white space-y-4">
                  <div className="flex justify-between items-center opacity-60 text-[10px] font-black uppercase tracking-widest">
                    <span>{lang === 'en' ? 'Net Quantity' : 'প্রকৃত পরিমাণ'}</span>
                    <span>{(newSale.quantity || 0) - (newSale.adjustmentQuantity || 0)} {newSale.unit}</span>
                  </div>
                  <div className="flex justify-between items-center opacity-60">
                    <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'en' ? 'Total Amount' : 'মোট বিল'}</span>
                    <span className="text-sm font-black">৳{((newSale.quantity || 0) - (newSale.adjustmentQuantity || 0)) * (newSale.salePrice || 0) - (newSale.adjustmentAmount || 0)}</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest ml-1">{lang === 'en' ? 'Paid Amount' : 'পরিশোধিত টাকা'}</label>
                       <input 
                         type="number"
                         className="w-full bg-white/10 border-2 border-white/10 rounded-xl p-3 font-bold outline-none focus:border-white/30 transition-all text-white placeholder:text-white/40"
                         value={newSale.paidAmount}
                         onChange={e => setNewSale({ ...newSale, paidAmount: Number(e.target.value) })}
                       />
                    </div>

                    { (newSale.paidAmount || 0) > 0 && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest ml-1">{lang === 'en' ? 'Payment Method' : 'পেমেন্ট মাধ্যম'}</label>
                          <div className="flex gap-2">
                            {['Cash', 'Bank', 'Mobile Banking'].map(method => (
                              <button
                                key={method}
                                onClick={() => setNewSale({ ...newSale, paymentMethod: method as any })}
                                className={cn(
                                  "flex-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all",
                                  newSale.paymentMethod === method ? "bg-white text-slate-900 shadow-lg" : "bg-white/5 text-white/40 hover:bg-white/10"
                                )}
                              >
                                {method === 'Cash' ? (lang === 'en' ? 'Cash' : 'ক্যাশ') : 
                                 method === 'Bank' ? (lang === 'en' ? 'Bank' : 'ব্যাংক') : 
                                 (lang === 'en' ? 'Mobile' : 'মোবাইল')}
                              </button>
                            ))}
                          </div>
                        </div>

                        {newSale.paymentMethod === 'Bank' && (
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest ml-1">{lang === 'en' ? 'Bank Account Number' : 'ব্যাংক অ্যাকাউন্ট নম্বর'}</label>
                            <input 
                              type="text"
                              className="w-full bg-white/10 border-2 border-white/10 rounded-xl p-3 font-bold outline-none focus:border-white/30 transition-all text-white placeholder:text-white/40"
                              value={newSale.bankAccountNumber}
                              onChange={e => setNewSale({ ...newSale, bankAccountNumber: e.target.value })}
                              placeholder={lang === 'en' ? "Enter account number" : "অ্যাকাউন্ট নম্বর দিন"}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-white/60">{lang === 'en' ? 'Note / Remarks' : 'নোট / মন্তব্য'}</label>
                    <textarea 
                      className="w-full bg-white/5 border-2 border-white/10 rounded-xl p-3 text-xs font-bold outline-none focus:border-white/30 transition-all text-white min-h-[60px]"
                      value={newSale.remarks}
                      onChange={e => setNewSale({ ...newSale, remarks: e.target.value })}
                      placeholder={lang === 'en' ? "Any specific details..." : "বিশেষ কোনো তথ্য..."}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-rose-400">
                    <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'en' ? 'Remaining Due' : 'বাকি বকেয়া'}</span>
                    <span className="text-xl font-black">৳{Math.max(0, (((newSale.quantity || 0) - (newSale.adjustmentQuantity || 0)) * (newSale.salePrice || 0) - (newSale.adjustmentAmount || 0)) - (newSale.paidAmount || 0))}</span>
                  </div>
                </div>

                <button 
                  onClick={handleAddSale}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black py-5 rounded-[28px] transition-all shadow-xl shadow-teal-100 uppercase tracking-widest text-xs"
                >
                  {lang === 'en' ? 'Record Sale' : 'বিক্রয় সম্পন্ন করুন'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {showAddCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddCustomer(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl p-6 md:p-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <button 
                  onClick={() => setShowAddCustomer(false)}
                  className="md:hidden p-2 -ml-2 text-slate-400 bg-slate-50 border border-slate-100 rounded-xl"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{lang === 'en' ? 'Add Customer' : 'নতুন কাস্টমার'}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'en' ? 'Manage business contacts' : 'ব্যবসার পরিচিতি যোগ করুন'}</p>
                </div>
              </div>

              <div className="space-y-6">
                <button 
                  onClick={handlePickContact}
                  className="w-full p-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 font-bold hover:border-teal-500 hover:text-teal-600 transition-all mb-2"
                >
                  <Phone className="w-5 h-5" />
                  {lang === 'en' ? 'Pick from Contacts' : 'কন্টাক্ট লিস্ট থেকে নিন'}
                </button>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{lang === 'en' ? 'Full Name' : 'পূর্ণ নাম'}</label>
                  <input 
                    type="text"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-teal-500 transition-all"
                    value={newCustomer.name}
                    onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    placeholder={lang === 'en' ? "e.g. Rahim Ahmed" : "উদাঃ রহিম আহমেদ"}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{lang === 'en' ? 'WhatsApp Number' : 'হোয়াটসঅ্যাপ নম্বর'}</label>
                  <input 
                    type="text"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-teal-500 transition-all font-mono"
                    value={newCustomer.whatsapp}
                    onChange={e => setNewCustomer({ ...newCustomer, whatsapp: e.target.value })}
                    placeholder="017XXXXXXXX"
                  />
                </div>

                <button 
                  onClick={handleAddCustomer}
                  disabled={!newCustomer.name}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 text-white font-black py-5 rounded-[28px] transition-all shadow-xl shadow-slate-100 uppercase tracking-widest text-xs"
                >
                  {lang === 'en' ? 'Save Customer' : 'কাস্টমার সেভ করুন'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddProduct(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl p-6 md:p-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <button 
                  onClick={() => setShowAddProduct(false)}
                  className="md:hidden p-2 -ml-2 text-slate-400 bg-slate-50 border border-slate-100 rounded-xl"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{lang === 'en' ? 'Add Item' : 'নতুন পণ্য'}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'en' ? 'Manage business inventory' : 'ব্যবসার ইনভেন্টরি যোগ করুন'}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{lang === 'en' ? 'Product Name' : 'পণ্যের নাম'}</label>
                  <input 
                    type="text"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-indigo-500 transition-all"
                    value={newProduct.name}
                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{lang === 'en' ? 'Unit' : 'ইউনিট'}</label>
                    <select 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-indigo-500 transition-all appearance-none"
                      value={newProduct.unit}
                      onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}
                    >
                      {BUSINESS_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{lang === 'en' ? 'Initial Stock' : 'প্রাথমিক স্টক'}</label>
                    <input 
                      type="number"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-indigo-500 transition-all"
                      value={newProduct.stock}
                      onChange={e => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <button 
                  onClick={handleAddProduct}
                  disabled={!newProduct.name}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 text-white font-black py-5 rounded-[28px] transition-all shadow-xl shadow-slate-100 uppercase tracking-widest text-xs"
                >
                  {lang === 'en' ? 'Save Product' : 'পণ্য সেভ করুন'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Restock Modal */}
      <AnimatePresence>
        {showRestock && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRestock(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-[40px] shadow-2xl p-6 md:p-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <button 
                  onClick={() => setShowRestock(null)}
                  className="md:hidden p-2 -ml-2 text-slate-400 bg-slate-50 border border-slate-100 rounded-xl"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl">
                  <ArrowDownCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{lang === 'en' ? 'Add Inventory' : 'স্টক এন্ট্রি'}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {products.find(p => p.id === showRestock)?.name}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{lang === 'en' ? 'Quantity' : 'পরিমাণ'}</label>
                    <input 
                      type="number"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-indigo-500 transition-all"
                      value={restockAmount.quantity}
                      onChange={e => setRestockAmount({ ...restockAmount, quantity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{lang === 'en' ? 'Unit' : 'ইউনিট'}</label>
                    <select 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-indigo-500 transition-all appearance-none"
                      value={restockAmount.unit}
                      onChange={e => setRestockAmount({ ...restockAmount, unit: e.target.value })}
                    >
                      <option value="drum">Drum (25kg)</option>
                      <option value="kg">KG / Litre</option>
                    </select>
                  </div>
                </div>

                <div className="p-5 bg-indigo-50 rounded-3xl border border-indigo-100">
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{lang === 'en' ? 'New Total' : 'নতুন মোট স্টক'}</p>
                   <p className="text-xl font-black text-indigo-700">
                     {(((products.find(p => p.id === showRestock)?.stock || 0) + convertToKg(restockAmount.quantity, restockAmount.unit)) / 25).toFixed(2)} {lang === 'en' ? 'Drum' : 'ড্রাম'}
                   </p>
                </div>

                <button 
                  onClick={handleRestock}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-[28px] transition-all shadow-xl shadow-slate-100 uppercase tracking-widest text-xs"
                >
                  {lang === 'en' ? 'Update Inventory' : 'স্টক এন্ট্রি দিন'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedCustomerId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCustomerId(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedCustomerId(null)}
                    className="md:hidden p-2 -ml-2 text-slate-400 bg-slate-50 border border-slate-100 rounded-xl"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl md:text-2xl">
                    {customers.find(c => c.id === selectedCustomerId)?.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{customers.find(c => c.id === selectedCustomerId)?.name}</h3>
                    <div className="flex items-center gap-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'en' ? 'Sales History' : 'বিক্রয় ইতিহাস'}</p>
                      <button 
                        onClick={() => window.print()}
                        className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all no-print"
                      >
                        <Printer className="w-3 h-3" />
                        {lang === 'en' ? 'Print' : 'প্রিন্ট'}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'en' ? 'Total Due' : 'মোট বকেয়া'}</p>
                   <p className="text-3xl font-black text-rose-600">৳{customers.find(c => c.id === selectedCustomerId)?.totalDue || 0}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-4">
                  {sales.filter(s => s.customerId === selectedCustomerId).length === 0 ? (
                    <div className="py-20 text-center">
                      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{lang === 'en' ? 'No transactions found' : 'কোনো লেনদেন পাওয়া যায়নি'}</p>
                    </div>
                  ) : (
                    sales
                      .filter(s => s.customerId === selectedCustomerId)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(sale => (
                        <div key={sale.id} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/30 print-card">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h5 className="font-black text-slate-900 uppercase tracking-tight">{sale.productName}</h5>
                              <p className="text-[10px] font-bold text-slate-400">{new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-black text-slate-900">৳{sale.totalAmount}</p>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{sale.quantity} {sale.unit} @ ৳{sale.salePrice}</p>
                            </div>
                          </div>
                          
                          {sale.remarks && (
                            <div className="mb-4 p-3 bg-white/50 rounded-xl border border-slate-100 italic text-[10px] text-slate-500">
                               "{sale.remarks}"
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                             <div className="flex gap-2">
                                <span className={cn(
                                  "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                                  sale.dueAmount > 0 ? "bg-rose-100 text-rose-600" : "bg-teal-100 text-teal-600"
                                )}>
                                  {sale.dueAmount > 0 ? (lang === 'en' ? `Due: ৳${sale.dueAmount}` : `বকেয়া: ৳${sale.dueAmount}`) : (lang === 'en' ? 'Full Paid' : 'সম্পূর্ণ পরিশোধ')}
                                </span>
                                {sale.paymentMethod && (
                                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-widest">
                                    {sale.paymentMethod}
                                  </span>
                                )}
                             </div>
                             {sale.paidAmount > 0 && (
                               <p className="text-[10px] font-bold text-slate-500">
                                 {lang === 'en' ? 'Paid' : 'পরিশোধ'}: ৳{sale.paidAmount}
                               </p>
                             )}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              <button 
                onClick={() => setSelectedCustomerId(null)}
                className="mt-8 w-full py-4 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-widest text-[10px]"
              >
                {lang === 'en' ? 'Close Report' : 'বন্ধ করুন'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Print View Only */}
      <div className="print-only print-container">
        <div className="mb-10 text-center border-b-2 border-slate-900 pb-6">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">
            {lang === 'en' ? 'Business Sales Report' : 'ব্যবসা বিক্রয় রিপোর্ট'}
          </h1>
          <div className="flex justify-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {dateFilter.start && <span>{lang === 'en' ? 'From' : 'থেকে'}: {dateFilter.start}</span>}
            {dateFilter.end && <span>{lang === 'en' ? 'To' : 'পর্যন্ত'}: {dateFilter.end}</span>}
            {!dateFilter.start && !dateFilter.end && <span>{lang === 'en' ? 'All Time' : 'সব সময়ের পোর্ট'}</span>}
            <span>•</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{lang === 'en' ? 'Date' : 'তারিখ'}</th>
              <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{lang === 'en' ? 'Customer' : 'কাস্টমার'}</th>
              <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{lang === 'en' ? 'Product' : 'পণ্য'}</th>
              <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{lang === 'en' ? 'Quantity' : 'পরিমাণ'}</th>
              <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">{lang === 'en' ? 'Total' : 'মোট'}</th>
              <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">{lang === 'en' ? 'Paid' : 'পরিশোধ'}</th>
              <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">{lang === 'en' ? 'Due' : 'বাকি'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSales.map(sale => (
              <tr key={sale.id}>
                <td className="py-4 text-[10px] font-bold text-slate-600">{new Date(sale.date).toLocaleDateString()}</td>
                <td className="py-4 text-[10px] font-black text-slate-900 border-l border-slate-50 pl-4">{sale.customerName}</td>
                <td className="py-4 text-[10px] font-bold text-slate-600">{sale.productName}</td>
                <td className="py-4 text-[10px] font-bold text-slate-600">{sale.quantity} {sale.unit}</td>
                <td className="py-4 text-[10px] font-black text-slate-900 text-right">৳{sale.totalAmount}</td>
                <td className="py-4 text-[10px] font-black text-teal-600 text-right">৳{sale.paidAmount}</td>
                <td className="py-4 text-[10px] font-black text-rose-600 text-right">৳{sale.dueAmount}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-900 font-black">
              <td colSpan={4} className="py-6 text-right text-[10px] uppercase tracking-widest">{lang === 'en' ? 'Grand Total' : 'সর্বমোট'}</td>
              <td className="py-6 text-right text-lg">৳{filteredSales.reduce((acc, s) => acc + s.totalAmount, 0).toLocaleString()}</td>
              <td className="py-6 text-right text-lg text-teal-600">৳{filteredSales.reduce((acc, s) => acc + s.paidAmount, 0).toLocaleString()}</td>
              <td className="py-6 text-right text-lg text-rose-600">৳{filteredSales.reduce((acc, s) => acc + s.dueAmount, 0).toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        {filteredSales.some(s => s.remarks) && (
          <div className="mt-10 pt-6 border-t border-slate-100">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{lang === 'en' ? 'Additional Notes' : 'অতিরিক্ত নোটগুলি'}</h3>
             <div className="space-y-4">
                {filteredSales.filter(s => s.remarks).map(s => (
                  <div key={s.id} className="text-[10px]">
                    <span className="font-black uppercase tracking-tight text-slate-900">{s.customerName} - {s.productName}: </span>
                    <span className="italic text-slate-600">{s.remarks}</span>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Business;
