'use client';

import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  Shield,
  ExternalLink,
} from 'lucide-react';
import {
  InstagramIcon,
  FacebookIcon,
  YoutubeIcon,
  LinkedinIcon,
  WhatsAppIcon,
} from '@/components/SocialIcons';
import { SECStore } from '@/lib/store';

export const Footer: React.FC = () => {
  const settings = SECStore.getSettings();

  return (
    <footer className="bg-[#05080E] text-slate-300 border-t border-amber-500/20 pt-16 pb-24 lg:pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand & Mission column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center text-slate-950 font-black text-base shadow-lg shadow-amber-500/20">
                SEC
              </div>
              <div>
                <span className="text-base font-black tracking-wider uppercase text-white block">
                  Salem Entrepreneurs Club
                </span>
                <span className="text-xs text-amber-400 font-medium">
                  Connect. Collaborate. Grow.
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              The premier private networking coalition and growth catalyst for Salem&apos;s manufacturers,
              innovators, service leaders, and aspiring startup founders across Tamil Nadu.
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-3 pt-2">
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-amber-400 hover:text-amber-400 transition"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-amber-400 hover:text-amber-400 transition"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href={settings.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-amber-400 hover:text-amber-400 transition"
                aria-label="YouTube"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
              <a
                href={settings.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-amber-400 hover:text-amber-400 transition"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Explore Club
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/events" className="hover:text-amber-300 transition">
                  Conclaves & Events
                </Link>
              </li>
              <li>
                <Link href="/members" className="hover:text-amber-300 transition">
                  Member Directory
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-amber-300 transition">
                  Top Networkers Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-amber-300 transition font-semibold text-amber-400">
                  Member Login & Sign Up
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-amber-300 transition text-slate-400">
                  Admin Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Membership & Programs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Membership
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/join" className="text-amber-400 font-semibold hover:underline flex items-center gap-1">
                  Apply for Membership <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link href="/#why-sec" className="hover:text-amber-300 transition">
                  Why Join SEC
                </Link>
              </li>
              <li>
                <Link href="/referrals" className="hover:text-amber-300 transition">
                  Referral Program ({settings.referralPercentage}% Reward)
                </Link>
              </li>
              <li>
                <Link href="/membership-card" className="hover:text-amber-300 transition">
                  Digital Pass Verification
                </Link>
              </li>
              <li>
                <Link href="/#testimonials" className="hover:text-amber-300 transition">
                  Founder Testimonials
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Secretariat */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Club Secretariat
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{settings.contactAddress}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`tel:${settings.contactPhone}`} className="hover:text-white transition">
                  {settings.contactPhone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-white transition">
                  {settings.contactEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip: Legal & Admin Link */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Salem Entrepreneurs Club. All rights reserved.</p>

          <div className="flex items-center space-x-5">
            <Link href="/#about" className="hover:text-slate-300 transition">
              About
            </Link>
            <Link href="/#contact" className="hover:text-slate-300 transition">
              Contact
            </Link>
            <span className="text-slate-700">|</span>
            <Link
              href="/admin/login"
              className="text-amber-400/80 hover:text-amber-300 font-semibold flex items-center gap-1 transition"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
