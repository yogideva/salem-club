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
  Building,
  Phone,
  Mail,
  MapPin,
  Globe,
  Plus,
  Edit2,
  Tag,
  BookOpen,
  Layers,
  X,
  Sparkles,
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
import { AdminSettings, AuditLog, BusinessCategory } from '@/types';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { sanitizeInput, sanitizeGitUrl, sanitizeGitBranch, sanitizeCommitMessage } from '@/lib/security';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>(SECStore.getSettings());
  const [categories, setCategories] = useState<BusinessCategory[]>(SECStore.getCategories());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(SECStore.getAuditLogs());

  // Section 1: Club Branding & Identity
  const [clubName, setClubName] = useState(settings.clubName || 'Salem Entrepreneurs Club');
  const [tagline, setTagline] = useState(settings.tagline || 'Where Entrepreneurs Connect, Collaborate, Have Fun & Grow Together.');
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');

  // Section 2: Pricing & Referral Royalty Program
  const [membershipFee, setMembershipFee] = useState(settings.membershipFee || 5000);
  const [membershipDuration, setMembershipDuration] = useState(settings.membershipDurationMonths || 12);
  const [referralPercentage, setReferralPercentage] = useState(settings.referralPercentage || 10);

  // Section 3: Payment Accounts & QR Setup
  const [upiId, setUpiId] = useState(settings.upiId || 'salementrepreneurs@okaxis');
  const [gpayNumber, setGpayNumber] = useState(settings.gpayNumber || '+91 98427 88990');
  const [paymentInstructions, setPaymentInstructions] = useState(settings.paymentInstructions || '');
  const [customQrUrl, setCustomQrUrl] = useState(settings.qrCodeUrl || '');

  // Section 4: Contact & Secretariat Information
  const [contactPhone, setContactPhone] = useState(settings.contactPhone || '+91 98427 88990');
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber || '+91 98427 88990');
  const [contactEmail, setContactEmail] = useState(settings.contactEmail || 'connect@salementrepreneursclub.com');
  const [contactAddress, setContactAddress] = useState(
    settings.contactAddress || '4th Floor, Apex Business Center, Fairlands Main Road, Salem - 636016, Tamil Nadu'
  );

  // Section 5: Official Social Media Handles
  const [instagramUrl, setInstagramUrl] = useState(settings.instagramUrl || 'https://instagram.com/salementrepreneursclub');
  const [linkedinUrl, setLinkedinUrl] = useState(settings.linkedinUrl || 'https://linkedin.com/company/salem-entrepreneurs-club');
  const [youtubeUrl, setYoutubeUrl] = useState(settings.youtubeUrl || 'https://youtube.com/@salementrepreneurs');
  const [facebookUrl, setFacebookUrl] = useState(settings.facebookUrl || 'https://facebook.com/salementrepreneursclub');

  // Section 6: About, Mission & Policy Text
  const [aboutText, setAboutText] = useState(settings.aboutText || '');
  const [missionText, setMissionText] = useState(settings.missionText || '');
  const [visionText, setVisionText] = useState(settings.visionText || '');
  const [termsText, setTermsText] = useState(settings.termsText || '');
  const [privacyText, setPrivacyText] = useState(settings.privacyText || '');

  // Section 7: Gamification Fields
  const [referralPoints, setReferralPoints] = useState(settings.gamification?.referralPoints ?? 50);
  const [attendancePoints, setAttendancePoints] = useState(settings.gamification?.eventAttendancePoints ?? 10);
  const [connectionPoints, setConnectionPoints] = useState(settings.gamification?.connectionPoints ?? 5);

  // Section 8: Reminders
  const [sevenDays, setSevenDays] = useState(settings.reminders?.sevenDays ?? true);
  const [oneDay, setOneDay] = useState(settings.reminders?.oneDay ?? true);
  const [twoHours, setTwoHours] = useState(settings.reminders?.twoHours ?? true);

  // Category Manager State
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [categorySuccess, setCategorySuccess] = useState('');

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

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [generatedQr, setGeneratedQr] = useState('');

  // Active Tab for Quick Navigation
  const [activeSection, setActiveSection] = useState<'all' | 'branding' | 'pricing' | 'contact' | 'social' | 'policies' | 'categories' | 'security'>('all');

  useEffect(() => {
    const handleUpdate = () => {
      const s = SECStore.getSettings();
      setSettings(s);
      setClubName(s.clubName || 'Salem Entrepreneurs Club');
      setTagline(s.tagline || '');
      setLogoUrl(s.logoUrl || '');
      setMembershipFee(s.membershipFee);
      setMembershipDuration(s.membershipDurationMonths);
      setReferralPercentage(s.referralPercentage);
      setUpiId(s.upiId);
      setGpayNumber(s.gpayNumber);
      setPaymentInstructions(s.paymentInstructions);
      setCustomQrUrl(s.qrCodeUrl || '');
      setContactPhone(s.contactPhone);
      setWhatsappNumber(s.whatsappNumber);
      setContactEmail(s.contactEmail);
      setContactAddress(s.contactAddress);
      setInstagramUrl(s.instagramUrl);
      setLinkedinUrl(s.linkedinUrl);
      setYoutubeUrl(s.youtubeUrl);
      setFacebookUrl(s.facebookUrl);
      setAboutText(s.aboutText);
      setMissionText(s.missionText);
      setVisionText(s.visionText);
      setTermsText(s.termsText);
      setPrivacyText(s.privacyText);
      setReferralPoints(s.gamification?.referralPoints ?? 50);
      setAttendancePoints(s.gamification?.eventAttendancePoints ?? 10);
      setConnectionPoints(s.gamification?.connectionPoints ?? 5);
      setSevenDays(s.reminders?.sevenDays ?? true);
      setOneDay(s.reminders?.oneDay ?? true);
      setTwoHours(s.reminders?.twoHours ?? true);
      setCategories(SECStore.getCategories());
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
      const savedRepo = localStorage.getItem('sec_github_repo_url') || 'https://github.com/yogideva/salem-club.git';
      if (savedRepo) setGithubRepoUrl(savedRepo);
    }
  }, []);

  // Live QR Code preview
  useEffect(() => {
    const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(clubName)}&am=${membershipFee}&cu=INR`;
    QRCode.toDataURL(upiString, { width: 140, margin: 1, color: { dark: '#070B14', light: '#FFFFFF' } })
      .then((url) => setGeneratedQr(url))
      .catch((err) => console.error(err));
  }, [upiId, membershipFee, clubName]);

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

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setLogoUrl(reader.result);
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
    const updatedSettingsPayload: Partial<AdminSettings> = {
      clubName: sanitizeInput(clubName),
      tagline: sanitizeInput(tagline),
      logoUrl: logoUrl.trim(),
      membershipFee: Number(membershipFee) || 5000,
      membershipDurationMonths: Number(membershipDuration) || 12,
      referralPercentage: Number(referralPercentage) || 10,
      upiId: sanitizeInput(upiId),
      gpayNumber: sanitizeInput(gpayNumber),
      qrCodeUrl: customQrUrl.trim(),
      paymentInstructions: sanitizeInput(paymentInstructions),
      contactPhone: sanitizeInput(contactPhone),
      whatsappNumber: sanitizeInput(whatsappNumber),
      contactEmail: sanitizeInput(contactEmail),
      contactAddress: sanitizeInput(contactAddress),
      instagramUrl: sanitizeInput(instagramUrl),
      linkedinUrl: sanitizeInput(linkedinUrl),
      youtubeUrl: sanitizeInput(youtubeUrl),
      facebookUrl: sanitizeInput(facebookUrl),
      aboutText: sanitizeInput(aboutText),
      missionText: sanitizeInput(missionText),
      visionText: sanitizeInput(visionText),
      termsText: sanitizeInput(termsText),
      privacyText: sanitizeInput(privacyText),
      gamification: {
        referralPoints: Number(referralPoints),
        eventAttendancePoints: Number(attendancePoints),
        postPoints: 2,
        connectionPoints: Number(connectionPoints),
      },
      reminders: {
        sevenDays,
        oneDay,
        twoHours,
      },
    };

    SECStore.updateSettings(updatedSettingsPayload, 'Super Admin');

    // Persist to server API to ensure immediate cross-device sync for mobile & desktop
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettingsPayload),
      });
    } catch (apiErr) {
      console.warn('API sync notification:', apiErr);
    }

    // Sync with Supabase PostgreSQL if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('admin_settings')
          .update({
            club_name: clubName.trim(),
            tagline: tagline.trim(),
            logo_url: logoUrl.trim(),
            membership_fee: Number(membershipFee),
            membership_duration_months: Number(membershipDuration),
            referral_percentage: Number(referralPercentage),
            upi_id: upiId.trim(),
            gpay_number: gpayNumber.trim(),
            qr_code_url: customQrUrl.trim(),
            payment_instructions: paymentInstructions.trim(),
            contact_phone: contactPhone.trim(),
            whatsapp_number: whatsappNumber.trim(),
            contact_email: contactEmail.trim(),
            contact_address: contactAddress.trim(),
            instagram_url: instagramUrl.trim(),
            linkedin_url: linkedinUrl.trim(),
            youtube_url: youtubeUrl.trim(),
            facebook_url: facebookUrl.trim(),
            about_text: aboutText.trim(),
            mission_text: missionText.trim(),
            vision_text: visionText.trim(),
            terms_text: termsText.trim(),
            privacy_text: privacyText.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', 'global');
      } catch (err) {
        console.error('Failed to sync settings with Supabase:', err);
      }
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  // Add Category Handler
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newId = newCatName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newCat: BusinessCategory = {
      id: newId,
      name: newCatName.trim(),
      description: newCatDesc.trim() || `${newCatName.trim()} enterprises and services`,
    };

    SECStore.addCategory(newCat);
    setNewCatName('');
    setNewCatDesc('');
    setCategorySuccess(`Added "${newCat.name}" to Industry Categories!`);
    setTimeout(() => setCategorySuccess(''), 3500);
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (confirm(`Remove "${name}" from available categories?`)) {
      SECStore.deleteCategory(id);
    }
  };

  // Save Admin Credentials
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

  // Push to GitHub
  const handleGitHubPush = async (e: React.FormEvent) => {
    e.preventDefault();
    const urlCheck = sanitizeGitUrl(githubRepoUrl);
    if (!urlCheck.valid) {
      alert(urlCheck.error || 'Please enter a valid GitHub repository URL.');
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('sec_github_repo_url', urlCheck.sanitized);
    }
    setGithubPushing(true);
    setGithubResult(null);

    try {
      const res = await fetch('/api/github-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remoteUrl: urlCheck.sanitized,
          commitMessage: sanitizeCommitMessage(githubCommitMsg) || 'Update Salem Entrepreneurs Club platform',
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

  const handleWipeAllData = () => {
    if (confirm('Are you sure you want to wipe all test members, payments, and registrations? This starts the application with a clean slate.')) {
      SECStore.clearAllData('Super Admin');
      alert('All test data has been wiped clean! The platform is now completely fresh.');
    }
  };

  const calculatedCommissionExample = Math.round((membershipFee * referralPercentage) / 100);

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
              <Settings className="w-7 h-7 text-amber-400" /> Master Club Customization & Settings
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Edit all default information across the platform: branding, fees, contact numbers, UPI QR codes, categories, policies, and passwords.
            </p>
          </div>

          <button
            onClick={handleSaveSettings}
            className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center gap-2 transition self-start sm:self-auto shrink-0"
          >
            <Save className="w-4 h-4" /> Save All Changes
          </button>
        </div>

        {/* Section Navigation Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-3">
          {[
            { id: 'all', label: 'All Settings' },
            { id: 'branding', label: '1. Branding & Name' },
            { id: 'pricing', label: '2. Fees & QR Code' },
            { id: 'contact', label: '3. Contact & Address' },
            { id: 'social', label: '4. Social Links' },
            { id: 'categories', label: '5. Industry Categories' },
            { id: 'policies', label: '6. About & Policies' },
            { id: 'security', label: '7. Password & Security' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                activeSection === tab.id
                  ? 'bg-amber-400 text-slate-950 font-bold shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-300 flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>All club settings, membership fee (₹{Number(membershipFee).toLocaleString('en-IN')}), contact info, and policies successfully saved and synced across mobile and desktop devices!</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-8">

        {/* ======================================================== */}
        {/* 1. CLUB BRANDING & HERO TITLE */}
        {/* ======================================================== */}
        {(activeSection === 'all' || activeSection === 'branding') && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Building className="w-4 h-4" /> 1. Club Identity, Name & Hero Headline
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">Platform Branding</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Official Club Name *
                </label>
                <input
                  type="text"
                  required
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  placeholder="Salem Entrepreneurs Club"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Appears in header, homepage title, footer, and member receipts.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Club Logo URL / Upload Logo
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="/images/sec-logo.png or https://..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <label className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs cursor-pointer border border-slate-700 shrink-0 flex items-center gap-1.5 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleLogoFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Hero Tagline / Subtitle *
                </label>
                <input
                  type="text"
                  required
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Where Entrepreneurs Connect, Collaborate, Have Fun & Grow Together."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Prominently displayed beneath the hero headline on the home page.
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase flex items-center gap-1.5 transition shadow"
              >
                <Save className="w-3.5 h-3.5" /> Save Branding & Club Name
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. MEMBERSHIP PRICING, ROYALTIES & UPI QR CODE */}
        {/* ======================================================== */}
        {(activeSection === 'all' || activeSection === 'pricing') && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-amber-500/30 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> 2. Membership Pricing, Referral Royalties & Payment Accounts
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">Financial Engine</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Annual Membership Fee (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={membershipFee}
                  onChange={(e) => setMembershipFee(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Displayed on sign-up & dynamic UPI generation.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Validity Period (Months) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={membershipDuration}
                  onChange={(e) => setMembershipDuration(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Referral Royalty Percentage (%) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={100}
                  value={referralPercentage}
                  onChange={(e) => setReferralPercentage(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
                <p className="text-[11px] text-amber-400 mt-1">
                  Referrer earns ₹{calculatedCommissionExample.toLocaleString('en-IN')} per closed invite.
                </p>
              </div>
            </div>

            {/* UPI & GPay Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-800/80">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Official Club UPI ID *
                </label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="salementrepreneurs@okaxis"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  GPay / PhonePe Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  value={gpayNumber}
                  onChange={(e) => setGpayNumber(e.target.value)}
                  placeholder="+91 98427 88990"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Custom Payment QR Code Upload */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-400" /> Payment QR Code Configuration
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Upload your official GPay / PhonePe / Paytm / Bank QR code. It will reflect on Member Sign-Up and Paid Events.
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    customQrUrl
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {customQrUrl ? '✓ Custom Uploaded QR Active' : 'Auto-Generated Dynamic QR'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="space-y-3 md:col-span-2 text-xs">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1.5">
                      Upload QR Code Image (PNG / JPG):
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold cursor-pointer text-xs flex items-center gap-2 transition shadow">
                        <Upload className="w-4 h-4" />
                        <span>Choose QR Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleQrFileUpload}
                          className="hidden"
                        />
                      </label>

                      {customQrUrl && (
                        <button
                          type="button"
                          onClick={handleResetToGeneratedQr}
                          className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1.5 transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset to Generated</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1.5">
                      Or Paste Image URL:
                    </label>
                    <input
                      type="url"
                      value={customQrUrl}
                      onChange={(e) => setCustomQrUrl(e.target.value)}
                      placeholder="https://example.com/my-club-qr.png"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                {/* QR Code Live Preview */}
                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <div className="w-32 h-32 bg-white rounded-xl p-1.5 shadow-md flex items-center justify-center overflow-hidden">
                    <img
                      src={customQrUrl || generatedQr}
                      alt="Active QR Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 font-mono">
                    {customQrUrl ? 'Live Custom QR' : `₹${membershipFee} Dynamic UPI`}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Instructions Box */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Payment Guidance Note (Shown on Sign-Up & Event RSVP)
              </label>
              <textarea
                rows={2}
                value={paymentInstructions}
                onChange={(e) => setPaymentInstructions(e.target.value)}
                placeholder="Scan the QR code or send payment to the official UPI ID. Copy the 12-digit UTR and upload your screenshot proof."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase flex items-center gap-1.5 transition shadow"
              >
                <Save className="w-3.5 h-3.5" /> Save Pricing & Payment Setup
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. OFFICIAL SECRETARIAT, CONTACT & ADDRESS */}
        {/* ======================================================== */}
        {(activeSection === 'all' || activeSection === 'contact') && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4" /> 3. Official Secretariat, Office Address & Helplines
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">Contact Info</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400" /> Official Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 98427 88990"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                  <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400" /> Official WhatsApp Helpline *
                </label>
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+91 98427 88990"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" /> Secretariat Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="connect@salementrepreneursclub.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-amber-400" /> Physical Chapter Office / Postal Address *
                </label>
                <textarea
                  rows={2}
                  required
                  value={contactAddress}
                  onChange={(e) => setContactAddress(e.target.value)}
                  placeholder="4th Floor, Apex Business Center, Fairlands Main Road, Salem - 636016, Tamil Nadu"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase flex items-center gap-1.5 transition shadow"
              >
                <Save className="w-3.5 h-3.5" /> Save Secretariat & Contact Info
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. OFFICIAL SOCIAL MEDIA CHANNELS */}
        {/* ======================================================== */}
        {(activeSection === 'all' || activeSection === 'social') && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4" /> 4. Official Club Social Media Channels
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">Footer & Member Profiles</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                  <InstagramIcon className="w-4 h-4 text-pink-400" /> Official Instagram Profile Link
                </label>
                <input
                  type="text"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/salementrepreneursclub"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                  <LinkedinIcon className="w-4 h-4 text-blue-400" /> LinkedIn Company Page Link
                </label>
                <input
                  type="text"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/company/salem-entrepreneurs-club"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                  <YoutubeIcon className="w-4 h-4 text-red-400" /> YouTube Channel Link
                </label>
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/@salementrepreneurs"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                  <FacebookIcon className="w-4 h-4 text-blue-500" /> Facebook Page Link
                </label>
                <input
                  type="text"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/salementrepreneursclub"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase flex items-center gap-1.5 transition shadow"
              >
                <Save className="w-3.5 h-3.5" /> Save Social Media Channels
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 5. INDUSTRY CATEGORIES MANAGER */}
        {/* ======================================================== */}
        {(activeSection === 'all' || activeSection === 'categories') && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4" /> 5. Industry Categories Manager ({categories.length})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Add, edit, or remove business industries available in the Member Sign-Up dropdown and directory filters.
                </p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Live Sync</span>
            </div>

            {categorySuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {categorySuccess}
              </div>
            )}

            {/* Add New Category Box */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-amber-400" /> Add New Industry Category
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Category Name (e.g. Solar Energy)"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="sm:col-span-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="Short description (e.g. Solar rooftop panels, EV chargers, green power)"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase shrink-0 transition"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Categories List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-2 group hover:border-slate-700 transition"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">{cat.name}</span>
                    <span className="text-[11px] text-slate-400 block line-clamp-1">{cat.description}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="p-1 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition shrink-0"
                    title={`Delete ${cat.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase flex items-center gap-1.5 transition shadow"
              >
                <Save className="w-3.5 h-3.5" /> Save Categories Roster
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 6. ABOUT, MISSION, VISION & POLICIES (CMS) */}
        {/* ======================================================== */}
        {(activeSection === 'all' || activeSection === 'policies') && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> 6. About, Mission, Vision & Legal Policies
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">Homepage & Legal Text</span>
            </div>

            <div className="space-y-5 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  About the Club (Homepage Overview)
                </label>
                <textarea
                  rows={3}
                  value={aboutText}
                  onChange={(e) => setAboutText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Mission Statement
                  </label>
                  <textarea
                    rows={2}
                    value={missionText}
                    onChange={(e) => setMissionText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Vision Statement
                  </label>
                  <textarea
                    rows={2}
                    value={visionText}
                    onChange={(e) => setVisionText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Terms & Conditions / Code of Conduct
                  </label>
                  <textarea
                    rows={2}
                    value={termsText}
                    onChange={(e) => setTermsText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Privacy Policy
                  </label>
                  <textarea
                    rows={2}
                    value={privacyText}
                    onChange={(e) => setPrivacyText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase flex items-center gap-1.5 transition shadow"
              >
                <Save className="w-3.5 h-3.5" /> Save Policies & About Content
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 7. GAMIFICATION & REMINDER SCHEDULES */}
        {/* ======================================================== */}
        {(activeSection === 'all') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gamification Points */}
            <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4" /> Gamification & Activity Points
              </h2>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Referral</label>
                  <input
                    type="number"
                    value={referralPoints}
                    onChange={(e) => setReferralPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Attendance</label>
                  <input
                    type="number"
                    value={attendancePoints}
                    onChange={(e) => setAttendancePoints(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Connection</label>
                  <input
                    type="number"
                    value={connectionPoints}
                    onChange={(e) => setConnectionPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Notification Reminders */}
            <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-4 h-4" /> Automated Event Reminders
              </h2>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sevenDays}
                    onChange={(e) => setSevenDays(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-400"
                  />
                  <span className="font-semibold text-white">7 Days</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={oneDay}
                    onChange={(e) => setOneDay(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-400"
                  />
                  <span className="font-semibold text-white">1 Day</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={twoHours}
                    onChange={(e) => setTwoHours(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-400"
                  />
                  <span className="font-semibold text-white">2 Hours</span>
                </label>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase flex items-center gap-1.5 transition shadow"
              >
                <Save className="w-3.5 h-3.5" /> Save Gamification & Reminders
              </button>
            </div>
          </div>
        )}

        {/* Master Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-8 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" /> Save Master Settings
          </button>
        </div>
      </form>

      {/* ======================================================== */}
      {/* 8. ADMIN LOGIN CREDENTIALS & SECURITY */}
      {/* ======================================================== */}
      {(activeSection === 'all' || activeSection === 'security') && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-amber-500/30 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> 7. Admin Login Credentials & Password
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
      )}

      {/* ======================================================== */}
      {/* 9. ONE-CLICK GITHUB PUSH */}
      {/* ======================================================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-blue-500/30 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <GitBranch className="w-4 h-4" /> 8. One-Click GitHub Sync & Push
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
                placeholder="https://github.com/yogideva/salem-club.git"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-400 font-mono"
              />
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

      {/* ======================================================== */}
      {/* 10. DANGER ZONE: RESET DATA */}
      {/* ======================================================== */}
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

      {/* ======================================================== */}
      {/* 11. AUDIT LOGS */}
      {/* ======================================================== */}
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
