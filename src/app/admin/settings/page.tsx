'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Settings,
  Save,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Award,
  Bell,
  History,
  FileText,
  AlertCircle,
  HelpCircle,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Trash2,
  Key,
  User,
  Lock,
  GitBranch,
  Terminal,
  Loader2,
  Send,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { SECStore, subscribeToStore } from '@/lib/store';
import { AdminSettings, AuditLog } from '@/types';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>(SECStore.getSettings());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(SECStore.getAuditLogs());

  // Form Fields
  const [membershipFee, setMembershipFee] = useState(settings.membershipFee);
  const [membershipDuration, setMembershipDuration] = useState(settings.membershipDurationMonths);
  const [referralPercentage, setReferralPercentage] = useState(settings.referralPercentage);
  const [upiId, setUpiId] = useState(settings.upiId);
  const [gpayNumber, setGpayNumber] = useState(settings.gpayNumber);
  const [paymentInstructions, setPaymentInstructions] = useState(settings.paymentInstructions);
  const [customQrUrl, setCustomQrUrl] = useState(settings.qrCodeUrl || '');

  // Gamification Fields
  const [referralPoints, setReferralPoints] = useState(settings.gamification.referralPoints);
  const [attendancePoints, setAttendancePoints] = useState(settings.gamification.eventAttendancePoints);
  const [postPoints, setPostPoints] = useState(settings.gamification.postPoints);
  const [connectionPoints, setConnectionPoints] = useState(settings.gamification.connectionPoints);

  // Reminders
  const [sevenDays, setSevenDays] = useState(settings.reminders.sevenDays);
  const [oneDay, setOneDay] = useState(settings.reminders.oneDay);
  const [twoHours, setTwoHours] = useState(settings.reminders.twoHours);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [generatedQr, setGeneratedQr] = useState('');

  // Admin Credentials Management
  const { updateAdminCredentials } = useAuth();
  const [adminUsername, setAdminUsername] = useState('admin@salementrepreneursclub.com');
  const [adminPassword, setAdminPassword] = useState('Admin@SEC2026');
  const [confirmPassword, setConfirmPassword] = useState('Admin@SEC2026');
  const [adminCredSuccess, setAdminCredSuccess] = useState(false);
  const [adminCredError, setAdminCredError] = useState('');

  // 1-Click GitHub Push
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const [githubCommitMsg, setGithubCommitMsg] = useState('Update Salem Entrepreneurs Club platform');
  const [githubPushing, setGithubPushing] = useState(false);
  const [githubResult, setGithubResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    hint?: string;
    logs: string[];
  } | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      const s = SECStore.getSettings();
      setSettings(s);
      setMembershipFee(s.membershipFee);
      setMembershipDuration(s.membershipDurationMonths);
      setReferralPercentage(s.referralPercentage);
      setUpiId(s.upiId);
      setGpayNumber(s.gpayNumber);
      setPaymentInstructions(s.paymentInstructions);
      setCustomQrUrl(s.qrCodeUrl || '');
      setReferralPoints(s.gamification.referralPoints);
      setAttendancePoints(s.gamification.eventAttendancePoints);
      setPostPoints(s.gamification.postPoints);
      setConnectionPoints(s.gamification.connectionPoints);
      setSevenDays(s.reminders.sevenDays);
      setOneDay(s.reminders.oneDay);
      setTwoHours(s.reminders.twoHours);
      setAuditLogs(SECStore.getAuditLogs());
    };
    const unsubscribe = subscribeToStore(handleUpdate);
    return () => unsubscribe();
  }, []);

  // Initialize admin credentials and saved repo URL
  useEffect(() => {
    const creds = SECStore.getAdminCredentials();
    setAdminUsername(creds.username);
    setAdminPassword(creds.password);
    setConfirmPassword(creds.password);

    if (typeof window !== 'undefined') {
      const savedRepo = localStorage.getItem('sec_github_repo_url') || '';
      if (savedRepo) setGithubRepoUrl(savedRepo);
    }
  }, []);

  const handleSaveAdminCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminCredError('');
    if (!adminUsername.trim()) {
      setAdminCredError('Admin Username/Email cannot be empty.');
      return;
    }
    if (!adminPassword || adminPassword.length < 6) {
      setAdminCredError('Password must be at least 6 characters.');
      return;
    }
    if (adminPassword !== confirmPassword) {
      setAdminCredError('Passwords do not match. Please verify your confirmation.');
      return;
    }
    updateAdminCredentials({
      username: adminUsername.trim(),
      password: adminPassword,
    });
    setAdminCredSuccess(true);
    setTimeout(() => setAdminCredSuccess(false), 4000);
  };

  const handleGitHubPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubRepoUrl.trim()) {
      alert('Please enter your GitHub repository URL (e.g. https://github.com/username/salem-entrepreneurs-club.git)');
      return;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('sec_github_repo_url', githubRepoUrl.trim());
    }
    setGithubPushing(true);
    setGithubResult(null);

    try {
      const res = await fetch('/api/github-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remoteUrl: githubRepoUrl.trim(),
          commitMessage: githubCommitMsg.trim() || 'Update Salem Entrepreneurs Club',
        }),
      });
      const data = await res.json();
      setGithubResult(data);
    } catch (err: any) {
      setGithubResult({
        success: false,
        error: err.message || 'Failed to connect to Git push server',
        logs: [err.message || 'Network error'],
      });
    } finally {
      setGithubPushing(false);
    }
  };

  // Live QR Code preview
  useEffect(() => {
    const upiString = `upi://pay?pa=${upiId}&pn=Salem%20Entrepreneurs%20Club&am=${membershipFee}&cu=INR`;
    QRCode.toDataURL(upiString, { width: 140, margin: 1, color: { dark: '#070B14', light: '#FFFFFF' } })
      .then((url) => setGeneratedQr(url))
      .catch((err) => console.error(err));
  }, [upiId, membershipFee]);

  const handleQrFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please upload a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCustomQrUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetToGeneratedQr = () => {
    setCustomQrUrl('');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    SECStore.updateSettings({
      membershipFee: Number(membershipFee),
      membershipDurationMonths: Number(membershipDuration),
      referralPercentage: Number(referralPercentage),
      upiId: upiId.trim(),
      gpayNumber: gpayNumber.trim(),
      qrCodeUrl: customQrUrl.trim(),
      paymentInstructions: paymentInstructions.trim(),
      gamification: {
        referralPoints: Number(referralPoints),
        eventAttendancePoints: Number(attendancePoints),
        postPoints: Number(postPoints),
        connectionPoints: Number(connectionPoints),
      },
      reminders: {
        sevenDays,
        oneDay,
        twoHours,
      },
    }, 'Super Admin');

    // Also update Supabase database if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('admin_settings')
          .update({
            membership_fee: Number(membershipFee),
            membership_duration_months: Number(membershipDuration),
            referral_percentage: Number(referralPercentage),
            upi_id: upiId.trim(),
            gpay_number: gpayNumber.trim(),
            qr_code_url: customQrUrl.trim(),
            payment_instructions: paymentInstructions.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', 'global');
      } catch (err) {
        console.error('Failed to sync settings with Supabase:', err);
      }
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleWipeAllData = () => {
    if (confirm('Are you sure you want to wipe all test members, payments, and registrations? This starts the application with a clean slate.')) {
      SECStore.clearAllData('Super Admin');
      alert('All test data has been wiped clean! The platform is now completely fresh.');
    }
  };

  const calculatedCommissionExample = Math.round((membershipFee * referralPercentage) / 100);

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5 space-y-1">
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">
          Admin Settings & Audit Log
        </h1>
        <p className="text-xs text-slate-400">
          Configure financial rules, UPI payment accounts, automated reminder triggers, and review executive audit history.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Club settings successfully saved and applied system-wide!
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* Section: Pricing & Referral Program (Requirement: Not Hardcoded) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-amber-500/30 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Membership Pricing & Referral Royalty Rules
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Dynamic Calculation Engine</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Annual Membership Fee (₹) *
              </label>
              <input
                type="number"
                required
                value={membershipFee}
                onChange={(e) => setMembershipFee(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-black font-mono text-amber-400 focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Editable base fee charged to new applicants.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Referral Commission Percentage (%) *
              </label>
              <input
                type="number"
                required
                value={referralPercentage}
                onChange={(e) => setReferralPercentage(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-black font-mono text-amber-400 focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Percentage paid to referring members.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Membership Duration (Months) *
              </label>
              <input
                type="number"
                required
                value={membershipDuration}
                onChange={(e) => setMembershipDuration(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Typically 12 months (1 year).
              </span>
            </div>
          </div>

          {/* Dynamic Calculation Indicator */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
            <span className="text-slate-300">
              Live Formula Preview: Membership Fee (₹{membershipFee.toLocaleString('en-IN')}) × Referral Rate ({referralPercentage}%) =
            </span>
            <span className="font-mono font-black text-amber-400 text-base">
              ₹{calculatedCommissionExample.toLocaleString('en-IN')} Per Referral
            </span>
          </div>
        </div>

        {/* Section: UPI / GPay Payment Gateways & Upload QR Code */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-amber-500/30 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Official Payment QR Code & UPI Gateways
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload your official UPI/GPay QR code image here. It immediately updates live in the Member Sign Up & Payment flow.
              </p>
            </div>
            {customQrUrl ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Custom Uploaded QR Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-bold">
                Auto-Generated UPI QR
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Official Business UPI ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Google Pay / PhonePe Mobile *
                  </label>
                  <input
                    type="text"
                    required
                    value={gpayNumber}
                    onChange={(e) => setGpayNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              {/* QR Upload Feature */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-amber-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-amber-400" /> Upload Official QR Code Image
                  </span>
                  {customQrUrl && (
                    <button
                      type="button"
                      onClick={handleResetToGeneratedQr}
                      className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset to Generated QR
                    </button>
                  )}
                </label>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Upload your shop / bank GPay, PhonePe, Paytm, or BharatPe QR code photo from your device. Member sign-up screens will immediately display this uploaded QR code.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                  <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-dashed border-slate-600 hover:border-amber-400 transition text-xs font-bold text-slate-200">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>Choose QR Image File (PNG, JPG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="pt-1">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Or Enter Hosted QR Code Image URL:
                  </label>
                  <input
                    type="url"
                    value={customQrUrl}
                    onChange={(e) => setCustomQrUrl(e.target.value)}
                    placeholder="https://your-domain.com/my-gpay-qr.png"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Payment Instructions for Members
                </label>
                <textarea
                  rows={2}
                  value={paymentInstructions}
                  onChange={(e) => setPaymentInstructions(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>
            </div>

            {/* Live QR Display Box */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                Live Payment QR on Sign Up Page
              </span>

              <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-amber-400/40 max-w-[220px]">
                <img
                  src={customQrUrl || generatedQr}
                  alt="Official Salem Entrepreneurs Club Payment QR"
                  className="w-48 h-48 object-contain"
                />
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold text-white">
                  {customQrUrl ? 'Official Uploaded QR Code' : 'Auto-Generated Dynamic QR'}
                </div>
                <div className="text-[11px] font-mono text-amber-400 font-semibold">
                  Amount: ₹{membershipFee.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  UPI ID: {upiId}
                </div>
              </div>

              <div className="text-[10px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
                💡 Members will scan this exact QR code during registration to transfer the ₹{membershipFee.toLocaleString('en-IN')} annual fee.
              </div>
            </div>
          </div>
        </div>

        {/* Section: Gamification Points Config */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4" /> Gamification Point Values
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Control the leaderboard points awarded to members for community engagement.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Referral Activation
              </label>
              <input
                type="number"
                value={referralPoints}
                onChange={(e) => setReferralPoints(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-amber-400 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">Default: 50 pts</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Conclave Attendance
              </label>
              <input
                type="number"
                value={attendancePoints}
                onChange={(e) => setAttendancePoints(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-emerald-400 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">Default: 10 pts</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Accepted Connection
              </label>
              <input
                type="number"
                value={connectionPoints}
                onChange={(e) => setConnectionPoints(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-blue-400 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">Default: 5 pts</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Community Post
              </label>
              <input
                type="number"
                value={postPoints}
                onChange={(e) => setPostPoints(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-purple-400 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">Default: 2 pts</span>
            </div>
          </div>
        </div>

        {/* Section: Automated Conclave Notifications */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4" /> Event Reminders & Dispatch Rules
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enable or disable automated notification reminders dispatched to registered delegates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={sevenDays}
                onChange={(e) => setSevenDays(e.target.checked)}
                className="w-4 h-4 rounded text-amber-400 focus:ring-amber-400"
              />
              <div>
                <span className="font-bold text-white block">7 Days Before</span>
                <span className="text-slate-400 text-[11px]">Primary conclave reminder</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={oneDay}
                onChange={(e) => setOneDay(e.target.checked)}
                className="w-4 h-4 rounded text-amber-400 focus:ring-amber-400"
              />
              <div>
                <span className="font-bold text-white block">1 Day Before</span>
                <span className="text-slate-400 text-[11px]">Venue & dress code advisory</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={twoHours}
                onChange={(e) => setTwoHours(e.target.checked)}
                className="w-4 h-4 rounded text-amber-400 focus:ring-amber-400"
              />
              <div>
                <span className="font-bold text-white block">2 Hours Before</span>
                <span className="text-slate-400 text-[11px]">Gate check-in pass reminder</span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" /> Save Master Settings
          </button>
        </div>
      </form>

      {/* Section: Admin Login Credentials (User Request) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-amber-500/30 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Admin Login Credentials & Password
            </h2>
            <p className="text-xs text-slate-400">
              Change the Super Admin username / email and login password. These credentials secure the /admin management console.
            </p>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
            Live Security
          </span>
        </div>

        {adminCredSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Admin login credentials updated successfully! Use these new credentials for future logins.
          </div>
        )}

        {adminCredError && (
          <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-xs font-bold text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {adminCredError}
          </div>
        )}

        <form onSubmit={handleSaveAdminCredentials} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Admin Username / Email *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="admin@salementrepreneursclub.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                New Admin Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500 font-mono">
              Default: admin@salementrepreneursclub.com | Min length: 6 characters
            </span>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-lg shadow-amber-500/20"
            >
              <Key className="w-4 h-4" /> Update Admin Credentials
            </button>
          </div>
        </form>
      </div>

      {/* Section: One-Click GitHub Push (User Request) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-blue-500/30 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <GitBranch className="w-4 h-4" /> One-Click GitHub Sync & Push
            </h2>
            <p className="text-xs text-slate-400">
              Commit and push your entire codebase, latest changes, and new features to GitHub with a single click.
            </p>
          </div>
          <span className="text-[10px] text-blue-400 font-mono bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
            Automated Git Sync
          </span>
        </div>

        <form onSubmit={handleGitHubPush} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                GitHub Repository URL *
              </label>
              <input
                type="text"
                required
                value={githubRepoUrl}
                onChange={(e) => setGithubRepoUrl(e.target.value)}
                placeholder="https://github.com/your-username/salem-entrepreneurs-club.git"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-400 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Supports HTTPS clone URLs or Token URLs (<code className="text-slate-400">https://TOKEN@github.com/...</code> for private repos).
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Commit Message
              </label>
              <input
                type="text"
                value={githubCommitMsg}
                onChange={(e) => setGithubCommitMsg(e.target.value)}
                placeholder="Update Salem Entrepreneurs Club platform"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-400"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                A Windows batch tool <code className="text-slate-400">push-to-github.bat</code> is also generated in the project root.
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span>Auto-stages files, creates commit, and pushes to <code className="text-amber-400 font-mono">main</code> branch</span>
            </div>

            <button
              type="submit"
              disabled={githubPushing}
              className={`px-7 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg ${
                githubPushing
                  ? 'bg-blue-600/50 text-white cursor-wait'
                  : 'bg-blue-500 hover:bg-blue-400 text-slate-950 shadow-blue-500/25'
              }`}
            >
              {githubPushing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Pushing to GitHub...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Push to GitHub in 1 Click</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Push Output Log */}
        {githubResult && (
          <div
            className={`p-4 rounded-2xl border text-xs space-y-2 ${
              githubResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {githubResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{githubResult.message || githubResult.error}</span>
            </div>

            {githubResult.hint && (
              <p className="text-[11px] text-amber-300 font-semibold pl-6">
                💡 Tip: {githubResult.hint}
              </p>
            )}

            {githubResult.logs?.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400 max-h-40 overflow-y-auto space-y-1 mt-2">
                {githubResult.logs.map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Danger Zone: Clear Application Data */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-red-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Reset Application Data & Start Fresh
            </h2>
            <p className="text-xs text-slate-400">
              Permanently wipe all demo/test members, payments, conclave registrations, and referrals to start with a 100% clean slate.
            </p>
          </div>

          <button
            type="button"
            onClick={handleWipeAllData}
            className="px-5 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" /> Wipe All Test Data Clean
          </button>
        </div>
      </div>

      {/* Section: Audit Logs (Requirement 42) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              System Audit Log (Security & Administrative History)
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">{auditLogs.length} events logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A101D] text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Admin</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Object Type</th>
                <th className="py-3 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/60 transition">
                  <td className="py-3 px-3 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="py-3 px-3 font-bold text-amber-300">{log.adminName}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-white border border-slate-800 font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{log.objectType}</td>
                  <td className="py-3 px-3 text-slate-300 font-sans">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
