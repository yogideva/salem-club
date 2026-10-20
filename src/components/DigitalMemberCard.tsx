'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { ShieldCheck, Download, Share2, Sparkles, Printer } from 'lucide-react';
import { Member } from '@/types';

interface DigitalMemberCardProps {
  member: Member;
  compact?: boolean;
}

export const DigitalMemberCard: React.FC<DigitalMemberCardProps> = ({ member, compact = false }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    // Generate QR code pointing to member's public SEC card/profile URL
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://salementrepreneursclub.com';
    const profileUrl = `${baseUrl}/members/${member.id}`;

    QRCode.toDataURL(profileUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: '#070B14',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR code:', err));
  }, [member.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${member.fullName} - Salem Entrepreneurs Club Digital Membership Card`,
          text: `Official Member ID: ${member.memberIdCode} | ${member.business.businessName}`,
          url: `${window.location.origin}/members/${member.id}`,
        });
      } catch {
        // Share cancelled
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/members/${member.id}`);
      alert('Member profile link copied to clipboard!');
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* The Printable / Viewable Card Shell */}
      <div
        id="printable-membership-card"
        className={`relative w-full max-w-md rounded-2xl p-6 sm:p-7 overflow-hidden border border-amber-400/40 shadow-2xl transition-all duration-300 ${
          compact ? 'scale-95' : 'hover:shadow-amber-500/10'
        }`}
        style={{
          background: 'linear-gradient(135deg, #091122 0%, #111E38 45%, #080D1A 100%)',
        }}
      >
        {/* Subtle Decorative Golden Rings Background */}
        <div className="absolute -right-16 -top-16 w-52 h-52 rounded-full border border-amber-500/20 pointer-events-none" />
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full border border-amber-500/15 pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-44 h-44 rounded-full border border-amber-500/10 pointer-events-none" />

        {/* Top Header: Club Name & Verified Chip */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-amber-500/20">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-sm tracking-wider">
              SEC
            </div>
            <div>
              <div className="text-xs font-black tracking-widest uppercase text-amber-400">
                Salem Entrepreneurs Club
              </div>
              <div className="text-[10px] text-slate-400 font-medium tracking-wide">
                Official Digital Membership Pass
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-[10px] font-bold text-amber-300">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>VERIFIED</span>
          </div>
        </div>

        {/* Middle Body: Avatar, Name, Business, Category */}
        <div className="relative z-10 my-5 flex items-center gap-4">
          <div className="relative shrink-0">
            <img
              src={member.avatarUrl}
              alt={member.fullName}
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-xl"
            />
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-950 border border-amber-400 text-amber-400">
              <Sparkles className="w-3 h-3" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-white truncate tracking-tight">
              {member.fullName}
            </h3>
            <p className="text-xs font-medium text-amber-400 truncate mt-0.5">
              {member.business.designation}
            </p>
            <p className="text-xs text-slate-300 font-semibold truncate mt-0.5">
              {member.business.businessName}
            </p>
            <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-800/90 text-amber-300/90 border border-slate-700">
              {member.business.category}
            </span>
          </div>
        </div>

        {/* Bottom Section: Member ID, Validity, QR Code */}
        <div className="relative z-10 pt-4 border-t border-amber-500/20 flex items-center justify-between">
          <div className="space-y-1">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Member ID
              </div>
              <div className="text-sm font-mono font-bold text-amber-300">
                {member.memberIdCode}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Validity
              </div>
              <div className="text-xs font-medium text-slate-300">
                Valid Thru: {new Date(member.membershipExpiryDate).toLocaleDateString('en-IN', {
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center">
            {qrDataUrl ? (
              <div className="p-1.5 bg-white rounded-xl shadow-lg border border-amber-400/40">
                <img
                  src={qrDataUrl}
                  alt={`QR for ${member.memberIdCode}`}
                  className="w-16 h-16 sm:w-18 sm:h-18"
                />
              </div>
            ) : (
              <div className="w-16 h-16 bg-slate-800 rounded-xl animate-pulse" />
            )}
            <span className="text-[9px] text-slate-400 font-mono mt-1">Scan for Profile</span>
          </div>
        </div>

        {/* Card Footer Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
            Salem Chapter Active
          </span>
          <span className="font-semibold text-amber-400/80">Connect • Collaborate • Grow</span>
        </div>
      </div>

      {/* Card Actions (Print / Share / Download) */}
      {!compact && (
        <div className="flex items-center gap-3 mt-4 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            Print Card
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 transition shadow-lg shadow-amber-500/20"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share Profile
          </button>
        </div>
      )}
    </div>
  );
};
