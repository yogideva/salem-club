'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/authContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginAsAdmin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = loginAsAdmin(username, password);
    if (success) {
      router.push('/admin');
    } else {
      setError('Invalid admin credentials. Please verify your username and password.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#0F172A] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center mx-auto text-slate-950 font-black shadow-xl shadow-amber-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-black tracking-widest uppercase text-amber-400 block">
            Executive Secretariat
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            SEC Admin Console
          </h1>
          <p className="text-xs text-slate-400">
            Authorized administration portal for members, conclaves, payments, and CMS.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Admin Username / Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@salementrepreneursclub.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Master Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition"
          >
            <span>Authenticate Admin Session</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          <Link href="/login" className="hover:text-slate-300 transition">
            ← Return to Member Login
          </Link>
        </div>
      </div>
    </div>
  );
}
