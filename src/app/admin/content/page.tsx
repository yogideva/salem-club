'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Star,
  Image as ImageIcon,
  Quote,
  Sparkles,
} from 'lucide-react';
import { SECStore, subscribeToStore } from '@/lib/store';
import { AdminSettings, Testimonial, GalleryItem } from '@/types';

export default function AdminContentCMSPage() {
  const [settings, setSettings] = useState<AdminSettings>(SECStore.getSettings());
  const [testimonials, setTestimonials] = useState<Testimonial[]>(SECStore.getTestimonials());
  const [gallery, setGallery] = useState<GalleryItem[]>(SECStore.getGallery());

  // Form Fields for Copy
  const [tagline, setTagline] = useState('');
  const [aboutText, setAboutText] = useState('');
  const [missionText, setMissionText] = useState('');
  const [visionText, setVisionText] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  // Add Testimonial State
  const [newTestName, setNewTestName] = useState('');
  const [newTestBusiness, setNewTestBusiness] = useState('');
  const [newTestDesignation, setNewTestDesignation] = useState('');
  const [newTestPhoto, setNewTestPhoto] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&fit=crop');
  const [newTestContent, setNewTestContent] = useState('');
  const [newTestRating, setNewTestRating] = useState(5);

  // Add Gallery State
  const [newGalTitle, setNewGalTitle] = useState('');
  const [newGalCategory, setNewGalCategory] = useState<'Events' | 'Networking' | 'Celebrations' | 'Workshops' | 'Community'>('Networking');
  const [newGalUrl, setNewGalUrl] = useState('https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&fit=crop');

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      const s = SECStore.getSettings();
      setSettings(s);
      setTagline(s.tagline);
      setAboutText(s.aboutText);
      setMissionText(s.missionText);
      setVisionText(s.visionText);
      setContactAddress(s.contactAddress);
      setContactPhone(s.contactPhone);
      setContactEmail(s.contactEmail);
      setWhatsappNumber(s.whatsappNumber);
      setInstagramUrl(s.instagramUrl);
      setFacebookUrl(s.facebookUrl);
      setYoutubeUrl(s.youtubeUrl);
      setLinkedinUrl(s.linkedinUrl);
      setTestimonials(SECStore.getTestimonials());
      setGallery(SECStore.getGallery());
    };
    handleUpdate();
    const unsubscribe = subscribeToStore(handleUpdate);
    return () => unsubscribe();
  }, []);

  const handleSaveCMS = (e: React.FormEvent) => {
    e.preventDefault();
    SECStore.updateSettings({
      tagline,
      aboutText,
      missionText,
      visionText,
      contactAddress,
      contactPhone,
      contactEmail,
      whatsappNumber,
      instagramUrl,
      facebookUrl,
      youtubeUrl,
      linkedinUrl,
    }, 'Super Admin');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestName || !newTestContent) return;

    SECStore.addTestimonial({
      id: `t-${Date.now()}`,
      name: newTestName,
      business: newTestBusiness,
      designation: newTestDesignation,
      photoUrl: newTestPhoto,
      content: newTestContent,
      rating: newTestRating,
      isPublished: true,
    });

    setNewTestName('');
    setNewTestBusiness('');
    setNewTestDesignation('');
    setNewTestContent('');
  };

  const handleDeleteTestimonial = (id: string) => {
    SECStore.deleteTestimonial(id);
  };

  const handleAddGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalTitle || !newGalUrl) return;

    SECStore.addGalleryItem({
      id: `g-${Date.now()}`,
      title: newGalTitle,
      category: newGalCategory,
      imageUrl: newGalUrl,
      date: new Date().toISOString().split('T')[0],
    });

    setNewGalTitle('');
    setNewGalUrl('');
  };

  const handleDeleteGallery = (id: string) => {
    SECStore.deleteGalleryItem(id);
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5 space-y-1">
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">
          Website Content Management (CMS)
        </h1>
        <p className="text-xs text-slate-400">
          Dynamically modify the homepage copy, mission statement, vision, Secretariat contact, testimonials, and gallery.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Website content successfully updated across all public pages!
        </div>
      )}

      {/* Main CMS Form */}
      <form onSubmit={handleSaveCMS} className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Quote className="w-4 h-4" /> Core Brand Narrative & Statements
          </h2>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider shadow flex items-center gap-1.5 transition"
          >
            <Save className="w-3.5 h-3.5" /> Save Copy Changes
          </button>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Homepage Tagline Headline *
          </label>
          <input
            type="text"
            required
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            About Salem Entrepreneurs Club *
          </label>
          <textarea
            rows={4}
            required
            value={aboutText}
            onChange={(e) => setAboutText(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Official Mission Statement *
            </label>
            <textarea
              rows={3}
              required
              value={missionText}
              onChange={(e) => setMissionText(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 resize-none leading-relaxed font-serif italic"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Official Vision Statement *
            </label>
            <textarea
              rows={3}
              required
              value={visionText}
              onChange={(e) => setVisionText(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 resize-none leading-relaxed font-serif italic"
            />
          </div>
        </div>

        {/* Secretariat & Social links */}
        <div className="pt-4 space-y-4 border-t border-slate-800">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Secretariat Office & Regional Links
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Physical Address</label>
              <input
                type="text"
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Official Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Contact Phone</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">WhatsApp Hotline</label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Instagram URL</label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Testimonials Management Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-6">
        <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <Star className="w-4 h-4" /> Manage Founder Testimonials ({testimonials.length})
        </h2>

        {/* Add Testimonial Form */}
        <form onSubmit={handleAddTestimonial} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <span className="text-xs font-bold text-white uppercase block">Add New Endorsement</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              value={newTestName}
              onChange={(e) => setNewTestName(e.target.value)}
              placeholder="Founder Name (e.g. S. Karthikeyan)"
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
            />
            <input
              type="text"
              required
              value={newTestBusiness}
              onChange={(e) => setNewTestBusiness(e.target.value)}
              placeholder="Business Name"
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
            />
            <input
              type="text"
              required
              value={newTestDesignation}
              onChange={(e) => setNewTestDesignation(e.target.value)}
              placeholder="Designation (e.g. Managing Partner)"
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <textarea
            rows={2}
            required
            value={newTestContent}
            onChange={(e) => setNewTestContent(e.target.value)}
            placeholder="Endorsement quote text..."
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
          />

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Testimonial
          </button>
        </form>

        {/* Existing Testimonials List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3 text-xs"
            >
              <div>
                <span className="font-bold text-white block">{t.name}</span>
                <span className="text-[11px] text-amber-400">{t.designation} • {t.business}</span>
                <p className="text-slate-300 italic mt-1 leading-relaxed">&ldquo;{t.content}&rdquo;</p>
              </div>

              <button
                onClick={() => handleDeleteTestimonial(t.id)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Gallery Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-6">
        <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <ImageIcon className="w-4 h-4" /> Manage Event Gallery ({gallery.length})
        </h2>

        {/* Add photo form */}
        <form onSubmit={handleAddGalleryItem} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            required
            value={newGalTitle}
            onChange={(e) => setNewGalTitle(e.target.value)}
            placeholder="Event photo title..."
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 w-full sm:w-auto"
          />

          <select
            value={newGalCategory}
            onChange={(e) => setNewGalCategory(e.target.value as any)}
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 w-full sm:w-auto"
          >
            <option value="Events">Events</option>
            <option value="Networking">Networking</option>
            <option value="Celebrations">Celebrations</option>
            <option value="Workshops">Workshops</option>
            <option value="Community">Community</option>
          </select>

          <input
            type="url"
            required
            value={newGalUrl}
            onChange={(e) => setNewGalUrl(e.target.value)}
            placeholder="Image URL..."
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 w-full sm:w-auto"
          />

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase flex items-center gap-1.5 shrink-0 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Photo
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {gallery.map((g) => (
            <div
              key={g.id}
              className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-slate-800 group"
            >
              <img src={g.imageUrl} alt={g.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition p-2 flex flex-col justify-between">
                <span className="text-[10px] text-amber-300 font-bold">{g.category}</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">{g.title}</span>
                  <button
                    onClick={() => handleDeleteGallery(g.id)}
                    className="p-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
