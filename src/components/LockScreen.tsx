import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ShieldAlert, Clock } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Logo } from './Logo';

export const LockScreen: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [authState, setAuthState] = useState(dataService.getAuthState());
  const [timeLeft, setTimeLeft] = useState(0);

  const CORRECT_PASSWORD = '43625391';
  const LOCKOUT_DURATION = 1 * 60 * 1000; // 1 minute in ms
  const MAX_ATTEMPTS = 2;

  useEffect(() => {
    const timer = setInterval(() => {
      const state = dataService.getAuthState();
      if (state.failedAttempts >= MAX_ATTEMPTS) {
        const now = Date.now();
        const elapsed = now - state.lastFailedTime;
        if (elapsed < LOCKOUT_DURATION) {
          setTimeLeft(Math.ceil((LOCKOUT_DURATION - elapsed) / 1000));
        } else {
          // Reset after block duration
          const newState = { ...state, failedAttempts: 0 };
          dataService.saveAuthState(newState);
          setAuthState(newState);
          setTimeLeft(0);
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (timeLeft > 0) return;

    if (password === CORRECT_PASSWORD) {
      const newState = { authenticated: true, failedAttempts: 0, lastFailedTime: 0 };
      dataService.saveAuthState(newState);
      onUnlock();
    } else {
      const newAttempts = authState.failedAttempts + 1;
      const newState = { 
        ...authState, 
        failedAttempts: newAttempts, 
        lastFailedTime: newAttempts >= MAX_ATTEMPTS ? Date.now() : 0 
      };
      dataService.saveAuthState(newState);
      setAuthState(newState);
      setError(newAttempts >= MAX_ATTEMPTS ? 'Access Blocked for 1 minute' : 'Incorrect password');
      setPassword('');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-slate-800 rounded-[40px] p-10 shadow-2xl border border-slate-700 text-center"
      >
        <div className="mb-8 flex justify-center">
          <Logo size={80} />
        </div>

        <h1 className="text-3xl font-black text-white mb-2">Humaid's Corner</h1>
        <p className="text-slate-400 mb-10 font-bold uppercase tracking-widest text-xs">Security Lock</p>

        {timeLeft > 0 ? (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-8 mb-4">
            <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto mb-4" />
            <p className="text-rose-500 font-black text-2xl mb-1">{formatTime(timeLeft)}</p>
            <p className="text-rose-400/60 text-[10px] font-bold uppercase tracking-widest">Access Temporarily Suspended</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <input 
                type="password" 
                required
                autoFocus
                placeholder="Enter Access Key"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-2xl py-5 px-6 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-black text-white text-center text-2xl tracking-[0.5em] outline-none placeholder:text-slate-600 placeholder:tracking-normal placeholder:text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-rose-500 text-[10px] font-black uppercase tracking-widest bg-rose-500/10 py-3 rounded-xl"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-teal-900/20 uppercase tracking-widest text-sm"
            >
              Unlock Access
            </button>
          </form>
        )}

        <p className="mt-8 text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
          Private Data • Device Encrypted
        </p>
      </motion.div>
    </div>
  );
};
