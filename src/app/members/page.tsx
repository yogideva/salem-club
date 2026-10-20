'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Users,
  Building,
  MapPin,
  Phone,
  Globe,
  UserPlus,
  Check,
  Clock,
  Sparkles,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { InstagramIcon } from '@/components/SocialIcons';
import { useAuth } from '@/lib/authContext';
import { SECStore, subscribeToStore } from '@/lib/store';
import { Member, BusinessCategory, Connection } from '@/types';
import MemberAccessGate from '@/components/MemberAccessGate';

export default function MembersDirectoryPage() {
  const { currentUser, role } = useAuth();
  const [members, setMembers] = useState<Member[]>(SECStore.getMembers());
  const [categories, setCategories] = useState<BusinessCategory[]>(SECStore.getCategories());
  const [connections, setConnections] = useState<Connection[]>(SECStore.getConnections());

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const handleUpdate = () => {
      setMembers(SECStore.getMembers());
      setCategories(SECStore.getCategories());
      setConnections(SECStore.getConnections());
    };
    const unsubscribe = subscribeToStore(handleUpdate);
    return () => unsubscribe();
  }, []);

  const currentMemberId = currentUser?.id || 'm1';

  if (!currentUser) {
    return (
      <MemberAccessGate
        title="Member Directory is Members-Only"
        description="Connect directly with verified entrepreneurs, manufacturers, and CXOs across Salem. Sign up or log in to unlock the full member directory."
        featureName="the Member Directory"
      />
    );
  }

  // Filter members
  const filteredMembers = members.filter((m) => {
    // Only show active members in public directory, or show pending to admin
    if (role === 'visitor' && m.status !== 'active') return false;

    // Category filter
    if (selectedCategory !== 'All' && m.business.category !== selectedCategory) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = m.fullName.toLowerCase().includes(q);
      const matchBusiness = m.business.businessName.toLowerCase().includes(q);
      const matchCategory = m.business.category.toLowerCase().includes(q);
      const matchLocation = m.business.location.toLowerCase().includes(q);
      const matchDesc = m.business.description.toLowerCase().includes(q);
      if (!matchName && !matchBusiness && !matchCategory && !matchLocation && !matchDesc) {
        return false;
      }
    }

    return true;
  });

  const getConnectionStatus = (targetMemberId: string) => {
    if (targetMemberId === currentMemberId) return 'self';
    const conn = connections.find(
      (c) =>
        (c.requesterId === currentMemberId && c.receiverId === targetMemberId) ||
        (c.requesterId === targetMemberId && c.receiverId === currentMemberId)
    );
    if (!conn) return 'none';
    return conn.status; // 'pending' | 'accepted' | 'rejected'
  };

  const handleConnect = (targetMemberId: string) => {
    if (role === 'visitor') {
      alert('Please log in as an SEC member to send connection requests!');
      return;
    }
    SECStore.sendConnectionRequest(currentMemberId, targetMemberId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            Verified Business Directory
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            SEC Members
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Discover and connect with {members.length} verified industrialists, founders, and service leaders.
          </p>
        </div>

        {role === 'visitor' && (
          <Link
            href="/join"
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 flex items-center gap-1.5 self-start md:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" /> List Your Business in SEC
          </Link>
        )}
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members by name, business, machinery, services, or location..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="All">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills (horizontal scroll) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === 'All'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Sectors
          </button>
          {categories.slice(0, 8).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.name
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Member Directory Grid */}
      {filteredMembers.length === 0 ? (
        <div className="py-20 text-center bg-[#0F172A] rounded-3xl border border-slate-800">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No members found</h3>
          <p className="text-xs text-slate-400 mt-1">Try clearing your search query or selecting another sector.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-amber-400 font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => {
            const connStatus = getConnectionStatus(member.id);

            // Privacy check: Phone is visible if member is authenticated or privacy is public
            const canViewPhone =
              role !== 'visitor' || member.privacy.phoneVisible === 'public';

            return (
              <div
                key={member.id}
                className="group rounded-3xl bg-[#0F172A] border border-slate-800 hover:border-amber-400/40 shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header / Cover background */}
                  <div className="h-20 bg-gradient-to-r from-[#0C1527] via-[#14213D] to-[#0A101C] relative border-b border-slate-800/80">
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-slate-950/80 text-amber-300 border border-amber-500/30">
                        {member.memberIdCode}
                      </span>
                    </div>
                  </div>

                  <div className="px-5 pb-5 -mt-10 space-y-3">
                    {/* Avatar & Badges */}
                    <div className="flex items-end justify-between">
                      <img
                        src={member.avatarUrl}
                        alt={member.fullName}
                        className="w-18 h-18 rounded-2xl object-cover border-2 border-amber-400 shadow-xl bg-slate-900"
                      />

                      {member.badges.length > 0 && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          {member.badges[0]}
                        </span>
                      )}
                    </div>

                    {/* Member Name & Designation */}
                    <div>
                      <Link
                        href={`/members/${member.id}`}
                        className="text-base font-extrabold text-white group-hover:text-amber-300 transition block truncate"
                      >
                        {member.fullName}
                      </Link>
                      <p className="text-xs font-semibold text-amber-400 truncate">
                        {member.business.designation}
                      </p>
                      <p className="text-xs font-bold text-slate-200 truncate mt-0.5">
                        {member.business.businessName}
                      </p>
                    </div>

                    {/* Sector & Location Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {member.business.category}
                      </span>
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 text-slate-400">
                        <MapPin className="w-2.5 h-2.5" /> {member.business.location}
                      </span>
                    </div>

                    {/* Bio Snippet */}
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {member.business.description || member.bio}
                    </p>

                    {/* Social & Contact Strip */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-xs">
                      {member.business.whatsapp && (
                        <a
                          href={`https://wa.me/${member.business.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {canViewPhone && member.business.phone && (
                        <a
                          href={`tel:${member.business.phone}`}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
                          title={`Call ${member.business.phone}`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {member.business.website && (
                        <a
                          href={member.business.website}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
                          title="Website"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {member.business.instagram && (
                        <a
                          href={`https://instagram.com/${member.business.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
                          title="Instagram"
                        >
                          <InstagramIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Button Bar */}
                <div className="px-5 pb-5 pt-1 border-t border-slate-800/80 flex items-center gap-2">
                  <Link
                    href={`/members/${member.id}`}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 text-center transition"
                  >
                    View Profile
                  </Link>

                  {connStatus === 'self' ? (
                    <span className="px-3 py-2 rounded-xl bg-slate-800/50 text-[11px] text-slate-500 font-medium">
                      You
                    </span>
                  ) : connStatus === 'accepted' ? (
                    <span className="px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Connected
                    </span>
                  ) : connStatus === 'pending' ? (
                    <span className="px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-[11px] font-bold text-amber-300 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Pending
                    </span>
                  ) : (
                    <button
                      onClick={() => handleConnect(member.id)}
                      className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1 transition shadow"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Connect</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
