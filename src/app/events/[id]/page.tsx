'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Ticket,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  QrCode,
  Sparkles,
  Copy,
  Check,
  Upload,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { SECStore, subscribeToStore } from '@/lib/store';
import { SECEvent, EventRegistration, Member } from '@/types';
import MemberAccessGate from '@/components/MemberAccessGate';

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { currentUser, role } = useAuth();

  const [event, setEvent] = useState<SECEvent | undefined>(SECStore.getEventById(id));
  const [registrations, setRegistrations] = useState<EventRegistration[]>(
    SECStore.getRegistrationsForEvent(id)
  );
  const [settings, setSettings] = useState(SECStore.getSettings());
  const [showRsvpModal, setShowRsvpModal] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<'attending' | 'maybe' | 'not_attending'>('attending');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [attendanceQr, setAttendanceQr] = useState<string>('');

  // Event Payment state
  const [eventUpiRefId, setEventUpiRefId] = useState('');
  const [eventScreenshot, setEventScreenshot] = useState('');
  const [copiedEventUpi, setCopiedEventUpi] = useState(false);
  const [generatedEventQr, setGeneratedEventQr] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setEvent(SECStore.getEventById(id));
      setRegistrations(SECStore.getRegistrationsForEvent(id));
      setSettings(SECStore.getSettings());
    };
    const unsubscribe = subscribeToStore(handleUpdate);
    return () => unsubscribe();
  }, [id]);

  // Generate fallback event UPI QR code if no custom QR uploaded
  useEffect(() => {
    if (event && event.registrationFee > 0) {
      const upiString = `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(
        event.title
      )}&am=${event.registrationFee}&cu=INR`;

      QRCode.toDataURL(upiString, {
        width: 200,
        margin: 1,
        color: { dark: '#070B14', light: '#FFFFFF' },
      })
        .then((url) => setGeneratedEventQr(url))
        .catch((err) => console.error(err));
    }
  }, [event, settings.upiId]);

  const member = currentUser || (role === 'member' ? SECStore.getMembers()[0] : null);
  const userRegistration = registrations.find((r) => r.memberId === member?.id);

  // Generate attendee check-in QR code if registered
  useEffect(() => {
    if (userRegistration && event) {
      const checkinPayload = JSON.stringify({
        registrationId: userRegistration.id,
        eventId: event.id,
        memberId: userRegistration.memberId,
        memberCode: userRegistration.memberIdCode,
      });

      QRCode.toDataURL(checkinPayload, {
        width: 180,
        margin: 1,
        color: { dark: '#070B14', light: '#FFFFFF' },
      })
        .then((url) => setAttendanceQr(url))
        .catch((err) => console.error('Error generating attendance QR:', err));
    }
  }, [userRegistration, event]);

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Event Not Found</h2>
        <p className="text-xs text-slate-400 mb-4">The requested conclave or meetup could not be found.</p>
        <Link href="/events" className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs">
          View Events Calendar
        </Link>
      </div>
    );
  }

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setEventScreenshot(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const copyEventUpi = () => {
    navigator.clipboard.writeText(settings.upiId);
    setCopiedEventUpi(true);
    setTimeout(() => setCopiedEventUpi(false), 2500);
  };

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) {
      alert('Please log in as an SEC member to register for conclaves!');
      return;
    }

    const isPaid = event.registrationFee > 0;

    if (isPaid && rsvpStatus === 'attending' && !eventUpiRefId.trim()) {
      alert('Please enter your 12-digit UPI / UTR Transaction Reference ID for the delegate fee.');
      return;
    }

    const reg: EventRegistration = {
      id: userRegistration ? userRegistration.id : `reg-${Date.now()}`,
      eventId: event.id,
      memberId: member.id,
      memberName: member.fullName,
      businessName: member.business.businessName,
      phone: member.phone,
      email: member.email,
      memberIdCode: member.memberIdCode,
      registrationDate: new Date().toISOString().split('T')[0],
      status: rsvpStatus,
      paymentStatus: isPaid ? 'pending' : 'free',
      attendanceStatus: 'absent',
      notes: additionalNotes + (eventUpiRefId ? ` | UTR: ${eventUpiRefId}` : ''),
    };

    SECStore.registerForEvent(reg);

    // If paid event, submit payment proof to Admin Panel
    if (isPaid && rsvpStatus === 'attending') {
      SECStore.submitPayment({
        id: `pay-${Date.now()}`,
        memberId: member.id,
        memberName: member.fullName,
        businessName: member.business.businessName,
        email: member.email,
        phone: member.phone,
        amount: event.registrationFee,
        paymentType: 'event',
        eventId: event.id,
        upiTransactionId: eventUpiRefId.trim(),
        screenshotUrl: eventScreenshot || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&fit=crop',
        status: 'under_review',
        submittedAt: new Date().toISOString(),
        adminNotes: `Event registration fee for: ${event.title}`,
      });
    }

    setShowRsvpModal(false);
    setRegistrationSuccess(true);
    setTimeout(() => setRegistrationSuccess(false), 5000);
  };

  if (!currentUser) {
    return (
      <MemberAccessGate
        title="Event Access Restricted"
        description="Event agenda, speaker roster, and registration passes are reserved exclusively for Salem Entrepreneurs Club members. Sign up or log in to register."
        featureName="Club Events"
      />
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Event Not Found</h2>
        <p className="text-xs text-slate-400 mb-4">The event you are looking for does not exist or has concluded.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Banner & Hero Header */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl bg-slate-900">
        <div className="aspect-[21/9] sm:h-96 w-full relative">
          <img
            src={event.bannerUrl || event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070B14] via-[#070B14]/60 to-transparent" />
        </div>

        <div className="p-6 sm:p-10 relative z-10 -mt-24 sm:-mt-32 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
              {event.category}
            </span>
            {event.registrationFee === 0 ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Complimentary for Members
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ₹{event.registrationFee} Delegate Fee
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight max-w-4xl leading-tight">
            {event.title}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Date</span>
                <span className="font-semibold text-white">{event.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Timing</span>
                <span className="font-semibold text-white">
                  {event.startTime} - {event.endTime}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <Users className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Registered</span>
                <span className="font-semibold text-white">
                  {event.registeredCount} / {event.maxParticipants} Attendees
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Alert if RSVP just completed */}
      {registrationSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Your registration is confirmed! Your Digital Attendance Pass is ready below.
          </span>
          <span className="text-emerald-400 font-bold">Confirmed</span>
        </div>
      )}

      {/* Main Grid: Details, Agenda, Speakers, RSVP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Description, Agenda, Speakers, Sponsors */}
        <div className="lg:col-span-8 space-y-8">
          {/* Overview */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
              About This Gathering
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>

            {event.dressCode && (
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Dress Code:</strong> {event.dressCode}
                </span>
              </div>
            )}
          </div>

          {/* Agenda Timeline */}
          {event.agenda.length > 0 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                Event Agenda & Schedule
              </h3>
              <div className="space-y-3 pt-2">
                {event.agenda.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <span className="font-mono font-bold text-amber-300 shrink-0">{item.time}</span>
                    <span className="text-slate-200 font-medium sm:text-right">{item.activity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Speakers */}
          {event.speakers.length > 0 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                Keynote Speakers & Panelists
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {event.speakers.map((spk, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-3"
                  >
                    <img
                      src={
                        spk.avatarUrl ||
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop'
                      }
                      alt={spk.name}
                      className="w-12 h-12 rounded-xl object-cover border border-amber-400/50"
                    />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">{spk.name}</h4>
                      <p className="text-[11px] text-amber-400 font-semibold">{spk.role}</p>
                      <p className="text-[10px] text-slate-400">{spk.company}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Participant Roster */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" /> Attending Entrepreneurs ({registrations.length})
              </h3>
              <span className="text-[10px] text-slate-400">Verified SEC Members</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {registrations.slice(0, 6).map((reg) => (
                <div
                  key={reg.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{reg.memberName}</span>
                    <span className="text-[11px] text-slate-400">{reg.businessName}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {reg.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Venue, Map, RSVP Action, Attendance QR */}
        <div className="lg:col-span-4 space-y-6">
          {/* Registration / RSVP Action Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#0E1626] to-[#090F1B] border border-amber-500/30 shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              {userRegistration ? 'Your Registration Status' : 'Event Registration'}
            </h3>

            {userRegistration ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                    RSVP Status
                  </span>
                  <p className="text-sm font-bold text-white">
                    {userRegistration.status === 'attending'
                      ? '✓ Attending Conclave'
                      : userRegistration.status === 'maybe'
                      ? 'Tentative (Maybe)'
                      : 'Not Attending'}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Pass Ref: {userRegistration.id}
                  </span>
                </div>

                {/* Attendance QR Code */}
                {attendanceQr && userRegistration.status === 'attending' && (
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center text-center space-y-2">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      Event Check-In QR Pass
                    </span>
                    <div className="p-2 bg-white rounded-xl shadow-lg border border-amber-400/40">
                      <img src={attendanceQr} alt="Event QR" className="w-32 h-32" />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Show this QR to SEC Reception desk upon arrival to record attendance points.
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setShowRsvpModal(true)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition"
                >
                  Update My RSVP Response
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Join fellow Salem business owners for this high-impact session. Registration takes 1 click.
                </p>
                <button
                  onClick={() => setShowRsvpModal(true)}
                  className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition"
                >
                  <Ticket className="w-4 h-4" />
                  <span>CONNECT / REGISTER</span>
                </button>
              </div>
            )}
          </div>

          {/* Venue & Location Card */}
          <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-3 text-xs">
            <h3 className="font-bold text-amber-400 uppercase tracking-wider">Venue & Directions</h3>
            <div className="flex items-start gap-2.5 text-slate-300">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{event.venue}</span>
            </div>

            {event.googleMapsUrl && (
              <a
                href={event.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-slate-800"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Sponsors */}
          {event.sponsors.length > 0 && (
            <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-3 text-xs">
              <h3 className="font-bold text-slate-400 uppercase tracking-wider">Event Sponsors</h3>
              <div className="flex flex-wrap gap-2">
                {event.sponsors.map((sp, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-amber-300 font-semibold text-xs"
                  >
                    {sp}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RSVP Modal */}
      {showRsvpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#0F172A] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Ticket className="w-4 h-4 text-amber-400" /> Event Registration
              </h3>
              <button
                onClick={() => setShowRsvpModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Auto Captured Member Info */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Attendee Profile</div>
              <p className="font-bold text-white">{member?.fullName}</p>
              <p className="text-amber-400 text-[11px]">{member?.business.businessName}</p>
              <p className="text-slate-400 text-[10px] font-mono">
                {member?.memberIdCode} • {member?.phone}
              </p>
            </div>

            <form onSubmit={handleRsvpSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Attendance Intent
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['attending', 'maybe', 'not_attending'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setRsvpStatus(opt)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition capitalize ${
                        rsvpStatus === opt
                          ? 'bg-amber-400 text-slate-950 shadow'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {opt.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delegate Fee Payment QR Section (If Paid Event) */}
              {event.registrationFee > 0 && rsvpStatus === 'attending' && (
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" /> Delegate Fee: ₹{event.registrationFee}
                    </span>
                    <span className="text-[10px] text-slate-400">Scan & Pay via UPI</span>
                  </div>

                  <div className="flex flex-col items-center justify-center py-2 text-center">
                    <div className="p-2 bg-white rounded-xl shadow-md border-2 border-amber-400/50">
                      <img
                        src={settings.qrCodeUrl || generatedEventQr}
                        alt="Official Conclave Payment QR"
                        className="w-36 h-36 object-contain"
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-slate-950 rounded-lg border border-slate-800 text-[11px]">
                      <span className="text-slate-400 font-mono">UPI: {settings.upiId}</span>
                      <button
                        type="button"
                        onClick={copyEventUpi}
                        className="text-amber-400 hover:text-white"
                        title="Copy UPI ID"
                      >
                        {copiedEventUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-amber-300 block mb-1">
                      12-Digit UTR / Transaction Reference ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={eventUpiRefId}
                      onChange={(e) => setEventUpiRefId(e.target.value)}
                      placeholder="e.g. 423982019283"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      Payment Screenshot Proof (Optional)
                    </label>
                    <label className="cursor-pointer flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-dashed border-slate-700 text-[11px] text-slate-300">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>{eventScreenshot ? 'Screenshot Attached ✓' : 'Upload Screenshot'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Additional Notes / Questions for Keynote
                </label>
                <textarea
                  rows={2}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Dietary preferences, guest info, or questions for speakers..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{event.registrationFee > 0 && rsvpStatus === 'attending' ? 'Submit Delegate Payment & Register' : 'Confirm Registration'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
