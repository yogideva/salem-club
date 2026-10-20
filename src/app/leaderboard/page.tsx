'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Award,
  Medal,
  Sparkles,
  Users,
  Flame,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { SECStore, subscribeToStore } from '@/lib/store';
import { useAuth } from '@/lib/authContext';
import { Member, AdminSettings } from '@/types';
import MemberAccessGate from '@/components/MemberAccessGate';

export default function LeaderboardPage() {
  const { currentUser, role } = useAuth();
  const [members, setMembers] = useState<Member[]>(SECStore.getMembers());
  const [settings, setSettings] = useState<AdminSettings>(SECStore.getSettings());

  useEffect(() => {
    const handleUpdate = () => {
      setMembers(SECStore.getMembers());
      setSettings(SECStore.getSettings());
    };
    const unsubscribe = subscribeToStore(handleUpdate);
    return () => unsubscribe();
  }, []);

  if (role === 'visitor' && !currentUser) {
    return (
      <MemberAccessGate
        title="Leaderboard is Members-Only"
        description="Top networkers, highest earning referrers, and prestigious club ranks are visible to registered members. Sign up or log in to view the leaderboard."
        featureName="the Leaderboard"
      />
    );
  }

  // Sort members by gamification points
  const sortedMembers = [...members]
    .filter((m) => m.status === 'active')
    .sort((a, b) => (b.gamificationPoints || 0) - (a.gamificationPoints || 0));

  const top3 = sortedMembers.slice(0, 3);
  const remaining = sortedMembers.slice(3);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black flex items-center justify-center text-xs shadow-lg">
          🥇 1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-8 h-8 rounded-full bg-slate-300 text-slate-950 font-black flex items-center justify-center text-xs shadow-md">
          🥈 2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-8 h-8 rounded-full bg-amber-700 text-white font-black flex items-center justify-center text-xs shadow-md">
          🥉 3
        </span>
      );
    }
    return (
      <span className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-xs">
        #{rank}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5" /> SEC Hall of Fame
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
          SEC Top Networkers
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Recognizing the most proactive entrepreneurs in referrals, conclave attendance, and ecosystem support.
        </p>
      </div>

      {/* Point Rules Card */}
      <div className="p-5 rounded-2xl bg-[#0F172A] border border-amber-500/20 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" /> How Points Are Earned
          </span>
          <span className="text-[10px] text-slate-500">Live Engine</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-amber-400 font-black text-base">
              +{settings.gamification.referralPoints} pts
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">Per Approved Member Referral</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-emerald-400 font-black text-base">
              +{settings.gamification.eventAttendancePoints} pts
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">Conclave Attendance Check-In</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-blue-400 font-black text-base">
              +{settings.gamification.connectionPoints} pts
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">Accepted Connection</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-purple-400 font-black text-base">
              +{settings.gamification.postPoints} pts
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">Community Post / Advisory</p>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {top3.map((m, idx) => (
          <div
            key={m.id}
            className={`relative p-6 rounded-3xl bg-[#0F172A] border shadow-2xl flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 ${
              idx === 0
                ? 'border-amber-400 ring-2 ring-amber-400/20 md:-translate-y-2'
                : idx === 1
                ? 'border-slate-400/40'
                : 'border-amber-700/40'
            }`}
          >
            <div className="mb-3">{getRankBadge(idx + 1)}</div>

            <img
              src={m.avatarUrl}
              alt={m.fullName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-xl mb-3"
            />

            <h3 className="text-base font-extrabold text-white">{m.fullName}</h3>
            <p className="text-xs text-amber-400 font-semibold">{m.business.designation}</p>
            <p className="text-[11px] text-slate-400 truncate max-w-full">
              {m.business.businessName}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-800 w-full flex items-center justify-between text-xs">
              <span className="text-slate-400">Score:</span>
              <span className="font-mono font-black text-amber-300 text-sm">
                {m.gamificationPoints} pts
              </span>
            </div>

            <Link
              href={`/members/${m.id}`}
              className="mt-3 text-xs text-amber-400 hover:text-amber-300 font-bold"
            >
              View Profile →
            </Link>
          </div>
        ))}
      </div>

      {/* Complete Rankings Roster */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Complete Salem Leaderboard Roster
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Entrepreneur</th>
                <th className="py-3 px-3">Business</th>
                <th className="py-3 px-3">Sector</th>
                <th className="py-3 px-3">Badges</th>
                <th className="py-3 px-3 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedMembers.map((m, idx) => (
                <tr key={m.id} className="hover:bg-slate-900/60 transition">
                  <td className="py-3 px-3 font-bold text-slate-300">
                    <span className="font-mono">#{idx + 1}</span>
                  </td>
                  <td className="py-3 px-3 font-bold text-white flex items-center gap-2.5">
                    <img
                      src={m.avatarUrl}
                      alt={m.fullName}
                      className="w-7 h-7 rounded-lg object-cover border border-amber-400/40"
                    />
                    <Link href={`/members/${m.id}`} className="hover:text-amber-400 transition">
                      {m.fullName}
                    </Link>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{m.business.businessName}</td>
                  <td className="py-3 px-3 text-amber-400/90">{m.business.category}</td>
                  <td className="py-3 px-3">
                    {m.badges.length > 0 ? (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {m.badges[0]}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[10px]">-</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-amber-400 text-sm">
                    {m.gamificationPoints}
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
