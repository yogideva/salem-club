'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  MessageCircle,
  Share2,
  Check,
  UserPlus,
  Clock,
  Sparkles,
  Award,
  CreditCard,
  Building,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Edit,
} from 'lucide-react';
import {
  InstagramIcon,
  FacebookIcon,
  YoutubeIcon,
  LinkedinIcon,
  WhatsAppIcon,
} from '@/components/SocialIcons';
import { useAuth } from '@/lib/authContext';
import { SECStore, subscribeToStore } from '@/lib/store';
import { Member, Connection } from '@/types';
import { DigitalMemberCard } from '@/components/DigitalMemberCard';
import MemberAccessGate from '@/components/MemberAccessGate';

export default function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { currentUser, role } = useAuth();

  const [member, setMember] = useState<Member | undefined>(SECStore.getMemberById(id));
  const [connections, setConnections] = useState<Connection[]>(SECStore.getConnections());
  const [showCardModal, setShowCardModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!currentUser) {
    return (
      <MemberAccessGate
        title="Member Profile is Protected"
        description="Detailed founder profiles, direct WhatsApp contact, and business catalogs are visible exclusively to registered club members."
      />
    );
  }

  useEffect(() => {
    const handleUpdate = () => {
      setMember(SECStore.getMemberById(id));
      setConnections(SECStore.getConnections());
    };
    const unsubscribe = subscribeToStore(handleUpdate);
    return () => unsubscribe();
  }, [id]);

  if (!member) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Member Profile Not Found</h2>
        <p className="text-xs text-slate-400 mb-4">The requested profile could not be located.</p>
        <Link href="/members" className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs">
          Browse Member Directory
        </Link>
      </div>
    );
  }

  const currentMemberId = currentUser?.id || 'm1';
  const isOwnProfile = currentUser?.id === member.id;

  const conn = connections.find(
    (c) =>
      (c.requesterId === currentMemberId && c.receiverId === member.id) ||
      (c.requesterId === member.id && c.receiverId === currentMemberId)
  );

  const connStatus = isOwnProfile ? 'self' : conn ? conn.status : 'none';

  const handleConnect = () => {
    if (role === 'visitor') {
      alert('Please log in as an SEC member to connect with other founders.');
      return;
    }
    SECStore.sendConnectionRequest(currentMemberId, member.id);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const canViewPhone = role !== 'visitor' || member.privacy.phoneVisible === 'public';
  const canViewEmail = role !== 'visitor' || member.privacy.emailVisible === 'public';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Cover Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl bg-slate-900">
        <div className="h-48 sm:h-64 w-full relative">
          <img
            src={
              member.coverImageUrl ||
              'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&fit=crop'
            }
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070B14] via-[#070B14]/40 to-transparent" />
        </div>

        {/* Profile Card Header Info */}
        <div className="px-6 pb-6 pt-0 relative z-10 -mt-16 sm:-mt-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <img
              src={member.avatarUrl}
              alt={member.fullName}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-amber-400 shadow-2xl bg-slate-900"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white">{member.fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {member.memberIdCode}
                </span>
              </div>
              <p className="text-sm font-bold text-amber-400">{member.business.designation}</p>
              <p className="text-xs sm:text-sm text-slate-300 font-semibold">
                {member.business.businessName}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" /> {member.business.location}
                </span>
                <span>•</span>
                <span className="text-amber-300/90 font-medium">{member.business.category}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => setShowCardModal(true)}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              Digital Pass
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Share profile link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            {isOwnProfile ? (
              <Link
                href="/profile/edit"
                className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition shadow"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Profile
              </Link>
            ) : connStatus === 'accepted' ? (
              <span className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" /> Connected
              </span>
            ) : connStatus === 'pending' ? (
              <span className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5">
                <Clock className="w-4 h-4" /> Request Sent
              </span>
            ) : (
              <button
                onClick={handleConnect}
                className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-amber-500/20"
              >
                <UserPlus className="w-4 h-4" /> Connect
              </button>
            )}
          </div>
        </div>

        {/* Badges Strip */}
        {member.badges.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-800/80 bg-[#0A101D] flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2">
              Verified Badges:
            </span>
            {member.badges.map((b) => (
              <span
                key={b}
                className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30"
              >
                {b}
              </span>
            ))}
            <span className="ml-auto text-xs font-bold text-amber-400 font-mono">
              ★ {member.gamificationPoints} Points
            </span>
          </div>
        )}
      </div>

      {/* Main Grid: Details + Business Offerings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Bio, Business, Products */}
        <div className="lg:col-span-8 space-y-6">
          {/* About / Bio */}
          <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
              Entrepreneur Overview
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {member.bio}
            </p>
          </div>

          {/* Business Details & Offerings */}
          <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {member.business.businessName}
                </h3>
                <span className="text-xs text-amber-400 font-semibold">
                  {member.business.category}
                </span>
              </div>
              <Building className="w-6 h-6 text-slate-600" />
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {member.business.description}
            </p>

            {/* Products & Services */}
            {member.business.productsServices?.length > 0 && (
              <div className="pt-2 space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Key Products, Solutions & Services
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {member.business.productsServices.map((prod, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5 text-xs text-slate-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{prod}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Poster / Image if available */}
            {member.business.posterUrl && (
              <div className="pt-2 space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Company Showcase / Brochure Poster
                </h4>
                <div className="rounded-2xl overflow-hidden border border-slate-800 aspect-[16/9] max-h-72">
                  <img
                    src={member.business.posterUrl}
                    alt="Business Showcase"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Direct Contact, Social Media, Referral info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Contact Details Card */}
          <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Direct Contact & Collaboration
            </h3>

            <div className="space-y-3 text-xs">
              {member.business.whatsapp && (
                <a
                  href={`https://wa.me/${member.business.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold hover:bg-emerald-500/20 transition"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>Connect on WhatsApp</span>
                </a>
              )}

              {canViewPhone ? (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <a href={`tel:${member.business.phone}`} className="hover:text-white font-mono">
                    {member.business.phone}
                  </a>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-500 text-[11px] italic">
                  Phone locked to registered members.
                </div>
              )}

              {canViewEmail ? (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <a href={`mailto:${member.business.email}`} className="hover:text-white truncate">
                    {member.business.email}
                  </a>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-500 text-[11px] italic">
                  Email locked to registered members.
                </div>
              )}

              {member.dateOfBirth && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
                  <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Date of Birth</span>
                    <span className="font-medium text-xs text-white">{member.dateOfBirth}</span>
                  </div>
                </div>
              )}

              {member.business.website && (
                <a
                  href={member.business.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white transition"
                >
                  <span className="flex items-center gap-2 truncate">
                    <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">{member.business.website.replace('https://', '')}</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </a>
              )}
            </div>

            {/* Social Icons row */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              {member.business.linkedin && (
                <a
                  href={member.business.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 transition"
                  title="LinkedIn"
                >
                  <LinkedinIcon className="w-4 h-4" />
                </a>
              )}
              {member.business.instagram && (
                <a
                  href={
                    member.business.instagram.startsWith('http')
                      ? member.business.instagram
                      : `https://instagram.com/${member.business.instagram.replace(/^@/, '')}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-pink-400 transition"
                  title="Instagram"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Membership Tenancy info */}
          <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-2 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              SEC Chapter Record
            </span>
            <div className="flex items-center justify-between text-slate-300">
              <span>Member Since:</span>
              <span className="font-semibold text-white">{member.joinedDate}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Referral Code:</span>
              <span className="font-mono font-bold text-amber-400">{member.referralCode}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Digital Member Card Modal */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#0F172A] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" /> Official Digital Member Pass
              </h3>
              <button
                onClick={() => setShowCardModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg"
              >
                ✕ Close
              </button>
            </div>

            <DigitalMemberCard member={member} />
          </div>
        </div>
      )}
    </div>
  );
}
