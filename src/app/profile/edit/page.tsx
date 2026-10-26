'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Save,
  ArrowLeft,
  CheckCircle2,
  Building,
  User,
  Shield,
  Plus,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { SECStore } from '@/lib/store';
import { Member } from '@/types';

export default function EditProfilePage() {
  const router = useRouter();
  const { currentUser, role } = useAuth();

  const [member, setMember] = useState<Member | null>(null);
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [bio, setBio] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [designation, setDesignation] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [products, setProducts] = useState<string[]>([]);
  const [newProduct, setNewProduct] = useState('');
  const [phonePrivacy, setPhonePrivacy] = useState<'public' | 'members_only' | 'admin_only'>('members_only');
  const [emailPrivacy, setEmailPrivacy] = useState<'public' | 'members_only' | 'admin_only'>('members_only');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (role === 'visitor') {
      router.replace('/login');
      return;
    }
    const current = currentUser || SECStore.getMembers()[0];
    if (current) {
      setMember(current);
      setFullName(current.fullName);
      setDateOfBirth(current.dateOfBirth || '');
      setAvatarUrl(current.avatarUrl);
      setCoverImageUrl(current.coverImageUrl || '');
      setBio(current.bio);
      setBusinessName(current.business.businessName);
      setDesignation(current.business.designation);
      setDescription(current.business.description);
      setLocation(current.business.location);
      setPhone(current.business.phone);
      setWhatsapp(current.business.whatsapp);
      setWebsite(current.business.website || '');
      setInstagram(current.business.instagram || '');
      setLinkedin(current.business.linkedin || '');
      setPosterUrl(current.business.posterUrl || '');
      setProducts(current.business.productsServices || []);
      setPhonePrivacy(current.privacy.phoneVisible);
      setEmailPrivacy(current.privacy.emailVisible);
    }
  }, [currentUser, role, router]);

  const handleAddProduct = () => {
    if (!newProduct.trim()) return;
    setProducts([...products, newProduct.trim()]);
    setNewProduct('');
  };

  const handleRemoveProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    const updatedData: Partial<Member> = {
      fullName,
      dateOfBirth: dateOfBirth || undefined,
      avatarUrl,
      coverImageUrl: coverImageUrl || undefined,
      bio,
      privacy: {
        phoneVisible: phonePrivacy,
        emailVisible: emailPrivacy,
      },
      business: {
        ...member.business,
        businessName,
        designation,
        description,
        location,
        phone,
        whatsapp,
        website: website || undefined,
        instagram: instagram || undefined,
        linkedin: linkedin || undefined,
        posterUrl: posterUrl || undefined,
        productsServices: products,
      },
    };

    SECStore.updateMember(member.id, updatedData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      router.push(`/members/${member.id}`);
    }, 1200);
  };

  if (!member) {
    return <div className="p-12 text-center text-slate-400">Loading profile editor...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/members/${member.id}`}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </Link>
        <span className="text-xs font-mono font-bold text-amber-400">{member.memberIdCode}</span>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-amber-500/25 shadow-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            Edit Member & Business Profile
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Update your public persona, business offerings, and contact privacy preferences.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Profile changes saved successfully! Returning to profile...
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <User className="w-4 h-4" /> Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Avatar Image URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Cover Image URL</label>
              <input
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Entrepreneur Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>
          </div>

          {/* Business Info */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Building className="w-4 h-4" /> Business Showcase
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Designation</label>
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Business Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Salem Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">WhatsApp</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Website URL</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Instagram</label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">LinkedIn</label>
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Products & Services Editor */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-slate-300 block">Products / Services List</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newProduct}
                  onChange={(e) => setNewProduct(e.target.value)}
                  placeholder="Add a product or capability..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-400 border border-slate-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {products.map((p, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
                  >
                    <span>{p}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(idx)}
                      className="text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Shield className="w-4 h-4" /> Privacy Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Phone Number Visibility
                </label>
                <select
                  value={phonePrivacy}
                  onChange={(e) => setPhonePrivacy(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="members_only">Members Only (Recommended)</option>
                  <option value="public">Public to All Visitors</option>
                  <option value="admin_only">Admin Only (Hidden from Directory)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Email Address Visibility
                </label>
                <select
                  value={emailPrivacy}
                  onChange={(e) => setEmailPrivacy(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="members_only">Members Only (Recommended)</option>
                  <option value="public">Public to All Visitors</option>
                  <option value="admin_only">Admin Only</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <Link
              href={`/members/${member.id}`}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center gap-2 transition"
            >
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
