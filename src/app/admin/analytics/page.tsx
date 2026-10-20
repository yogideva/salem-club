'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Users,
  Award,
  DollarSign,
  PieChart,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { SECStore, subscribeToStore } from '@/lib/store';
import { Member, SECEvent, PaymentSubmission, Referral, BusinessCategory } from '@/types';

export default function AdminAnalyticsPage() {
  const [members, setMembers] = useState<Member[]>(SECStore.getMembers());
  const [events, setEvents] = useState<SECEvent[]>(SECStore.getEvents());
  const [payments, setPayments] = useState<PaymentSubmission[]>(SECStore.getPayments());
  const [referrals, setReferrals] = useState<Referral[]>(SECStore.getReferrals());
  const [categories, setCategories] = useState<BusinessCategory[]>(SECStore.getCategories());

  useEffect(() => {
    const handleUpdate = () => {
      setMembers(SECStore.getMembers());
      setEvents(SECStore.getEvents());
      setPayments(SECStore.getPayments());
      setReferrals(SECStore.getReferrals());
      setCategories(SECStore.getCategories());
    };
    const unsubscribe = subscribeToStore(handleUpdate);
    return () => unsubscribe();
  }, []);

  // Compute category breakdown
  const categoryCounts: { [cat: string]: number } = {};
  members.forEach((m) => {
    const c = m.business.category;
    categoryCounts[c] = (categoryCounts[c] || 0) + 1;
  });

  const categorySorted = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  // Top referrers
  const referrerCounts: { [name: string]: { count: number; commission: number } } = {};
  referrals.forEach((r) => {
    if (!referrerCounts[r.referrerName]) {
      referrerCounts[r.referrerName] = { count: 0, commission: 0 };
    }
    referrerCounts[r.referrerName].count += 1;
    referrerCounts[r.referrerName].commission += r.commissionAmount;
  });

  const topReferrers = Object.entries(referrerCounts).sort(
    (a, b) => b[1].commission - a[1].commission
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5 space-y-1">
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">
          Ecosystem Analytics & Intelligence
        </h1>
        <p className="text-xs text-slate-400">
          Real-time metrics on Salem member conversion, sector distribution, referral royalties, and conclave turnouts.
        </p>
      </div>

      {/* Top 3 High-Level Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Pipeline Revenue
          </span>
          <div className="text-3xl font-black text-emerald-400">
            ₹
            {payments
              .filter((p) => p.status === 'approved')
              .reduce((s, p) => s + p.amount, 0)
              .toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500">100% Verified membership receipts</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Membership Conversion Rate
          </span>
          <div className="text-3xl font-black text-amber-400">
            {members.length > 0
              ? Math.round((members.filter((m) => m.status === 'active').length / members.length) * 100)
              : 0}
            %
          </div>
          <p className="text-[11px] text-slate-500">Applications approved and activated</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Referral Royalties
          </span>
          <div className="text-3xl font-black text-cyan-400">
            ₹
            {referrals
              .filter((r) => r.commissionStatus === 'approved' || r.commissionStatus === 'paid')
              .reduce((s, r) => s + r.commissionAmount, 0)
              .toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500">Credited to peer referrers</p>
        </div>
      </div>

      {/* 2-Column Visual Panels: Sector Breakdown & Top Referrers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sector Distribution */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-400" /> Member Distribution by Industry Sector
            </h3>
            <span className="text-[10px] text-slate-500">{categorySorted.length} Active Sectors</span>
          </div>

          <div className="space-y-3">
            {categorySorted.map(([cat, count]) => {
              const pct = Math.round((count / members.length) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{cat}</span>
                    <span className="text-slate-400 font-mono">
                      {count} members ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Referrers Leaderboard */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> Top Referral Earners & Ambassadors
            </h3>
            <span className="text-[10px] text-slate-500">Live Royalty Engine</span>
          </div>

          {topReferrers.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No referral commissions logged yet.
            </div>
          ) : (
            <div className="space-y-3">
              {topReferrers.map(([name, stat], idx) => (
                <div
                  key={name}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-white block">{name}</span>
                      <span className="text-[10px] text-slate-400">
                        {stat.count} Successful Referrals
                      </span>
                    </div>
                  </div>

                  <span className="font-mono font-black text-amber-400 text-sm">
                    ₹{stat.commission.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
