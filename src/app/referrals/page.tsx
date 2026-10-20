'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  Users,
  Copy,
  Check,
  Share2,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { SECStore, subscribeToStore } from '@/lib/store';
import { Referral, AdminSettings } from '@/types';
import MemberAccessGate from '@/components/MemberAccessGate';

export default function ReferralsDashboardPage() {
  const { currentUser, role } = useAuth();
  const [settings, setSettings] = useState<AdminSettings>(SECStore.getSettings());
  const [referrals, setReferrals] = useState<Referral[]>(SECStore.getReferrals());
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(SECStore.getSettings());
      setReferrals(SECStore.getReferrals());
    };
    const unsubscribe = subscribeToStore(handleUpdate);
    return () => unsubscribe();
  }, []);

  const member = currentUser;

  if (!currentUser) {
    return (
      <MemberAccessGate
        title="Referral Program & Royalties"
        description="Earn direct cash commissions for every business you introduce to Salem Entrepreneurs Club. Sign up or log in to access your unique referral links."
        featureName="the Referral Dashboard"
      />
    );
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://salementrepreneursclub.com';
  const referralUrl = `${origin}/join?ref=${member?.referralCode || 'SEC-MEMBER-001'}`;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const shareWhatsApp = () => {
    const currentReward = Math.round((settings.membershipFee * settings.referralPercentage) / 100);
    const text = encodeURIComponent(
      `Hello! I invite you to join Salem Entrepreneurs Club (SEC). Scale your business, meet 150+ regional founders, and access high-value referrals. Join using my referral link: ${referralUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const myReferrals = referrals.filter((r) => r.referrerId === member?.id);

  const totalReferrals = myReferrals.length;
  const successfulReferrals = myReferrals.filter(
    (r) => r.commissionStatus === 'approved' || r.commissionStatus === 'paid'
  ).length;
  const pendingReferrals = myReferrals.filter((r) => r.commissionStatus === 'pending').length;

  const totalCommissionEarned = myReferrals
    .filter((r) => r.commissionStatus === 'approved' || r.commissionStatus === 'paid')
    .reduce((sum, r) => sum + r.commissionAmount, 0);

  const commissionPaid = myReferrals
    .filter((r) => r.commissionStatus === 'paid')
    .reduce((sum, r) => sum + r.commissionAmount, 0);

  const commissionPending = myReferrals
    .filter((r) => r.commissionStatus === 'approved' || r.commissionStatus === 'pending')
    .reduce((sum, r) => (r.commissionStatus === 'approved' ? sum + r.commissionAmount : sum), 0);

  // Dynamic reward calculation based on Admin Settings
  const dynamicRewardAmount = Math.round((settings.membershipFee * settings.referralPercentage) / 100);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          Growth & Royalty Program
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
          My Referral Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Earn <strong className="text-amber-400">{settings.referralPercentage}%</strong> direct referral reward on every peer entrepreneur who joins SEC through your link.
        </p>
      </div>

      {/* Unique Referral Link & Share Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#0E1626] via-[#142340] to-[#0A101C] border border-amber-400/30 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
              Personal Referral Identifier
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-2xl font-black font-mono text-white tracking-wider">
                {member?.referralCode}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ₹{dynamicRewardAmount.toLocaleString('en-IN')} Per Activation
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Current Membership: ₹{settings.membershipFee.toLocaleString('en-IN')} × {settings.referralPercentage}% = ₹{dynamicRewardAmount.toLocaleString('en-IN')} commission reward.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={shareWhatsApp}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition"
            >
              <Share2 className="w-4 h-4" /> Share on WhatsApp
            </button>
          </div>
        </div>

        {/* URL Bar */}
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-xs font-mono text-amber-300 truncate flex-1 pl-2">
            {referralUrl}
          </span>
          <button
            onClick={copyReferral}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shrink-0"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Link
              </>
            )}
          </button>
        </div>
      </div>

      {/* 6 Key Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
            Total Referrals
          </span>
          <div className="text-2xl font-black text-white">{totalReferrals}</div>
          <span className="text-[10px] text-slate-500">Invitations logged</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
            Successful
          </span>
          <div className="text-2xl font-black text-emerald-400">{successfulReferrals}</div>
          <span className="text-[10px] text-slate-500">Approved members</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
            Pending
          </span>
          <div className="text-2xl font-black text-amber-400">{pendingReferrals}</div>
          <span className="text-[10px] text-slate-500">In verification</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
            Total Earned
          </span>
          <div className="text-2xl font-black text-white">₹{totalCommissionEarned.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-slate-500">Cumulative reward</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
            Commission Paid
          </span>
          <div className="text-2xl font-black text-emerald-400">₹{commissionPaid.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-slate-500">Credited to bank</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
            To Be Disbursed
          </span>
          <div className="text-2xl font-black text-amber-400">₹{commissionPending.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-slate-500">Next cycle</span>
        </div>
      </div>

      {/* Referrals History Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" /> Referral Activity Roster
          </h3>
          <span className="text-xs text-slate-400">
            {myReferrals.length} records tracked
          </span>
        </div>

        {myReferrals.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No referral activity yet. Share your code with fellow entrepreneurs in Salem to start earning!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Invited Member</th>
                  <th className="py-3 px-3">Business</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Fee Paid</th>
                  <th className="py-3 px-3">%</th>
                  <th className="py-3 px-3">Commission</th>
                  <th className="py-3 px-3">Commission Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {myReferrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-slate-900/60 transition">
                    <td className="py-3 px-3 font-bold text-white">{ref.newMemberName}</td>
                    <td className="py-3 px-3 text-slate-300">{ref.newMemberBusiness}</td>
                    <td className="py-3 px-3 text-slate-400 font-mono">{ref.date}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-white">
                      ₹{ref.membershipAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-mono text-amber-400">{ref.commissionPercentage}%</td>
                    <td className="py-3 px-3 font-mono font-black text-amber-300">
                      ₹{ref.commissionAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          ref.commissionStatus === 'paid'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : ref.commissionStatus === 'approved'
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            : ref.commissionStatus === 'pending'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-red-500/15 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {ref.commissionStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Program Terms Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-300 uppercase tracking-wider text-[11px]">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Referral Program Guidelines</span>
        </div>
        <p className="leading-relaxed">
          Commissions are tracked transparently in this portal. Once the new applicant&apos;s membership fee is verified by SEC administration, commissions are approved and disbursed via direct NEFT / UPI to your registered phone number.
        </p>
      </div>
    </div>
  );
}
