'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  Clock,
  Calendar,
  Ticket,
  DollarSign,
  Award,
  CreditCard,
  MessageSquare,
  Handshake,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import { SECStore, subscribeToStore } from '@/lib/store';
import {
  Member,
  SECEvent,
  EventRegistration,
  PaymentSubmission,
  Referral,
  CommunityPost,
  Connection,
  AdminSettings,
} from '@/types';

export default function AdminDashboardPage() {
  const [members, setMembers] = useState<Member[]>(SECStore.getMembers());
  const [events, setEvents] = useState<SECEvent[]>(SECStore.getEvents());
  const [registrations, setRegistrations] = useState<EventRegistration[]>(SECStore.getRegistrations());
  const [payments, setPayments] = useState<PaymentSubmission[]>(SECStore.getPayments());
  const [referrals, setReferrals] = useState<Referral[]>(SECStore.getReferrals());
  const [posts, setPosts] = useState<CommunityPost[]>(SECStore.getPosts());
  const [connections, setConnections] = useState<Connection[]>(SECStore.getConnections());
  const [settings, setSettings] = useState<AdminSettings>(SECStore.getSettings());

  useEffect(() => {
    const handleUpdate = () => {
      setMembers(SECStore.getMembers());
      setEvents(SECStore.getEvents());
      setRegistrations(SECStore.getRegistrations());
      setPayments(SECStore.getPayments());
      setReferrals(SECStore.getReferrals());
      setPosts(SECStore.getPosts());
      setConnections(SECStore.getConnections());
      setSettings(SECStore.getSettings());
    };
    const unsubscribe = subscribeToStore(handleUpdate);
    return () => unsubscribe();
  }, []);

  // Compute 10 Metrics
  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === 'active').length;
  const pendingApplications = members.filter(
    (m) => m.status === 'application_pending' || m.status === 'payment_pending'
  ).length;
  const upcomingEvents = events.filter((e) => e.isPublished).length;
  const totalEventRegistrations = registrations.length;

  const totalMembershipRevenue = payments
    .filter((p) => p.status === 'approved')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalReferralCommissions = referrals
    .filter((r) => r.commissionStatus === 'approved' || r.commissionStatus === 'paid')
    .reduce((sum, r) => sum + r.commissionAmount, 0);

  const pendingPayments = payments.filter(
    (p) => p.status === 'pending' || p.status === 'under_review'
  ).length;

  const communityPostsCount = posts.length;
  const activeConnectionsCount = connections.filter((c) => c.status === 'accepted').length;

  const pendingPaymentsList = payments
    .filter((p) => p.status === 'pending' || p.status === 'under_review')
    .slice(0, 4);

  const pendingMembersList = members
    .filter((m) => m.status === 'application_pending' || m.status === 'payment_pending')
    .slice(0, 4);

  const handleQuickApproveMember = (id: string) => {
    SECStore.approveMember(id, 'Super Admin');
  };

  const handleQuickApprovePayment = (id: string) => {
    SECStore.approvePayment(id, 'Super Admin');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" /> SEC Master Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Administrative Command Center
          </h1>
          <p className="text-xs text-slate-400">
            Realtime metrics across Salem membership, conclaves, finances, and community moderation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/events"
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow"
          >
            + Create Event
          </Link>
          <Link
            href="/admin/payments"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
          >
            Review Payments ({pendingPayments})
          </Link>
        </div>
      </div>

      {/* The 10 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* 1. TOTAL MEMBERS */}
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">1. Total Members</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalMembers}</div>
          <span className="text-[10px] text-slate-500">Registered in directory</span>
        </div>

        {/* 2. ACTIVE MEMBERS */}
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">2. Active Members</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{activeMembers}</div>
          <span className="text-[10px] text-slate-500">Verified credentials</span>
        </div>

        {/* 3. PENDING APPLICATIONS */}
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">3. Pending Apps</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{pendingApplications}</div>
          <span className="text-[10px] text-slate-500">Awaiting approval</span>
        </div>

        {/* 4. UPCOMING EVENTS */}
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">4. Upcoming Events</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{upcomingEvents}</div>
          <span className="text-[10px] text-slate-500">Active on calendar</span>
        </div>

        {/* 5. EVENT REGISTRATIONS */}
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">5. Event RSVPs</span>
            <Ticket className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400">{totalEventRegistrations}</div>
          <span className="text-[10px] text-slate-500">Total participants</span>
        </div>

        {/* 6. MEMBERSHIP REVENUE */}
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">6. Club Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">
            ₹{totalMembershipRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-500">Verified receipts</span>
        </div>

        {/* 7. REFERRAL COMMISSIONS */}
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">7. Referral Rewards</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-400">
            ₹{totalReferralCommissions.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-500">{settings.referralPercentage}% Commission base</span>
        </div>

        {/* 8. PENDING PAYMENTS */}
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">8. Pending Payments</span>
            <CreditCard className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{pendingPayments}</div>
          <span className="text-[10px] text-slate-500">UTR review needed</span>
        </div>

        {/* 9. COMMUNITY POSTS */}
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">9. Feed Posts</span>
            <MessageSquare className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{communityPostsCount}</div>
          <span className="text-[10px] text-slate-500">Active member posts</span>
        </div>

        {/* 10. ACTIVE CONNECTIONS */}
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">10. Connections</span>
            <Handshake className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{activeConnectionsCount}</div>
          <span className="text-[10px] text-slate-500">Accepted network ties</span>
        </div>
      </div>

      {/* 2-Column Action Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Payment Submissions Review */}
        <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Pending UPI Payments Verification
              </h3>
            </div>
            <Link href="/admin/payments" className="text-xs text-amber-400 hover:underline">
              View All ({payments.length}) →
            </Link>
          </div>

          {pendingPaymentsList.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              ✓ All payment receipts are currently verified and up to date!
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPaymentsList.map((pay) => (
                <div
                  key={pay.id}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <h4 className="font-bold text-white">{pay.memberName}</h4>
                    <p className="text-[11px] text-slate-400">{pay.businessName}</p>
                    <p className="text-[10px] font-mono text-amber-300">UTR: {pay.upiTransactionId}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">₹{pay.amount}</span>
                    <button
                      onClick={() => handleQuickApprovePayment(pay.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow transition"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Membership Applications */}
        <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Membership Review Queue
              </h3>
            </div>
            <Link href="/admin/members" className="text-xs text-amber-400 hover:underline">
              Manage Members →
            </Link>
          </div>

          {pendingMembersList.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No pending applications awaiting decision.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingMembersList.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={m.avatarUrl}
                      alt={m.fullName}
                      className="w-9 h-9 rounded-xl object-cover border border-amber-400/40"
                    />
                    <div>
                      <h4 className="font-bold text-white">{m.fullName}</h4>
                      <p className="text-[11px] text-amber-400">{m.business.businessName}</p>
                      <span className="text-[10px] text-slate-400">{m.business.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuickApproveMember(m.id)}
                      className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow transition"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
