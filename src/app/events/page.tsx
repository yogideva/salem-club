'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  Sparkles,
  ChevronRight,
  Ticket,
} from 'lucide-react';
import { SECStore, subscribeToStore } from '@/lib/store';
import { useAuth } from '@/lib/authContext';
import { SECEvent } from '@/types';
import MemberAccessGate from '@/components/MemberAccessGate';

export default function EventsListingPage() {
  const { currentUser, role } = useAuth();
  const [events, setEvents] = useState<SECEvent[]>(SECStore.getEvents());
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setEvents(SECStore.getEvents());
    };
    const unsubscribe = subscribeToStore(handleUpdate);
    return () => unsubscribe();
  }, []);

  const categories = ['All', 'Networking', 'Masterclass', 'Outdoor Activity', 'Dinner', 'Business Meetup'];

  if (!currentUser) {
    return (
      <MemberAccessGate
        title="Club Events & Conclaves"
        description="Exclusive closed-door business conclaves, masterclasses, and networking dinners are reserved exclusively for registered club members. Please sign up or log in to view events."
        featureName="Club Events"
      />
    );
  }

  const filteredEvents = events.filter((e) => {
    if (!e.isPublished) return false;
    if (filterCategory !== 'All' && e.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            Regional Conclaves & Gatherings
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            SEC Events Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Exclusive business conclaves, masterclasses, and executive retreats for Salem leaders.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by title, keyword, or venue..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filterCategory === cat
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="py-20 text-center bg-[#0F172A] rounded-3xl border border-slate-800">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No upcoming events found</h3>
          <p className="text-xs text-slate-400 mt-1">Check back soon for new conclave schedules.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="group rounded-3xl bg-[#0F172A] border border-slate-800 hover:border-amber-400/40 shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                {/* Event Image */}
                <div className="aspect-[16/9] w-full relative overflow-hidden bg-slate-900">
                  <img
                    src={evt.imageUrl}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-amber-500/30">
                    {evt.category}
                  </div>
                  {evt.registrationFee === 0 ? (
                    <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-[10px] font-extrabold shadow">
                      Members Free
                    </div>
                  ) : (
                    <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-extrabold shadow">
                      ₹{evt.registrationFee}
                    </div>
                  )}
                </div>

                {/* Event Info */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-amber-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {evt.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {evt.startTime}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-white group-hover:text-amber-400 transition leading-snug line-clamp-2">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="pt-2 flex items-center gap-1.5 text-xs text-slate-300">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">{evt.venue}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                    <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>
                      {evt.registeredCount} of {evt.maxParticipants} Attendees Registered
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="p-6 pt-0 mt-2">
                <Link
                  href={`/events/${evt.id}`}
                  className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-amber-500/20"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Connect / Register</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
