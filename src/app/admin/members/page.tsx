'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  Download,
  Check,
  Ban,
  Trash2,
  Award,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Eye,
  X,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Lock,
  Key,
} from 'lucide-react';
import { InstagramIcon } from '@/components/SocialIcons';
import { SECStore, subscribeToStore } from '@/lib/store';
import { Member, MemberBadge, BusinessCategory } from '@/types';

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>(SECStore.getMembers());
  const [categories, setCategories] = useState<BusinessCategory[]>(SECStore.getCategories());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [detailMember, setDetailMember] = useState<Member | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setMembers(SECStore.getMembers());
      setCategories(SECStore.getCategories());
    };
    const unsubscribe = subscribeToStore(handleUpdate);
    return () => unsubscribe();
  }, []);

  const handleApprove = (id: string) => {
    SECStore.approveMember(id, 'Super Admin');
  };

  const handleSuspend = (id: string) => {
    if (confirm('Suspend this member?')) {
      SECStore.suspendMember(id, 'Super Admin');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Permanently delete this member profile?')) {
      SECStore.deleteMember(id, 'Super Admin');
    }
  };

  const handleToggleBadge = (id: string, badge: MemberBadge) => {
    SECStore.toggleMemberBadge(id, badge);
  };

  const handleExportCSV = () => {
    const rows = filteredMembers.map((m) => ({
      MemberID: m.memberIdCode,
      FullName: m.fullName,
      Email: m.email,
      Phone: m.phone,
      BusinessName: m.business.businessName,
      Category: m.business.category,
      Designation: m.business.designation,
      Location: m.business.location,
      Status: m.status,
      ReferralCode: m.referralCode,
      Points: m.gamificationPoints,
      JoinedDate: m.joinedDate,
    }));
    SECStore.exportToCSV('SEC_Salem_Members_Roster', rows);
  };

  const filteredMembers = members.filter((m) => {
    if (selectedStatus !== 'All' && m.status !== selectedStatus) return false;
    if (selectedCategory !== 'All' && m.business.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.fullName.toLowerCase().includes(q) ||
        m.business.businessName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.memberIdCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const availableBadges: MemberBadge[] = [
    'FOUNDING MEMBER',
    'ACTIVE MEMBER',
    'TOP NETWORKER',
    'TOP REFERRER',
    'EVENT CHAMPION',
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            Member Management & Credentials
          </h1>
          <p className="text-xs text-slate-400">
            Review applications, verify credentials, assign honors badges, and export rosters.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-400 border border-slate-700 flex items-center gap-1.5 transition self-start sm:self-auto"
        >
          <Download className="w-4 h-4" /> Export CSV ({filteredMembers.length})
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, company, email, ID..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active Members</option>
            <option value="payment_pending">Payment Pending</option>
            <option value="application_pending">Application Pending</option>
            <option value="suspended">Suspended</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="All">All Business Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A101D] text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Member / Founder</th>
                <th className="py-3.5 px-4">Business & Sector</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Badges</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-900/60 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={m.avatarUrl}
                        alt={m.fullName}
                        className="w-10 h-10 rounded-xl object-cover border border-amber-400/40 shrink-0"
                      />
                      <div>
                        <Link
                          href={`/members/${m.id}`}
                          className="font-bold text-white hover:text-amber-400 transition"
                        >
                          {m.fullName}
                        </Link>
                        <p className="text-[10px] font-mono text-amber-300">{m.memberIdCode}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-white block">{m.business.businessName}</span>
                    <span className="text-[10px] text-amber-400 font-medium">{m.business.category}</span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-300">
                    <p>{m.phone}</p>
                    <p className="text-[10px] text-slate-500">{m.email}</p>
                    {m.business.instagram && (
                      <a
                        href={
                          m.business.instagram.startsWith('http')
                            ? m.business.instagram
                            : `https://instagram.com/${m.business.instagram.replace(/^@/, '')}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-pink-400 hover:underline inline-flex items-center gap-1 mt-0.5"
                      >
                        <InstagramIcon className="w-2.5 h-2.5 shrink-0" />
                        <span>{m.business.instagram}</span>
                      </a>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        m.status === 'active'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : m.status === 'payment_pending'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : m.status === 'application_pending'
                          ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                          : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {m.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {availableBadges.map((badge) => {
                        const hasBadge = m.badges.includes(badge);
                        return (
                          <button
                            key={badge}
                            onClick={() => handleToggleBadge(m.id, badge)}
                            className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase transition ${
                              hasBadge
                                ? 'bg-amber-400 text-slate-950 shadow'
                                : 'bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-300'
                            }`}
                            title={`Click to ${hasBadge ? 'remove' : 'assign'} badge`}
                          >
                            {badge}
                          </button>
                        );
                      })}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setDetailMember(m)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition"
                        title="View Full Member Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {m.status !== 'active' && (
                        <button
                          onClick={() => handleApprove(m.id)}
                          className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                          title="Approve Member"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {m.status === 'active' && (
                        <button
                          onClick={() => handleSuspend(m.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition"
                          title="Suspend Member"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Details Modal */}
      {detailMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-[#0F172A] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={detailMember.avatarUrl}
                  alt={detailMember.fullName}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400"
                />
                <div>
                  <h3 className="text-lg font-bold text-white">{detailMember.fullName}</h3>
                  <p className="text-xs text-amber-400 font-semibold">{detailMember.business.designation}</p>
                  <p className="text-xs text-slate-400">{detailMember.business.businessName}</p>
                </div>
              </div>

              <button
                onClick={() => setDetailMember(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Badges / Status */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                detailMember.status === 'active'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                Status: {detailMember.status.replace('_', ' ')}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                ID: {detailMember.memberIdCode}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-slate-800 text-amber-400 border border-slate-700">
                Referral: {detailMember.referralCode}
              </span>
              {detailMember.referredBy && (
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  Referred By: {detailMember.referredBy}
                </span>
              )}
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                  <Phone className="w-3 h-3 text-amber-400" /> Phone / WhatsApp
                </span>
                <p className="font-semibold text-white">{detailMember.phone}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                  <Mail className="w-3 h-3 text-amber-400" /> Business Email
                </span>
                <p className="font-semibold text-white">{detailMember.email}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                  <Building className="w-3 h-3 text-amber-400" /> Industry Category
                </span>
                <p className="font-semibold text-white">{detailMember.business.category}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" /> Salem Location / City
                </span>
                <p className="font-semibold text-white">{detailMember.business.location}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-400" /> Joined Date
                </span>
                <p className="font-semibold text-white">{detailMember.joinedDate}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-400" /> Gamification Score
                </span>
                <p className="font-semibold text-amber-400 font-mono">{detailMember.gamificationPoints} Points</p>
              </div>

              {detailMember.business.instagram && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 sm:col-span-2">
                  <span className="text-[10px] text-pink-400 uppercase font-bold flex items-center gap-1">
                    <InstagramIcon className="w-3 h-3 text-pink-400" /> Instagram Handle
                  </span>
                  <a
                    href={
                      detailMember.business.instagram.startsWith('http')
                        ? detailMember.business.instagram
                        : `https://instagram.com/${detailMember.business.instagram.replace(/^@/, '')}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-pink-400 hover:text-pink-300 hover:underline flex items-center gap-1"
                  >
                    <span>{detailMember.business.instagram}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Member Login Credentials Info */}
              <div className="p-3.5 rounded-xl bg-amber-400/10 border border-amber-400/30 space-y-1 sm:col-span-2">
                <span className="text-[10px] text-amber-300 uppercase font-bold flex items-center gap-1">
                  <Key className="w-3 h-3 text-amber-400" /> Member Login Credentials (Admin Reference)
                </span>
                <div className="flex flex-wrap items-center gap-4 pt-0.5 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">Member ID: </span>
                    <strong className="font-mono text-amber-300">{detailMember.memberIdCode}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Email / Login: </span>
                    <strong className="text-white">{detailMember.email}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Password: </span>
                    <strong className="font-mono text-emerald-300">{detailMember.password || 'Member@SEC2026 (Default)'}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Description / Products */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold">
                Company Profile & Description
              </span>
              <p className="text-slate-300 leading-relaxed">
                {detailMember.business.description || detailMember.bio}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                {detailMember.status !== 'active' ? (
                  <button
                    onClick={() => {
                      handleApprove(detailMember.id);
                      setDetailMember({ ...detailMember, status: 'active' });
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition"
                  >
                    <Check className="w-4 h-4" /> Approve Membership
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleSuspend(detailMember.id);
                      setDetailMember({ ...detailMember, status: 'suspended' });
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs transition"
                  >
                    Suspend Member
                  </button>
                )}
              </div>

              <button
                onClick={() => setDetailMember(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
