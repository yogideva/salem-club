'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Users,
  Calendar,
  Award,
  CreditCard,
  Copy,
  Check,
  Share2,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { SECStore, subscribeToStore } from '@/lib/store';
import { Member, SECEvent, EventRegistration, Referral, AdminSettings } from '@/types';
import { DigitalMemberCard } from '@/components/DigitalMemberCard';

export default function MemberDashboardPage() {
  const { currentUser, role } = useAuth();
  const [settings, setSettings] = useState<AdminSettings>(SECStore.getSettings());
  const [events, setEvents] = useState<SECEvent[]>(SECStore.getEvents());
  const [registrations, setRegistrations] = useState<EventRegistration[]>(SECStore.getRegistrations());
  const [referrals, setReferrals] = useState<Referral[]>(SECStore.getReferrals());
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(SECStore.getSettings());
      setEvents(SECStore.getEvents());
      setRegistrations(SECStore.getRegistrations());
      setReferrals(SECStore.getReferrals());
    };
    const unsubscribe = subscribeToStore(handleUpdate);
    return () => unsubscribe();
  }, []);

  const member = currentUser || SECStore.getMembers()[0];

  if (!member) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-2">No Active Member Profile</h2>
        <p className="text-xs text-slate-400 mb-4">Please log in or apply for membership.</p>
        <Link href="/login" className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs">
          Go to Login
        </Link>
      </div>
    );
  }

  // Calculate profile completion percentage
  let completedFields = 2; // name and email always
  const totalFields = 6;
  if (member.avatarUrl) completedFields++;
  if (member.business?.website) completedFields++;
  if (member.business?.instagram || member.business?.linkedin) completedFields++;
  if (member.business?.productsServices?.length > 0) completedFields++;
  const completionPercentage = Math.round((completedFields / totalFields) * 100);

  // Referral link
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://salementrepreneursclub.com';
  const referralUrl = `${origin}/join?ref=${member.referralCode}`;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello! I invite you to join Salem Entrepreneurs Club (SEC) — the premier business networking community in Salem. Use my referral link to apply: ${referralUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const myRegistrations = registrations.filter((r) => r.memberId === member.id);
  const myReferrals = referrals.filter((r) => r.referrerId === member.id);
  const totalCommissionEarned = myReferrals
    .filter((r) => r.commissionStatus === 'approved' || r.commissionStatus === 'paid')
    .reduce((acc, curr) => acc + curr.commissionAmount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#0F172A] via-[#14213D] to-[#0A101C] border border-amber-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={member.avatarUrl}
            alt={member.fullName}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-xl"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">{member.fullName}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {member.status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-amber-400 font-semibold">{member.business.designation}</p>
            <p className="text-xs text-slate-300">{member.business.businessName}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/membership-card"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 flex items-center gap-1.5 transition"
          >
            <CreditCard className="w-4 h-4 text-amber-400" />
            Digital Card Pass
          </Link>
          <Link
            href={`/members/${member.id}`}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-xs font-bold text-slate-950 flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20"
          >
            View Public Profile <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Profile Onboarding Progress Bar */}
      {completionPercentage < 100 && (
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-amber-500/20 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> Complete Your Member Profile
            </span>
            <span className="font-bold text-amber-400">{completionPercentage}% Completed</span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
            <span>Next steps:</span>
            {!member.business.website && (
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                + Add Website Link
              </span>
            )}
            {!member.business.instagram && (
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                + Add Social Links
              </span>
            )}
            <Link href={`/members/${member.id}`} className="text-amber-400 font-bold hover:underline ml-auto">
              Edit Profile Details →
            </Link>
          </div>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">Gamification Rank</span>
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">{member.gamificationPoints} pts</div>
          <p className="text-[11px] text-slate-400 mt-1">Top Networker Tier</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">Registered Events</span>
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{myRegistrations.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Upcoming Conclaves</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">Total Referrals</span>
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{myReferrals.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Invited Founders</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">Commission Earned</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            ₹{totalCommissionEarned.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{settings.referralPercentage}% Reward Policy</p>
        </div>
      </div>

      {/* Invite Your First Entrepreneur Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#0C1527] to-[#121E36] border border-amber-400/40 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
              Grow Your SEC Network
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white uppercase mt-0.5">
              Invite Your Peer Entrepreneurs & Earn ₹{Math.round((settings.membershipFee * settings.referralPercentage) / 100)} Per Referral
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Share your personal referral link with Salem business founders. You receive {settings.referralPercentage}% commission instantly upon their activation.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={shareWhatsApp}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-slate-950 flex items-center gap-1.5 transition shadow"
            >
              <Share2 className="w-3.5 h-3.5" /> Share on WhatsApp
            </button>
          </div>
        </div>

        {/* Copy Referral URL Bar */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-xs font-mono text-amber-300 truncate flex-1 pl-2">
            {referralUrl}
          </span>
          <button
            onClick={copyReferral}
            className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1 transition shrink-0"
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

      {/* Main 2-Column Section: Digital Member Card + Registered Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Digital Card Pass */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" /> My Digital Member Pass
            </h3>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Active
            </span>
          </div>

          <DigitalMemberCard member={member} />
        </div>

        {/* Right Column: Upcoming Registered Events & Community Actions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" /> My Registered Conclaves
              </h3>
              <Link href="/events" className="text-xs text-amber-400 hover:underline">
                Explore More Events →
              </Link>
            </div>

            {myRegistrations.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                You haven&apos;t registered for any events yet. Check out upcoming conclaves!
              </div>
            ) : (
              <div className="space-y-3">
                {myRegistrations.map((reg) => {
                  const evt = events.find((e) => e.id === reg.eventId);
                  return (
                    <div
                      key={reg.id}
                      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white">
                          {evt?.title || 'Grand Entrepreneur Conclave'}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {evt?.date} • {evt?.startTime}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          RSVP: {reg.status.toUpperCase()}
                        </span>
                      </div>

                      <Link
                        href={`/events/${reg.eventId}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
                      >
                        <QrCode className="w-3.5 h-3.5 text-amber-400" />
                        <span>Pass & Agenda</span>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Link
              href="/feed"
              className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-amber-400/40 transition group"
            >
              <MessageSquare className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="text-xs font-bold text-white">Share Update</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Post to community feed</p>
            </Link>

            <Link
              href="/members"
              className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-amber-400/40 transition group"
            >
              <Users className="w-5 h-5 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="text-xs font-bold text-white">Find Partners</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Browse 150+ members</p>
            </Link>

            <Link
              href="/referrals"
              className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-amber-400/40 transition group"
            >
              <Award className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="text-xs font-bold text-white">Referral Wallet</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Track your commissions</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
