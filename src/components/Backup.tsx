import React, { useRef } from 'react';
import { 
  Download, 
  Upload, 
  Database, 
  History,
  Languages,
  RotateCcw
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { UI_STRINGS } from '../constants';

export const Backup: React.FC = () => {
  const lang = dataService.getLanguage() as 'en' | 'bn';
  const t = UI_STRINGS;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleExport = () => {
    dataService.exportData();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = dataService.importData(content);
      
      if (success) {
        alert(lang === 'en' ? 'Data imported successfully!' : 'তথ্য সফলভাবে ইম্পোর্ট করা হয়েছে!');
        window.location.reload();
      } else {
        alert(lang === 'en' ? 'Failed to import. Invalid file format.' : 'ইম্পোর্ট করা সম্ভব হয়নি। ভুল ফরম্যাট।');
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (confirm(lang === 'en' ? 'Are you sure? This will delete ALL local data!' : 'আপনি কি নিশ্চিত? এটি আপনার সকল তথ্য মুছে ফেলবে!')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 max-w-4xl pb-20">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.backup[lang]}</h2>
        <p className="text-slate-500 font-bold text-sm">
          {lang === 'en' ? 'Manage your local storage and portability' : 'আপনার লোকাল স্টোরেজ এবং ব্যাকআপ পরিচালনা করুন'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Backup Actions */}
        <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm space-y-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-teal-100 rounded-2xl text-teal-600">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">Export Backup</h3>
              <p className="text-xs font-bold text-slate-400">Download all data as JSON file</p>
            </div>
          </div>
          
          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            {lang === 'en' 
              ? 'Export your data to a secure file. You can use this file later to restore your records on any device.' 
              : 'আপনার সকল তথ্য একটি ফাইলে এক্সপোর্ট করুন। পরবর্তীতে অন্য যেকোনো ডিভাইসে তথ্য ফিরিয়ে আনতে এই ফাইলটি ব্যবহার করতে পারবেন।'}
          </p>

          <button 
            onClick={handleExport}
            className="w-full py-5 bg-teal-600 text-white font-black rounded-3xl shadow-xl shadow-teal-100 hover:bg-teal-700 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
          >
            <Download className="w-5 h-5" />
            Download Backup File
          </button>
        </div>

        <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm space-y-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-orange-100 rounded-2xl text-orange-600">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">Import Records</h3>
              <p className="text-xs font-bold text-slate-400">Restore from backup file</p>
            </div>
          </div>

          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            {lang === 'en' 
              ? 'Upload a previously exported backup file. Note: This will overwrite current matching records.' 
              : 'পূর্বে এক্সপোর্ট করা একটি ব্যাকআপ ফাইল আপলোড করুন। মনে রাখবেন: এটি বর্তমান তথ্যগুলোর উপর কাজ করবে।'}
          </p>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".json" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-5 bg-white border-2 border-dashed border-slate-200 text-slate-500 font-black rounded-3xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs disabled:opacity-50"
          >
            <Upload className="w-5 h-5" />
            Select Backup File
          </button>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm space-y-8">
           <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-100 rounded-2xl text-indigo-600">
              <Languages className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">Language / ভাষা</h3>
              <p className="text-xs font-bold text-slate-400">Switch app language</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button 
               onClick={() => dataService.setLanguage('en')}
               className={`py-6 rounded-3xl font-black transition-all ${lang === 'en' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
             >
               English
             </button>
             <button 
               onClick={() => dataService.setLanguage('bn')}
               className={`py-6 rounded-3xl font-black transition-all ${lang === 'bn' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
             >
               বাংলা
             </button>
          </div>
        </div>

        <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm space-y-8">
           <div className="flex items-center gap-4 text-rose-600">
            <div className="p-4 bg-rose-100 rounded-2xl">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">System Wipe</h3>
              <p className="text-xs font-bold text-rose-400">Danger Zone</p>
            </div>
          </div>

          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            {lang === 'en' 
              ? 'Permanently delete all records from this device. Please export a backup before doing this.' 
              : 'এই ডিভাইস থেকে স্থায়ীভাবে সকল তথ্য মুছে ফেলুন। এটি করার আগে অবশ্যই একটি ব্যাকআপ ফাইল এক্সপোর্ট করে রাখুন।'}
          </p>

          <button 
            onClick={clearAllData}
            className="w-full py-5 bg-rose-50 text-rose-600 font-black rounded-3xl hover:bg-rose-100 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
          >
            <RotateCcw className="w-5 h-5" />
            Reset Application
          </button>
        </div>
      </div>
    </div>
  );
};
