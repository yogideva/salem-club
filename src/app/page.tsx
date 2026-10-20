'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Briefcase,
  Handshake,
  BookOpen,
  Calendar,
  Smile,
  Eye,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Clock,
  Send,
  Star,
  Quote,
  MessageCircle,
} from 'lucide-react';
import { SECStore, subscribeToStore } from '@/lib/store';
import { Member, SECEvent, Testimonial, GalleryItem, AdminSettings } from '@/types';

export default function HomePage() {
  const [settings, setSettings] = useState<AdminSettings>(SECStore.getSettings());
  const [members, setMembers] = useState<Member[]>(SECStore.getMembers());
  const [events, setEvents] = useState<SECEvent[]>(SECStore.getEvents());
  const [testimonials, setTestimonials] = useState<Testimonial[]>(SECStore.getTestimonials());
  const [gallery, setGallery] = useState<GalleryItem[]>(SECStore.getGallery());
  const [galleryFilter, setGalleryFilter] = useState<string>('All');

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactBusiness, setContactBusiness] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(SECStore.getSettings());
      setMembers(SECStore.getMembers());
      setEvents(SECStore.getEvents());
      setTestimonials(SECStore.getTestimonials());
      setGallery(SECStore.getGallery());
    };
    const unsubscribe = subscribeToStore(handleUpdate);
    return () => unsubscribe();
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    SECStore.addAuditLog(
      'Contact Inquiry',
      'Inquiry',
      contactEmail,
      `Inquiry from ${contactName} (${contactBusiness}): ${contactMessage.slice(0, 50)}...`,
      'Visitor'
    );
    setContactSubmitted(true);
    setContactName('');
    setContactPhone('');
    setContactEmail('');
    setContactBusiness('');
    setContactMessage('');
    setTimeout(() => setContactSubmitted(false), 6000);
  };

  const whyJoinCards = [
    {
      title: 'NETWORK',
      icon: Users,
      desc: 'Meet high-caliber entrepreneurs, manufacturers, and innovators from across diverse industries in Salem.',
      accent: 'from-amber-500/20 to-amber-600/5',
    },
    {
      title: 'BUSINESS',
      icon: Briefcase,
      desc: 'Generate warm business opportunities, qualified referrals, and high-margin supplier contracts.',
      accent: 'from-emerald-500/20 to-emerald-600/5',
    },
    {
      title: 'COLLABORATION',
      icon: Handshake,
      desc: 'Find trusted partners, vendors, co-founders, and joint venture collaborators for your growth.',
      accent: 'from-blue-500/20 to-blue-600/5',
    },
    {
      title: 'KNOWLEDGE',
      icon: BookOpen,
      desc: 'Learn directly from veteran industrialists, chartered accountants, tech leaders, and export stalwarts.',
      accent: 'from-purple-500/20 to-purple-600/5',
    },
    {
      title: 'EVENTS',
      icon: Calendar,
      desc: 'Participate in monthly black-tie dinner conclaves, practical workshops, and masterclasses.',
      accent: 'from-rose-500/20 to-rose-600/5',
    },
    {
      title: 'FUN & SOCIAL',
      icon: Smile,
      desc: 'Build authentic, lifelong friendships and camaraderie beyond formal business negotiations.',
      accent: 'from-yellow-500/20 to-yellow-600/5',
    },
    {
      title: 'VISIBILITY',
      icon: Eye,
      desc: 'Gain prestigious regional visibility with verified digital cards, social features, and member directory.',
      accent: 'from-cyan-500/20 to-cyan-600/5',
    },
    {
      title: 'GROWTH',
      icon: TrendingUp,
      desc: 'Scale your business valuation, unlock export corridors, and grow together with Salem’s best.',
      accent: 'from-amber-500/20 to-amber-600/5',
    },
  ];

  const filteredGallery =
    galleryFilter === 'All' ? gallery : gallery.filter((item) => item.category === galleryFilter);

  const featuredMembers = members.filter((m) => m.status === 'active').slice(0, 4);
  const upcomingEvents = events.filter((e) => e.isPublished).slice(0, 3);

  return (
    <div className="space-y-24 sm:space-y-32">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-32 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-amber-500/15 via-yellow-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wider uppercase shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Connect • Collaborate • Grow</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase leading-[1.08]">
              {settings.clubName || 'Salem Entrepreneurs Club'}
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-2xl font-medium text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {settings.tagline}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/login?tab=signup"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 group"
              >
                <span>JOIN THE CLUB</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/50 transition-all flex items-center justify-center gap-2"
              >
                <span>MEMBER LOGIN</span>
                <ChevronRight className="w-4 h-4 text-amber-400" />
              </Link>
            </div>

            {/* Key Club Metric Counters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="text-2xl sm:text-3xl font-black text-amber-400">150+</div>
                <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">
                  Salem Founders
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="text-2xl sm:text-3xl font-black text-white">₹12 Cr+</div>
                <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">
                  Referral Pipeline
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="text-2xl sm:text-3xl font-black text-amber-400">35+</div>
                <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">
                  Conclaves & Meets
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">98%</div>
                <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">
                  Member Retention
                </div>
              </div>
            </div>
          </div>

          {/* Hero Visual Mockup */}
          <div className="mt-14 relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl shadow-amber-500/10">
            <div className="aspect-[16/9] md:aspect-[21/9] w-full relative">
              <img
                src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&fit=crop"
                alt="Entrepreneurs Networking at Salem Conclave"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070B14] via-[#070B14]/40 to-transparent" />

              {/* Floating Overlay Card */}
              <div className="absolute bottom-6 left-6 right-6 md:left-10 md:bottom-10 md:max-w-md p-5 rounded-2xl bg-[#0F172A]/90 backdrop-blur-md border border-amber-500/30 shadow-xl">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                    Salem Chapter In Session
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                  Join 150+ verified business leaders in textiles, steel, sago, software, healthcare & infrastructure.
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                  <span>Exclusive Peer Network</span>
                  <Link href="/join" className="text-amber-400 font-bold hover:underline">
                    Get Invited →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT SEC SECTION */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              About Salem Entrepreneurs Club
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              A Private Ecosystem Designed for Real Growth
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {settings.aboutText}
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Who Can Join?</h4>
                  <p className="text-xs text-slate-400">
                    Business owners, managing directors, founders, factory operators, and professional service leaders registered in the Salem & Kongu region.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">How Business Referrals Work</h4>
                  <p className="text-xs text-slate-400">
                    Members actively exchange verified vendor leads, cross-sell services, and earn {settings.referralPercentage}% rewards through unique referral codes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Curated Monthly Conclaves</h4>
                  <p className="text-xs text-slate-400">
                    From 5-star networking dinners at Radisson Salem to Yercaud mastermind retreats, our events balance high-level strategy with genuine fellowship.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=900&fit=crop"
                alt="Entrepreneurs Round Table Discussion"
                className="w-full h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070B14] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-slate-900/90 border border-slate-700">
                <p className="text-xs text-amber-300 font-semibold uppercase tracking-wider">
                  The SEC Philosophy
                </p>
                <p className="text-xs text-slate-200 mt-1">
                  “When entrepreneurs collaborate authentically, local industry achieves exponential scale.”
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHY JOIN SEC (8 Core Pillars) */}
      <section id="why-sec" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            Why Join SEC?
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Eight Concrete Reasons Leaders Choose SEC
          </h2>
          <p className="text-sm text-slate-400">
            A comprehensive growth engine combining networking, education, lead generation, and social bonding.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyJoinCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="group relative p-6 rounded-2xl bg-[#0F172A]/70 border border-slate-800 hover:border-amber-400/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.accent} border border-amber-500/20 flex items-center justify-center mb-4 text-amber-400 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-white uppercase tracking-wider mb-2 group-hover:text-amber-400 transition">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center text-[10px] text-amber-400 font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn More →
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4 & 5. MISSION & VISION QUOTE CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission */}
          <div className="relative p-8 rounded-3xl bg-gradient-to-br from-[#0E1626] to-[#070B14] border border-amber-400/30 shadow-xl overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />
            <Quote className="w-10 h-10 text-amber-400/20 mb-4" />
            <span className="text-xs font-black uppercase tracking-widest text-amber-400 block mb-2">
              Our Mission
            </span>
            <p className="text-base sm:text-lg text-slate-200 font-serif italic leading-relaxed">
              &ldquo;{settings.missionText}&rdquo;
            </p>
          </div>

          {/* Vision */}
          <div className="relative p-8 rounded-3xl bg-gradient-to-br from-[#0E1626] to-[#070B14] border border-amber-400/30 shadow-xl overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />
            <Quote className="w-10 h-10 text-amber-400/20 mb-4" />
            <span className="text-xs font-black uppercase tracking-widest text-amber-400 block mb-2">
              Our Vision
            </span>
            <p className="text-base sm:text-lg text-slate-200 font-serif italic leading-relaxed">
              &ldquo;{settings.visionText}&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* 6. BENEFITS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#0E1729] to-[#090F1B] border border-amber-500/20 shadow-2xl">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Privileges of SEC Membership
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Immediate tangible returns from day one of your membership activation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm mb-3">
                01
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">Official Digital Member Card</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                A gold-foiled dynamic digital card with personal QR code linking to your verified business profile and portfolio.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm mb-3">
                02
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">Active Referral Commissions</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Earn {settings.referralPercentage}% direct referral rewards (₹{Math.round((settings.membershipFee * settings.referralPercentage) / 100)}) on every peer entrepreneur you invite.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm mb-3">
                03
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">VIP Conclave Access</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Complimentary or subsidized seating at all SEC regional conclaves, masterclasses, and executive roundtables.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. UPCOMING EVENTS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              Conclaves & Gatherings
            </div>
            <h2 className="text-3xl font-extrabold text-white">Upcoming Events</h2>
          </div>
          <Link
            href="/events"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            View Full Calendar ({events.length}) <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingEvents.map((evt) => (
            <div
              key={evt.id}
              className="group rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-amber-400/40 overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[16/9] w-full relative overflow-hidden">
                  <img
                    src={evt.imageUrl}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-amber-500/30">
                    {evt.category}
                  </div>
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-amber-400 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      {evt.date}
                    </span>
                    <span>•</span>
                    <span>{evt.startTime}</span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition line-clamp-2">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="pt-2 flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{evt.venue.split(',')[0]}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 mt-2">
                <Link
                  href={`/events/${evt.id}`}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition"
                >
                  <span>Connect / Register</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. FEATURED MEMBERS SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              Salem Business Titans
            </div>
            <h2 className="text-3xl font-extrabold text-white">Featured Member Profiles</h2>
          </div>
          <Link
            href="/members"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            Search Directory ({members.length}) <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredMembers.map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-amber-400/40 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={m.avatarUrl}
                    alt={m.fullName}
                    className="w-14 h-14 rounded-2xl object-cover border border-amber-400 shadow-md"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-white truncate group-hover:text-amber-300 transition">
                      {m.fullName}
                    </h4>
                    <p className="text-[11px] text-amber-400 truncate">{m.business.designation}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {m.business.category}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 my-3">
                  <p className="text-xs font-bold text-slate-200 truncate">
                    {m.business.businessName}
                  </p>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {m.bio}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 font-mono">{m.memberIdCode}</span>
                <Link
                  href={`/members/${m.id}`}
                  className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-0.5"
                >
                  View Profile →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. GALLERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            Moments That Matter
          </div>
          <h2 className="text-3xl font-extrabold text-white">SEC Event Gallery</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            A glimpse into our high-energy conclaves, roundtables, and hill retreats.
          </p>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {['All', 'Events', 'Networking', 'Celebrations', 'Workshops', 'Community'].map((cat) => (
              <button
                key={cat}
                onClick={() => setGalleryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  galleryFilter === cat
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredGallery.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] border border-slate-800 hover:border-amber-400/50 shadow-lg"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                <span className="text-[10px] text-amber-300 font-bold uppercase">{item.category}</span>
                <h4 className="text-xs sm:text-sm font-bold text-white">{item.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 11. TESTIMONIALS */}
      <section id="testimonials" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            Voices of Salem Founders
          </div>
          <h2 className="text-3xl font-extrabold text-white">Member Endorsements</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((test) => (
            <div
              key={test.id}
              className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-amber-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center space-x-1 text-amber-400 mb-4">
                  {[...Array(test.rating)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic mb-6">
                  &ldquo;{test.content}&rdquo;
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-4 border-t border-slate-800">
                <img
                  src={test.photoUrl}
                  alt={test.name}
                  className="w-11 h-11 rounded-full object-cover border border-amber-400/50"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">{test.name}</h4>
                  <p className="text-[10px] text-amber-400 font-medium">{test.designation}</p>
                  <p className="text-[10px] text-slate-400 truncate">{test.business}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 12. MEMBERSHIP CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-14 overflow-hidden border border-amber-400/40 shadow-2xl bg-gradient-to-r from-[#0E1628] via-[#15233E] to-[#0A101C]">
          <div className="max-w-2xl space-y-5">
            <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-400/30">
              Limited Membership Openings
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Ready to Accelerate Your Business in Salem?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Annual Membership: <span className="text-amber-400 font-bold">₹{settings.membershipFee.toLocaleString('en-IN')}</span> / {settings.membershipDurationMonths} Months. Receive verified credentials, digital pass, conclave seating, and earn {settings.referralPercentage}% rewards on every peer referral.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/login?tab=signup"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
              >
                <span>APPLY FOR MEMBERSHIP</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-xs text-slate-400">
                Application review within 24 business hours.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 13. CONTACT FORM SECTION */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              Get in Touch
            </div>
            <h2 className="text-3xl font-extrabold text-white">Contact Club Secretariat</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Have questions regarding membership criteria, sponsorship for conclaves, or regional chapter affiliations? Reach our administrative desk.
            </p>

            <div className="space-y-3 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{settings.contactAddress}</span>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline text-emerald-400 font-medium"
                >
                  Direct WhatsApp: {settings.whatsappNumber}
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <form
              onSubmit={handleContactSubmit}
              className="p-6 sm:p-8 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-4"
            >
              {contactSubmitted && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Thank you! Your message has been routed to the SEC Secretariat. We will respond shortly.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Senthil Kumar"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98427 00000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="senthil@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Business Name</label>
                  <input
                    type="text"
                    value={contactBusiness}
                    onChange={(e) => setContactBusiness(e.target.value)}
                    placeholder="e.g. Salem Sago Enterprises"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Your Message *</label>
                <textarea
                  required
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="How can we assist you or collaborate?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
              >
                <Send className="w-3.5 h-3.5" /> Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
