'use client';

import React from 'react';
import Link from 'next/link';
import { CreditCard, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { SECStore } from '@/lib/store';
import { DigitalMemberCard } from '@/components/DigitalMemberCard';

export default function MembershipCardPage() {
  const { currentUser, role } = useAuth();
  const member = currentUser || SECStore.getMembers()[0];

  if (!member) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-2">No Member Pass Found</h2>
        <Link href="/login" className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link
          href="/dashboard"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <span className="text-xs font-mono font-bold text-amber-400">{member.memberIdCode}</span>
      </div>

      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" /> SEC Digital Credential
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">
          Official Digital Membership Card
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Present this pass at regional conclaves, hotels, and partner meetings for priority check-in and verified peer identification.
        </p>
      </div>

      <div className="flex justify-center pt-4">
        <DigitalMemberCard member={member} />
      </div>
    </div>
  );
}
