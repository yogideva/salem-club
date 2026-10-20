'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Download,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import { SECStore, subscribeToStore } from '@/lib/store';
import { PaymentSubmission } from '@/types';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentSubmission[]>(SECStore.getPayments());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setPayments(SECStore.getPayments());
    };
    const unsubscribe = subscribeToStore(handleUpdate);
    return () => unsubscribe();
  }, []);

  const handleApprove = (id: string) => {
    SECStore.approvePayment(id, 'Super Admin');
  };

  const handleReject = (id: string) => {
    const reason = prompt('Please enter rejection reason / clarification needed:');
    if (reason) {
      SECStore.rejectPayment(id, reason, 'Super Admin');
    }
  };

  const handleExportCSV = () => {
    const rows = filteredPayments.map((p) => ({
      PaymentID: p.id,
      MemberName: p.memberName,
      BusinessName: p.businessName,
      Amount: p.amount,
      PaymentType: p.paymentType,
      UTRTransactionID: p.upiTransactionId,
      Status: p.status,
      SubmittedAt: p.submittedAt,
      ReferralCodeUsed: p.referralCodeUsed || 'None',
      ReviewedBy: p.reviewedBy || 'Pending',
    }));
    SECStore.exportToCSV('SEC_UPI_Payments_Verified', rows);
  };

  const filteredPayments = payments.filter((p) => {
    if (filterStatus !== 'All' && p.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.memberName.toLowerCase().includes(q) ||
        p.businessName.toLowerCase().includes(q) ||
        p.upiTransactionId.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            UPI / GPay Payment Verifications
          </h1>
          <p className="text-xs text-slate-400">
            Verify 12-digit UTR references, inspect payment screenshots, and activate memberships.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-400 border border-slate-700 flex items-center gap-1.5 transition self-start sm:self-auto"
        >
          <Download className="w-4 h-4" /> Export Payments CSV ({filteredPayments.length})
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search payments by member, business, or 12-digit UTR..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
        >
          <option value="All">All Verification Statuses</option>
          <option value="under_review">Under Review / Pending</option>
          <option value="approved">Approved & Activated</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A101D] text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Member / Business</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">UPI / UTR Transaction ID</th>
                <th className="py-3.5 px-4">Referral Code</th>
                <th className="py-3.5 px-4">Screenshot</th>
                <th className="py-3.5 px-4">Verification Status</th>
                <th className="py-3.5 px-4 text-right">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/60 transition">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white block">{p.memberName}</span>
                    <span className="text-[11px] text-slate-400">{p.businessName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{p.phone}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono font-black text-amber-400 text-sm">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500 block capitalize">{p.paymentType}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-white tracking-wider bg-slate-900 px-2 py-1 rounded border border-slate-800 inline-block">
                      {p.upiTransactionId}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {new Date(p.submittedAt).toLocaleDateString()}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    {p.referralCodeUsed ? (
                      <span className="font-mono text-xs font-bold text-amber-300">
                        {p.referralCodeUsed}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[10px]">Direct Join</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    {p.screenshotUrl ? (
                      <button
                        onClick={() => setPreviewScreenshotUrl(p.screenshotUrl)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 flex items-center gap-1 border border-slate-700 transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" /> View Receipt
                      </button>
                    ) : (
                      <span className="text-slate-500 text-[10px]">No image</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        p.status === 'approved'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : p.status === 'under_review' || p.status === 'pending'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {p.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {p.status !== 'approved' && (
                        <button
                          onClick={() => handleApprove(p.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow flex items-center gap-1"
                          title="Approve and Activate Membership"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                      )}

                      {p.status !== 'rejected' && (
                        <button
                          onClick={() => handleReject(p.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                          title="Reject Payment"
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

      {/* Screenshot Preview Modal */}
      {previewScreenshotUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-lg w-full bg-[#0F172A] border border-amber-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" /> UPI Receipt Screenshot
              </h3>
              <button
                onClick={() => setPreviewScreenshotUrl(null)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg"
              >
                ✕ Close
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-[70vh]">
              <img
                src={previewScreenshotUrl}
                alt="Payment receipt proof"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
