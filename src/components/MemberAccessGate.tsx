'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, Shield, UserPlus, LogIn, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface MemberAccessGateProps {
  title?: string;
  description?: string;
  featureName?: string;
}

export default function MemberAccessGate({
  title = 'Members-Only Access Required',
  description = 'This section is reserved exclusively for verified members of the Salem Entrepreneurs Club.',
  featureName = 'This feature',
}: MemberAccessGateProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-gradient-to-b from-slate-900 via-[#0B132B] to-[#070B14] border border-amber-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden text-center space-y-6">
        {/* Glow ambient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Lock Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10">
            <Lock className="w-10 h-10" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Shield className="w-4 h-4" />
          </div>
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-2 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-[11px] font-bold text-amber-300 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Club Membership Gated
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            {description}
          </p>
        </div>

        {/* Perks Box */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-left space-y-3">
          <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider block">
            Unlock After Signup & Member Login:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full Member Directory</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>All Exclusive Events & RSVPs</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Referral Program & Royalties</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Entrepreneur Leaderboard</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/login?tab=signup"
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition"
          >
            <UserPlus className="w-4 h-4" /> Sign Up for Membership
          </Link>

          <Link
            href="/login?tab=login"
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider border border-slate-700 flex items-center justify-center gap-2 transition"
          >
            <LogIn className="w-4 h-4" /> Member Login
          </Link>
        </div>

        <p className="text-[11px] text-slate-500">
          Already applied? Check your application status by logging into your member account.
        </p>
      </div>
    </div>
  );
}
