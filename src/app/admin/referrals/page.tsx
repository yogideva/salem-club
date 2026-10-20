'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  Search,
  Download,
  Check,
  CheckCheck,
  X,
  TrendingUp,
  DollarSign,
  Users,
} from 'lucide-react';
import { SECStore, subscribeToStore } from '@/lib/store';
import { Referral, AdminSettings } from '@/types';

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>(SECStore.getReferrals());
  const [settings, setSettings] = useState<AdminSettings>(SECStore.getSettings());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const handleUpdate = () => {
      setReferrals(SECStore.getReferrals());
      setSettings(SECStore.getSettings());
    };
    const unsubscribe = subscribeToStore(handleUpdate);
    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = (id: string, status: Referral['commissionStatus']) => {
    SECStore.updateReferralCommissionStatus(id, status, 'Super Admin');
  };

  const handleExportCSV = () => {
    const rows = filteredReferrals.map((r) => ({
      ReferralID: r.id,
      ReferrerName: r.referrerName,
      ReferrerCode: r.referrerCode,
      NewMember: r.newMemberName,
      Business: r.newMemberBusiness,
      Date: r.date,
      MembershipFee: r.membershipAmount,
      CommissionRate: `${r.commissionPercentage}%`,
      CommissionAmount: r.commissionAmount,
      PaymentStatus: r.paymentStatus,
      CommissionStatus: r.commissionStatus,
    }));
    SECStore.exportToCSV('SEC_Referral_Commissions_Log', rows);
  };

  const filteredReferrals = referrals.filter((r) => {
    if (statusFilter !== 'All' && r.commissionStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.referrerName.toLowerCase().includes(q) ||
        r.referrerCode.toLowerCase().includes(q) ||
        r.newMemberName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalCommissionsEarned = referrals.reduce((sum, r) => sum + r.commissionAmount, 0);
  const totalPaid = referrals
    .filter((r) => r.commissionStatus === 'paid')
    .reduce((sum, r) => sum + r.commissionAmount, 0);
  const totalPending = referrals
    .filter((r) => r.commissionStatus === 'approved' || r.commissionStatus === 'pending')
    .reduce((sum, r) => sum + r.commissionAmount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            Referral Royalty & Commission Management
          </h1>
          <p className="text-xs text-slate-400">
            Track peer invitations, approve calculated rewards ({settings.referralPercentage}%), and log disbursement records.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-400 border border-slate-700 flex items-center gap-1.5 transition self-start sm:self-auto"
        >
          <Download className="w-4 h-4" /> Export CSV ({filteredReferrals.length})
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 shadow">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
            Total Commission Generated
          </span>
          <div className="text-2xl font-black text-white">
            ₹{totalCommissionsEarned.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-500">{referrals.length} referrals recorded</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 shadow">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
            Commissions Paid Out
          </span>
          <div className="text-2xl font-black text-emerald-400">
            ₹{totalPaid.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-500">Disbursed to members</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 shadow">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
            Pending / Approved Payouts
          </span>
          <div className="text-2xl font-black text-amber-400">
            ₹{totalPending.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-500">Ready for payment transfer</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by referrer name, referral code, or invited member..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
        >
          <option value="All">All Statuses</option>
          <option value="pending">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="paid">Paid</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Referrals Table */}
      <div className="rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A101D] text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Referrer (Member)</th>
                <th className="py-3.5 px-4">New Member Joined</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Membership Fee</th>
                <th className="py-3.5 px-4">%</th>
                <th className="py-3.5 px-4">Commission</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Commission Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredReferrals.map((r) => (
                <tr key={r.id} className="hover:bg-slate-900/60 transition">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white block">{r.referrerName}</span>
                    <span className="font-mono text-[10px] text-amber-300">{r.referrerCode}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-white block">{r.newMemberName}</span>
                    <span className="text-[11px] text-slate-400">{r.newMemberBusiness}</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-400">{r.date}</td>

                  <td className="py-3.5 px-4 font-mono font-semibold text-white">
                    ₹{r.membershipAmount.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                    {r.commissionPercentage}%
                  </td>

                  <td className="py-3.5 px-4 font-mono font-black text-amber-300 text-sm">
                    ₹{r.commissionAmount.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        r.commissionStatus === 'paid'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : r.commissionStatus === 'approved'
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          : r.commissionStatus === 'pending'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {r.commissionStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {r.commissionStatus === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(r.id, 'approved')}
                          className="px-2.5 py-1 rounded-lg bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-[11px]"
                          title="Approve Commission"
                        >
                          Approve
                        </button>
                      )}

                      {r.commissionStatus !== 'paid' && (
                        <button
                          onClick={() => handleUpdateStatus(r.id, 'paid')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] flex items-center gap-1"
                          title="Mark Commission Paid"
                        >
                          <CheckCheck className="w-3.5 h-3.5" /> Mark Paid
                        </button>
                      )}

                      {r.commissionStatus !== 'rejected' && (
                        <button
                          onClick={() => handleUpdateStatus(r.id, 'rejected')}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                          title="Reject Commission"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
