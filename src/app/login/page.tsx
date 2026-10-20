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
} from 'lucide-react';
import { InstagramIcon } from '@/components/SocialIcons';
import { useAuth } from '@/lib/authContext';
import { SECStore, subscribeToStore } from '@/lib/store';
import { AdminSettings, BusinessCategory, Member } from '@/types';

function MemberAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginAsMember, switchMember } = useAuth();

  // Active Tab: 'login' | 'signup'
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login';
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);

  // Settings & Categories from Store
  const [settings, setSettings] = useState<AdminSettings>(SECStore.getSettings());
  const [categories, setCategories] = useState<BusinessCategory[]>(SECStore.getCategories());

  // Login Form State
  const [identifier, setIdentifier] = useState('saravanan@kongutech.com');
  const [password, setPassword] = useState('password123');
  const [loginError, setLoginError] = useState('');

  // Sign Up Form State — Step 1 = Details, 2 = Payment QR, 3 = Confirmation
  const [signupStep, setSignupStep] = useState<1 | 2 | 3>(1);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'IT & Software');
  const [designation, setDesignation] = useState('Founder & Managing Director');
  const [location, setLocation] = useState('Fairlands, Salem');
  const [referralCode, setReferralCode] = useState('');
  const [instagram, setInstagram] = useState('');
  const [description, setDescription] = useState('');

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
    const success = loginAsMember(identifier);
    if (success) {
      router.push('/dashboard');
    } else {
      setLoginError('Member profile not found. Please check your email/phone or register as a new member.');
    }
  };

  const handleQuickDemoLogin = (memberId: string) => {
    switchMember(memberId);
    router.push('/dashboard');
  };

  // Sign Up Step 1 -> Step 2
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (!fullName.trim() || !phone.trim() || !email.trim() || !businessName.trim()) {
      setSignupError('Please fill in all required fields marked with *');
      return;
    }

    const newMemberId = `m-${Date.now()}`;
    const codeNumber = Math.floor(100 + Math.random() * 900);
    const cleanFirstName = fullName.trim().split(' ')[0].toUpperCase();
    const uniqueReferral = `SEC-${cleanFirstName}-${codeNumber}`;
    const uniqueMemberId = `SEC-2026-${codeNumber}`;

    const newMember: Member = {
      id: newMemberId,
      userId: `u-${Date.now()}`,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      whatsapp: phone.trim(),
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&fit=crop`,
      bio: description.trim() || `${designation} at ${businessName}.`,
      role: 'member',
      status: 'payment_pending',
      joinedDate: new Date().toISOString().split('T')[0],
      membershipExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      memberIdCode: uniqueMemberId,
      referralCode: uniqueReferral,
      referredBy: referralCode.trim() || undefined,
      badges: ['ACTIVE MEMBER'],
      gamificationPoints: 10,
      business: {
        id: `b-${Date.now()}`,
        memberId: newMemberId,
        businessName: businessName.trim(),
        category,
        designation,
        description: description.trim() || 'Regional enterprise member of Salem Entrepreneurs Club.',
        productsServices: ['Business Consultations', 'Product Supply'],
        location: location.trim(),
        phone: phone.trim(),
        whatsapp: phone.trim(),
        email: email.trim(),
        instagram: instagram.trim() || undefined,
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

    if (!upiRefId.trim()) {
      setSignupError('Please enter the 12-digit UPI / UTR Transaction Reference ID from your payment app.');
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
      upiTransactionId: upiRefId.trim(),
      screenshotUrl: screenshotPreview || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&fit=crop',
      status: 'under_review',
      submittedAt: new Date().toISOString(),
      referralCodeUsed: referralCode.trim() || undefined,
      adminNotes: 'Submitted via Member Sign Up flow. Awaiting admin bank account verification.',
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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center mx-auto text-slate-950 font-black text-lg shadow-lg shadow-amber-500/20">
            SEC
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Salem Entrepreneurs Club
          </h1>
          <p className="text-xs text-amber-400 font-semibold tracking-wide">
            Connect • Collaborate • Grow
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

            {loginError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Registered Email / Phone / Referral Code
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="saravanan@kongutech.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
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
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition"
              >
                <span>Sign In as Member</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Logins for Instant Testing */}
            <div className="pt-2 border-t border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
                One-Click Demo Profiles:
              </p>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('m1')}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-xs text-slate-300 flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-semibold text-white">Saravanan Muthusamy</span>
                    <span className="text-slate-500 text-[10px]">• IT Software MD</span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-bold">Login →</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('m2')}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-xs text-slate-300 flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="font-semibold text-white">Dr. Priya Senthilkumar</span>
                    <span className="text-slate-500 text-[10px]">• Food/Sago Export</span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-bold">Login →</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('m3')}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-xs text-slate-300 flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span className="font-semibold text-white">Rajesh K. Palanisamy</span>
                    <span className="text-slate-500 text-[10px]">• Steel & Foundry</span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-bold">Login →</span>
                </button>
              </div>
            </div>

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

                  {/* UPI Details & Copy Button */}
                  <div className="w-full max-w-sm space-y-2 pt-1">
                    <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      <span className="text-slate-400 font-medium">UPI ID:</span>
                      <span className="font-mono text-amber-400 font-bold">{settings.upiId}</span>
                      <button
                        type="button"
                        onClick={copyUpiId}
                        className="p-1 rounded text-slate-400 hover:text-white transition"
                        title="Copy UPI ID"
                      >
                        {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      <span className="text-slate-400 font-medium">GPay / Mobile:</span>
                      <span className="font-mono text-white font-bold">{settings.gpayNumber}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
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

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-left space-y-2 max-w-sm mx-auto">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Temporary Member ID:</span>
                    <span className="font-mono font-bold text-white">{createdMember.memberIdCode}</span>
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
