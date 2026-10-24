'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Upload,
  AlertCircle,
  Copy,
  Check,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Lock,
  Key,
  Eye,
  EyeOff,
} from 'lucide-react';
import { SECStore, subscribeToStore } from '@/lib/store';
import { Member, BusinessCategory, AdminSettings } from '@/types';
import UpiPaymentButtons from '@/components/UpiPaymentButtons';
import { sanitizeInput, isValidUTR } from '@/lib/security';

function JoinContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [settings, setSettings] = useState<AdminSettings>(SECStore.getSettings());
  const [categories, setCategories] = useState<BusinessCategory[]>(SECStore.getCategories());

  // Current Step: 1 = Form, 2 = Payment & UTR Proof, 3 = Confirmation & Review
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessBusiness] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'IT & Software');
  const [designation, setDesignation] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [website, setWebsite] = useState('');
  const [whyJoin, setWhyJoin] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  // Newly Created Member State
  const [createdMember, setCreatedMember] = useState<Member | null>(null);

  // Payment Verification Fields
  const [upiRefId, setUpiRefId] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [upiQrDataUrl, setUpiQrDataUrl] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(SECStore.getSettings());
      setCategories(SECStore.getCategories());
    };
    const unsubscribe = subscribeToStore(handleUpdate);
    return () => unsubscribe();
  }, []);

  // Pre-fill referral code from query params e.g. /join?ref=SEC-SARAVANAN-001
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setReferralCode(ref.trim());
    }
  }, [searchParams]);

  // Generate dynamic payment QR code based on settings
  useEffect(() => {
    const upiString = `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(
      settings.clubName
    )}&am=${settings.membershipFee}&cu=INR`;

    QRCode.toDataURL(upiString, {
      width: 260,
      margin: 1,
      color: {
        dark: '#070B14',
        light: '#FFFFFF',
      },
    })
      .then((url) => setUpiQrDataUrl(url))
      .catch((err) => console.error('Error generating UPI QR:', err));
  }, [settings.upiId, settings.clubName, settings.membershipFee]);

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newPassword || newPassword.length < 6) {
      setFormError('Please create a password of at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    const cleanFullName = sanitizeInput(fullName);
    const cleanPhone = sanitizeInput(phone);
    const cleanEmail = sanitizeInput(email);
    const cleanBusinessName = sanitizeInput(businessName);
    const cleanDesignation = sanitizeInput(designation);
    const cleanLocation = sanitizeInput(location);
    const cleanReferralCode = sanitizeInput(referralCode);
    const cleanWhyJoin = sanitizeInput(whyJoin);
    const cleanDescription = sanitizeInput(description);
    const cleanInstagram = sanitizeInput(instagram);
    const cleanLinkedin = sanitizeInput(linkedin);
    const cleanWebsite = sanitizeInput(website);

    const newMemberId = `m-${Date.now()}`;
    const codeNumber = Math.floor(100 + Math.random() * 900);
    const cleanFirstName = cleanFullName.split(' ')[0].toUpperCase();
    const uniqueReferral = `SEC-${cleanFirstName}-${codeNumber}`;
    const uniqueMemberId = `SEC-2026-${codeNumber}`;

    const newMember: Member = {
      id: newMemberId,
      userId: `u-${Date.now()}`,
      fullName: cleanFullName,
      email: cleanEmail,
      phone: cleanPhone,
      whatsapp: cleanPhone,
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&fit=crop',
      bio: cleanWhyJoin || `${cleanDesignation} at ${cleanBusinessName}.`,
      role: 'member',
      status: 'payment_pending',
      joinedDate: new Date().toISOString().split('T')[0],
      membershipExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      memberIdCode: uniqueMemberId,
      referralCode: uniqueReferral,
      referredBy: cleanReferralCode || undefined,
      password: newPassword.trim(),
      badges: ['ACTIVE MEMBER'],
      gamificationPoints: 10,
      business: {
        id: `b-${Date.now()}`,
        memberId: newMemberId,
        businessName: cleanBusinessName,
        category,
        designation: cleanDesignation,
        description: cleanDescription || 'Specialized regional enterprise.',
        productsServices: ['Business Consultations', 'Product Supply'],
        location: cleanLocation,
        phone: cleanPhone,
        whatsapp: cleanPhone,
        email: cleanEmail,
        website: cleanWebsite || undefined,
        instagram: cleanInstagram || undefined,
        linkedin: cleanLinkedin || undefined,
        posterUrl: posterUrl || undefined,
        isPublic: true,
      },
      privacy: {
        phoneVisible: 'members_only',
        emailVisible: 'members_only',
      },
    };

    SECStore.addMember(newMember);
    setCreatedMember(newMember);
    setStep(2); // Proceed to Payment Flow
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdMember) return;

    const cleanUtr = sanitizeInput(upiRefId);
    if (!cleanUtr || !isValidUTR(cleanUtr)) {
      setFormError('Please enter a valid 12-digit UPI / UTR Transaction Reference ID from your payment app.');
      return;
    }

    SECStore.submitPayment({
      id: `pay-${Date.now()}`,
      memberId: createdMember.id,
      memberName: createdMember.fullName,
      businessName: createdMember.business.businessName,
      email: createdMember.email,
      phone: createdMember.phone,
      amount: settings.membershipFee,
      paymentType: 'membership',
      upiTransactionId: cleanUtr,
      screenshotUrl: screenshotUrl || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&fit=crop',
      status: 'under_review',
      submittedAt: new Date().toISOString(),
      referralCodeUsed: sanitizeInput(referralCode) || undefined,
      adminNotes: 'Direct UPI payment proof submitted via Join page.',
    });

    setStep(3); // Confirmation
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(settings.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Progress Stepper */}
      <div className="mb-10">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                step >= 1 ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/20' : 'bg-slate-800 text-slate-400'
              }`}
            >
              1
            </div>
            <span className="text-[11px] font-semibold text-slate-300 mt-1.5">Application</span>
          </div>

          <div className={`flex-1 h-0.5 mx-3 ${step >= 2 ? 'bg-amber-400' : 'bg-slate-800'}`} />

          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                step >= 2 ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/20' : 'bg-slate-800 text-slate-400'
              }`}
            >
              2
            </div>
            <span className="text-[11px] font-semibold text-slate-300 mt-1.5">Scan & Pay</span>
          </div>

          <div className={`flex-1 h-0.5 mx-3 ${step === 3 ? 'bg-amber-400' : 'bg-slate-800'}`} />

          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                step === 3 ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/20' : 'bg-slate-800 text-slate-400'
              }`}
            >
              3
            </div>
            <span className="text-[11px] font-semibold text-slate-300 mt-1.5">Verification</span>
          </div>
        </div>
      </div>

      {/* STEP 1: MEMBERSHIP APPLICATION FORM */}
      {step === 1 && (
        <div className="bg-[#0F172A] border border-amber-500/25 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
              Exclusive Member Cohort
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Join Salem Entrepreneurs Club
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Apply to join Salem&apos;s verified business circle. Annual Membership fee is{' '}
              <span className="text-amber-400 font-bold">₹{settings.membershipFee.toLocaleString('en-IN')}</span>.
            </p>
          </div>

          {referralCode && (
            <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300 font-semibold">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Referral Code Applied: <strong className="font-mono text-white">{referralCode}</strong>
              </span>
              <span className="text-[10px] text-slate-400">Validated</span>
            </div>
          )}

          <form onSubmit={handleApplicationSubmit} className="space-y-6">
            {/* Section: Personal Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <User className="w-4 h-4" /> 1. Entrepreneur Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Senthil Nathan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Mobile / WhatsApp Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98427 00000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="senthil@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Profile Photo URL
                  </label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Section: Business Info */}
            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <Building className="w-4 h-4" /> 2. Business Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Business / Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessBusiness(e.target.value)}
                    placeholder="e.g. Apex Engineering & Spares"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Business Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Your Designation / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Managing Director / Partner"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Salem Area / Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Fairlands / Suramangalam / Shevapet"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Business Description & Offerings
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your primary products, manufacturing capacity, or commercial services..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Website</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Instagram Handle</label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@company"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">LinkedIn Profile</label>
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Section: Referral & Intent */}
            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <Sparkles className="w-4 h-4" /> 3. Referral & Community Fit
              </h3>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Referred by SEC Member (Referral Code if any)
                </label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="e.g. SEC-SARAVANAN-001"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 font-mono uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Why do you wish to join Salem Entrepreneurs Club?
                </label>
                <textarea
                  rows={2}
                  value={whyJoin}
                  onChange={(e) => setWhyJoin(e.target.value)}
                  placeholder="What collaborations or opportunities are you seeking from the club?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>
            </div>

            {/* 4. Portal Login & Password Setup */}
            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <Key className="w-4 h-4" /> 4. Create Member Login Password
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Password * (min 6 characters)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                💡 You will use this password to log into the SEC Member portal after registration.
              </p>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition"
            >
              <span>Submit Application & Continue to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* STEP 2: SCAN & PAY UPI / GPAY */}
      {step === 2 && createdMember && (
        <div className="bg-[#0F172A] border border-amber-500/25 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
              Application Received
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Scan & Pay Membership Fee
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Please complete payment of{' '}
              <strong className="text-amber-400 text-base">₹{settings.membershipFee.toLocaleString('en-IN')}</strong>{' '}
              via UPI / Google Pay / PhonePe to activate your credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#070B14] p-6 sm:p-8 rounded-2xl border border-slate-800">
            {/* Dynamic QR Code */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-3 bg-white rounded-2xl shadow-xl border-2 border-amber-400">
                {settings.qrCodeUrl || upiQrDataUrl ? (
                  <img
                    src={settings.qrCodeUrl || upiQrDataUrl}
                    alt="UPI Payment QR"
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 bg-slate-800 rounded-xl animate-pulse" />
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono">Scan using Google Pay, PhonePe, Paytm, or BHIM</p>
            </div>

            {/* Payment Details & Instructions */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Official UPI ID
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-mono font-bold text-amber-300 truncate">
                    {settings.upiId}
                  </span>
                  <button
                    onClick={copyUpiId}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1 border border-slate-700 shrink-0"
                  >
                    {copiedUpi ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  GPay / PhonePe Mobile
                </span>
                <p className="text-sm font-bold text-white">{settings.gpayNumber}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Amount Due
                </span>
                <p className="text-xl font-black text-amber-400">₹{settings.membershipFee.toLocaleString('en-IN')}</p>
                <p className="text-[11px] text-slate-400">Valid for {settings.membershipDurationMonths} months</p>
              </div>

              {/* One-Click GPay / PhonePe / Paytm / Any UPI App Buttons */}
              <UpiPaymentButtons
                upiId={settings.upiId}
                payeeName={settings.clubName}
                amount={settings.membershipFee}
                transactionNote="SEC Membership Fee"
                memberId={createdMember?.memberIdCode}
              />

              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                {settings.paymentInstructions}
              </p>
            </div>
          </div>

          {/* Form to submit transaction ID & screenshot */}
          <form onSubmit={handlePaymentSubmit} className="mt-8 space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              Submit Payment Proof
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                12-Digit UPI / Transaction Reference (UTR) ID *
              </label>
              <input
                type="text"
                required
                value={upiRefId}
                onChange={(e) => setUpiRefId(e.target.value)}
                placeholder="e.g. 428819204910"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 font-mono tracking-wider"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Payment Screenshot Image URL *
              </label>
              <input
                type="url"
                required
                value={screenshotUrl}
                onChange={(e) => setScreenshotUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Attach receipt screenshot or keep default demo image for quick evaluation.
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Submit Payment Verification</span>
            </button>
          </form>
        </div>
      )}

      {/* STEP 3: SUBMISSION CONFIRMATION */}
      {step === 3 && createdMember && (
        <div className="bg-[#0F172A] border border-amber-500/25 rounded-3xl p-8 sm:p-12 text-center shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-400 shadow-xl">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Application & Payment Received!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Thank you, <strong className="text-white">{createdMember.fullName}</strong>. Your payment proof with Reference ID <strong className="font-mono text-amber-400">{upiRefId}</strong> has been forwarded to the SEC Secretariat for verification.
            </p>
          </div>

          {/* Member Credentials Preview */}
          <div className="max-w-sm mx-auto p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Assigned Member ID:</span>
              <span className="font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">{createdMember.memberIdCode}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Registered Email / ID:</span>
              <span className="font-semibold text-white">{createdMember.email}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Login Password:</span>
              <span className="font-mono font-semibold text-emerald-400">•••••••• (Saved)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Unique Referral Code:</span>
              <span className="font-mono font-bold text-amber-400">{createdMember.referralCode}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Status:</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Under Review
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/25 text-left text-xs text-amber-200/90 space-y-1 max-w-sm mx-auto">
            <p className="font-bold flex items-center gap-1.5 text-amber-300">
              <Lock className="w-3.5 h-3.5" /> Save Your Login Credentials:
            </p>
            <p className="text-[11px] text-slate-300">
              You can log in anytime using either your <strong>Member ID ({createdMember.memberIdCode})</strong> or your <strong>Email ({createdMember.email})</strong> with the password you just created.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push('/login')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition"
            >
              Sign In to Member Portal →
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700"
            >
              Preview Member Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading Application...</div>}>
      <JoinContent />
    </Suspense>
  );
}
