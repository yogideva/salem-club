'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import QRCode from 'qrcode';
import {
  Lock,
  Mail,
  ArrowRight,
  Shield,
  Sparkles,
  UserCheck,
  UserPlus,
  CheckCircle2,
  CreditCard,
  Upload,
  Copy,
  Check,
  Building,
  Phone,
  MapPin,
  Briefcase,
  AlertCircle,
  ChevronLeft,
  Eye,
  EyeOff,
  Key,
  Clock,
  Camera,
  User,
} from 'lucide-react';
import { InstagramIcon } from '@/components/SocialIcons';
import { useAuth } from '@/lib/authContext';
import { SECStore, subscribeToStore } from '@/lib/store';
import { AdminSettings, BusinessCategory, Member } from '@/types';
import UpiPaymentButtons from '@/components/UpiPaymentButtons';
import { SecurityRateLimiter, sanitizeInput, isValidUTR } from '@/lib/security';

function MemberAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginAsMember } = useAuth();

  // Active Tab: 'login' | 'signup'
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login';
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);

  // Settings & Categories from Store
  const [settings, setSettings] = useState<AdminSettings>(SECStore.getSettings());
  const [categories, setCategories] = useState<BusinessCategory[]>(SECStore.getCategories());

  // Login Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [memberLockoutSeconds, setMemberLockoutSeconds] = useState(0);

  // Monitor Anti-Brute-Force Lockout
  useEffect(() => {
    const check = () => {
      const status = SecurityRateLimiter.checkLockout('member_login');
      if (status.locked) {
        setMemberLockoutSeconds(status.remainingSeconds);
      } else {
        setMemberLockoutSeconds(0);
      }
    };
    check();
    const timer = setInterval(check, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sign Up Form State — Step 1 = Details, 2 = Payment QR, 3 = Confirmation
  const [signupStep, setSignupStep] = useState<1 | 2 | 3>(1);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'IT & Software');
  const [designation, setDesignation] = useState('');
  const [location, setLocation] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [instagram, setInstagram] = useState('');
  const [description, setDescription] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [memberPhoto, setMemberPhoto] = useState('');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setMemberPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Payment Step State
  const [upiRefId, setUpiRefId] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [generatedUpiQr, setGeneratedUpiQr] = useState('');
  const [createdMember, setCreatedMember] = useState<Member | null>(null);
  const [signupError, setSignupError] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(SECStore.getSettings());
      setCategories(SECStore.getCategories());
    };
    const unsubscribe = subscribeToStore(handleUpdate);
    return () => unsubscribe();
  }, []);

  // Listen to searchParams changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'signup') {
      setActiveTab('signup');
    } else if (tabParam === 'login') {
      setActiveTab('login');
    }
    const refParam = searchParams.get('ref');
    if (refParam) {
      setReferralCode(refParam.trim());
      setActiveTab('signup');
    }
  }, [searchParams]);

  // Generate fallback dynamic UPI QR if no custom admin QR is uploaded
  useEffect(() => {
    const upiString = `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(
      settings.clubName
    )}&am=${settings.membershipFee}&cu=INR`;

    QRCode.toDataURL(upiString, {
      width: 260,
      margin: 1,
      color: { dark: '#070B14', light: '#FFFFFF' },
    })
      .then((url) => setGeneratedUpiQr(url))
      .catch((err) => console.error('Error generating fallback UPI QR:', err));
  }, [settings.upiId, settings.clubName, settings.membershipFee]);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Check anti-brute-force rate limiter
    const lockCheck = SecurityRateLimiter.checkLockout('member_login');
    if (lockCheck.locked) {
      setLoginError(
        `Security Lockout: Member login is locked for ${lockCheck.remainingSeconds}s due to consecutive failed attempts.`
      );
      return;
    }

    const cleanIdentifier = sanitizeInput(identifier);

    if (!cleanIdentifier) {
      setLoginError('Please enter your registered Email, Mobile, or Member ID.');
      return;
    }
    if (!password) {
      setLoginError('Please enter your member password.');
      return;
    }

    const res = loginAsMember(cleanIdentifier, password);
    if (res.success) {
      SecurityRateLimiter.reset('member_login');
      router.push('/dashboard');
    } else {
      const attemptStatus = SecurityRateLimiter.recordFailedAttempt('member_login', cleanIdentifier);
      if (attemptStatus.locked) {
        setMemberLockoutSeconds(attemptStatus.lockoutSeconds);
        setLoginError('Security Lockout: 5 failed attempts reached. Member login locked for 5 minutes.');
      } else {
        setLoginError(
          `${res.error || 'Invalid credentials.'} (Warning: ${attemptStatus.remainingAttempts} attempt(s) remaining)`
        );
      }
    }
  };

  // Sign Up Step 1 -> Step 2
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    const cleanFullName = sanitizeInput(fullName);
    const cleanPhone = sanitizeInput(phone);
    const cleanEmail = sanitizeInput(email);
    const cleanBusinessName = sanitizeInput(businessName);
    const cleanDesignation = sanitizeInput(designation);
    const cleanLocation = sanitizeInput(location);
    const cleanReferralCode = sanitizeInput(referralCode);
    const cleanInstagram = sanitizeInput(instagram);
    const cleanDescription = sanitizeInput(description);

    if (!cleanFullName || !cleanPhone || !cleanEmail || !cleanBusinessName) {
      setSignupError('Please fill in all required fields marked with *');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setSignupError('Please create a password of at least 6 characters for your member login.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSignupError('Passwords do not match. Please verify your confirmation password.');
      return;
    }

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
      avatarUrl: memberPhoto || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&fit=crop`,
      bio: cleanDescription || `${cleanDesignation} at ${cleanBusinessName}.`,
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
        description: cleanDescription || 'Regional enterprise member of Salem Entrepreneurs Club.',
        productsServices: ['Business Consultations', 'Product Supply'],
        location: cleanLocation,
        phone: cleanPhone,
        whatsapp: cleanPhone,
        email: cleanEmail,
        instagram: cleanInstagram || undefined,
        isPublic: true,
      },
      privacy: {
        phoneVisible: 'members_only',
        emailVisible: 'members_only',
      },
    };

    setCreatedMember(newMember);
    setSignupStep(2); // Proceed to Payment QR step
  };

  // Upload Payment Screenshot
  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setScreenshotPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Sign Up Step 2 -> Complete Application & Payment Submission
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdMember) return;

    const cleanUtr = sanitizeInput(upiRefId);
    if (!cleanUtr || !isValidUTR(cleanUtr)) {
      setSignupError('Please enter a valid 12-digit UPI / UTR Transaction Reference ID from your payment app.');
      return;
    }

    // Save newly created member
    SECStore.addMember(createdMember);

    // Save payment submission for Admin review
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
      screenshotUrl: screenshotPreview || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&fit=crop',
      status: 'under_review',
      submittedAt: new Date().toISOString(),
      referralCodeUsed: sanitizeInput(referralCode) || undefined,
      adminNotes: 'Submitted via Member Sign Up flow. Direct UPI / App payment verified.',
    });

    setSignupStep(3); // Confirmation
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(settings.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  // The active QR code:优先使用 Admin uploaded QR code, fallback to generated
  const activeQrCodeImage = settings.qrCodeUrl || generatedUpiQr;

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-[#0F172A] border border-amber-500/25 rounded-3xl p-6 sm:p-9 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="h-16 px-4 py-2 rounded-2xl bg-white flex items-center justify-center mx-auto shadow-xl border border-amber-400/40 w-fit">
            <img src={settings.logoUrl || '/images/sec-logo.png'} alt={settings.clubName || 'Salem Entrepreneurs Forum'} className="h-10 w-auto object-contain" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            {settings.clubName || 'Salem Entrepreneurs Forum'}
          </h1>
          <p className="text-xs text-amber-400 font-semibold tracking-wide">
            {settings.tagline || 'Meet. Learn. Collaborate. Grow.'}
          </p>
        </div>

        {/* Tab Switcher: Member Login vs New Member Sign Up */}
        <div className="flex rounded-2xl bg-slate-900/90 p-1.5 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setLoginError('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'login'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Member Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setSignupError('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'signup'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>New Member Sign Up</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: MEMBER LOGIN */}
        {/* ======================================================== */}
        {activeTab === 'login' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Sign In to Member Portal
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Access verified directory, conclaves, digital pass & referral wallet.
              </p>
            </div>

            {/* Brute-Force Rate Limit Lockout Banner */}
            {memberLockoutSeconds > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs text-amber-300 font-semibold flex items-center gap-2 animate-pulse">
                <Clock className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  Anti-Brute-Force Shield Active: Login locked for {Math.floor(memberLockoutSeconds / 60)}m {memberLockoutSeconds % 60}s.
                </span>
              </div>
            )}

            {loginError && memberLockoutSeconds === 0 && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Registered Email, Phone, or Member ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    disabled={memberLockoutSeconds > 0}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. founder@company.com or SEC-2026-101"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Member Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    disabled={memberLockoutSeconds > 0}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your member password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={memberLockoutSeconds > 0}
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition"
              >
                <span>{memberLockoutSeconds > 0 ? 'Security Lockout Active' : 'Sign In as Member'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-2 text-center space-y-2 text-xs">
              <p className="text-slate-400">
                Not a member yet?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className="text-amber-400 font-bold hover:underline"
                >
                  Sign Up Here
                </button>
              </p>
              <p>
                <Link
                  href="/admin/login"
                  className="text-slate-500 hover:text-slate-300 inline-flex items-center gap-1.5 transition text-[11px]"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400/80" /> Admin Portal Login
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: NEW MEMBER SIGN UP (WITH PAYMENT QR CODE) */}
        {/* ======================================================== */}
        {activeTab === 'signup' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Step Indicator */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    signupStep === 1
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-emerald-500 text-white'
                  }`}
                >
                  {signupStep > 1 ? '✓' : '1'}
                </span>
                <span className={signupStep === 1 ? 'font-bold text-white' : 'text-slate-400'}>
                  1. Member Details
                </span>
              </div>

              <div className="w-6 h-0.5 bg-slate-800" />

              <div className="flex items-center gap-2">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    signupStep === 2
                      ? 'bg-amber-400 text-slate-950'
                      : signupStep > 2
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {signupStep > 2 ? '✓' : '2'}
                </span>
                <span className={signupStep === 2 ? 'font-bold text-white' : 'text-slate-400'}>
                  2. Payment QR Code
                </span>
              </div>

              <div className="w-6 h-0.5 bg-slate-800" />

              <div className="flex items-center gap-2">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    signupStep === 3
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  3
                </span>
                <span className={signupStep === 3 ? 'font-bold text-emerald-400' : 'text-slate-400'}>
                  Confirmation
                </span>
              </div>
            </div>

            {signupError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{signupError}</span>
              </div>
            )}

            {/* STEP 1: MEMBER & BUSINESS DETAILS */}
            {signupStep === 1 && (
              <form onSubmit={handleProceedToPayment} className="space-y-4">
                {/* Member Profile Photo Upload */}
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border-2 border-amber-400/40 shrink-0 flex items-center justify-center group shadow-md">
                    {memberPhoto ? (
                      <img src={memberPhoto} alt="Profile Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <User className="w-7 h-7 text-slate-400" />
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center cursor-pointer transition text-white opacity-0 hover:opacity-100">
                      <Camera className="w-5 h-5" />
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-amber-400" /> Member Profile Photo (Optional)
                      </span>
                      {memberPhoto && (
                        <button
                          type="button"
                          onClick={() => setMemberPhoto('')}
                          className="text-[10px] text-red-400 hover:text-red-300 font-semibold underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Upload your professional headshot for your Digital Membership Card & VIP Directory.
                    </p>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-amber-300 cursor-pointer transition">
                      <Upload className="w-3 h-3 text-amber-400" />
                      <span>{memberPhoto ? 'Change Photo' : 'Upload Member Photo'}</span>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. S. Karthikeyan"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Phone Number (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98427 12345"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Business Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="founder@company.com"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Business / Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Salem Apex Mills Pvt Ltd"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Industry Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Designation / Role *
                    </label>
                    <input
                      type="text"
                      required
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="Managing Director / Founder"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Location in Salem / Kongu Region *
                    </label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Fairlands / Gugai / Steel Plant Road"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Sponsor / Referral Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      placeholder="e.g. SEC-SARAVANAN-001"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-400 uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1 flex items-center justify-between">
                    <span>Instagram Profile / Handle (Optional)</span>
                    <span className="text-[10px] text-pink-400 font-mono">@yourhandle</span>
                  </label>
                  <div className="relative">
                    <InstagramIcon className="w-4 h-4 text-pink-400 absolute left-3.5 top-2.5" />
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="@salementrepreneurs or profile URL"
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Short Business Summary / Products
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of your manufacturing products, exports or services..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                  />
                </div>

                {/* Account Security / Member Password Setup */}
                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>Create Your Member Login Password</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Create Password * (min 6 characters)
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type={showSignupPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          minLength={6}
                          className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                        >
                          {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type={showSignupPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          minLength={6}
                          className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    💡 You will use this password along with your Email or Member ID to log in after sign up.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-slate-300 flex items-center justify-between">
                  <span>Annual Membership Fee:</span>
                  <span className="font-mono font-black text-amber-400 text-sm">
                    ₹{settings.membershipFee.toLocaleString('en-IN')} / Year
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition"
                >
                  <span>Proceed to Payment QR Code (Step 2)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* STEP 2: OFFICIAL PAYMENT QR CODE (UPLOADED BY ADMIN) */}
            {signupStep === 2 && createdMember && (
              <form onSubmit={handlePaymentSubmit} className="space-y-5 animate-in fade-in duration-200">
                <div className="text-center space-y-1">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Scan & Pay Membership Fee
                  </h3>
                  <p className="text-xs text-slate-400">
                    Scan the official club QR code below using Google Pay, PhonePe, Paytm, or BHIM.
                  </p>
                </div>

                {/* The Payment QR Box */}
                <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 text-center space-y-3 shadow-inner">
                  <div className="text-xs font-semibold text-slate-300">
                    Transfer Amount: <span className="text-amber-400 font-black font-mono text-base">₹{settings.membershipFee.toLocaleString('en-IN')}</span>
                  </div>

                  {/* QR Image */}
                  <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-amber-400/50">
                    <img
                      src={activeQrCodeImage}
                      alt="Official SEC Payment QR Code"
                      className="w-52 h-52 object-contain"
                    />
                  </div>

                  {/* One-Click GPay / PhonePe / Paytm / Any UPI App Buttons */}
                  <UpiPaymentButtons
                    upiId={settings.upiId}
                    payeeName={settings.clubName}
                    amount={settings.membershipFee}
                    transactionNote="SEC Membership Fee"
                    memberId={createdMember.memberIdCode}
                  />

                  <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed pt-1">
                    {settings.paymentInstructions}
                  </p>
                </div>

                {/* UTR Input & Screenshot Proof */}
                <div className="space-y-3.5 pt-1">
                  <div>
                    <label className="text-xs font-bold text-amber-300 block mb-1">
                      12-Digit UTR / Transaction Reference ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={upiRefId}
                      onChange={(e) => setUpiRefId(e.target.value)}
                      placeholder="e.g. 423982019283"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-400 tracking-wider"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Found in your Google Pay, PhonePe, or banking app payment receipt.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Upload Payment Screenshot (Optional for Faster Verification)
                    </label>
                    <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-dashed border-slate-700 hover:border-amber-400 transition text-xs text-slate-300 font-medium">
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>{screenshotPreview ? 'Change Screenshot' : 'Attach Screenshot File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotUpload}
                        className="hidden"
                      />
                    </label>

                    {screenshotPreview && (
                      <div className="mt-2 p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                        <img
                          src={screenshotPreview}
                          alt="Screenshot Preview"
                          className="w-12 h-12 object-cover rounded-lg border border-slate-700"
                        />
                        <span className="text-[11px] text-emerald-400 font-semibold">
                          ✓ Screenshot attached successfully
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSignupStep(1)}
                    className="w-1/3 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1 border border-slate-700"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-1.5 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Application & Pay</span>
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: CONFIRMATION & REGISTRATION SUCCESS */}
            {signupStep === 3 && createdMember && (
              <div className="text-center space-y-5 animate-in zoom-in-95 duration-200 py-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-400/30">
                    Application Submitted
                  </span>
                  <h3 className="text-xl font-black text-white pt-2">
                    Welcome to Salem Entrepreneurs Club!
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Thank you, <strong className="text-white">{createdMember.fullName}</strong>. Your membership application and UPI payment proof have been sent to the Admin Board for verification.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-left space-y-2.5 max-w-sm mx-auto">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Assigned Member ID:</span>
                    <span className="font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">{createdMember.memberIdCode}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Registered Email / User ID:</span>
                    <span className="font-semibold text-white">{createdMember.email}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Member Password:</span>
                    <span className="font-mono font-semibold text-emerald-400">•••••••• (Saved)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Unique Referral Code:</span>
                    <span className="font-mono font-bold text-amber-400">{createdMember.referralCode}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Payment Status:</span>
                    <span className="font-semibold text-amber-400">Under Review</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/25 text-left text-xs text-amber-200/90 space-y-1 max-w-sm mx-auto">
                  <p className="font-bold flex items-center gap-1.5 text-amber-300">
                    <Lock className="w-3.5 h-3.5" /> Save Your Login Credentials:
                  </p>
                  <p className="text-[11px] text-slate-300">
                    You can log in anytime using either your <strong>Member ID ({createdMember.memberIdCode})</strong> or your <strong>Email ({createdMember.email})</strong> with the password you created.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setSignupStep(1);
                      setIdentifier(createdMember.email);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition"
                  >
                    Go to Member Login
                  </button>
                  <Link
                    href="/dashboard"
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold transition"
                  >
                    Preview Dashboard
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Global Admin Link */}
        <div className="pt-3 border-t border-slate-800/80 text-center">
          <Link
            href="/admin/login"
            className="text-slate-500 hover:text-slate-300 inline-flex items-center gap-1.5 transition text-[11px]"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400/80" /> Admin Portal Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MemberLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[75vh] flex items-center justify-center text-xs text-slate-400">Loading Member Portal...</div>}>
      <MemberAuthContent />
    </Suspense>
  );
}
