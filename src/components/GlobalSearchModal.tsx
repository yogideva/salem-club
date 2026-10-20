'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, X, Users, Calendar, Briefcase, ChevronRight } from 'lucide-react';
import { SECStore } from '@/lib/store';
import { Member, SECEvent } from '@/types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [matchingMembers, setMatchingMembers] = useState<Member[]>([]);
  const [matchingEvents, setMatchingEvents] = useState<SECEvent[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle handled outside or here
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setMatchingMembers([]);
      setMatchingEvents([]);
      return;
    }

    const q = query.toLowerCase();

    const members = SECStore.getMembers().filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        m.business.businessName.toLowerCase().includes(q) ||
        m.business.category.toLowerCase().includes(q) ||
        m.business.description.toLowerCase().includes(q)
    );

    const events = SECStore.getEvents().filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q)
    );

    setMatchingMembers(members.slice(0, 6));
    setMatchingEvents(events.slice(0, 4));
  }, [query]);

  if (!isOpen) return null;

  const totalResults = matchingMembers.length + matchingEvents.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0F172A] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-[#0A101D]">
          <Search className="w-5 h-5 text-amber-400 mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members, businesses, events, posts, topics..."
            className="w-full bg-transparent text-white placeholder-slate-400 text-base focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400 hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Search Results Area */}
        <div className="max-h-[65vh] overflow-y-auto p-4 space-y-4">
          {!query && (
            <div className="text-center py-10 text-slate-400 text-sm">
              <p className="mb-2">Type a keyword to discover Salem entrepreneurs, events, and discussions.</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4 text-xs">
                {['Textile', 'Manufacturing', 'Sago & Food', 'IT Software', 'Conclave', 'Exports'].map(
                  (tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 hover:border-amber-500/50 hover:text-amber-300 transition"
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {query && totalResults === 0 && (
            <div className="text-center py-10 text-slate-400">
              <p className="text-sm">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-500 mt-1">Try another business keyword or category name.</p>
            </div>
          )}

          {/* Members Results */}
          {matchingMembers.length > 0 && (
            <div>
              <div className="flex items-center text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
                <Users className="w-3.5 h-3.5 mr-1.5" />
                Members & Businesses
              </div>
              <div className="space-y-1.5">
                {matchingMembers.map((m) => (
                  <Link
                    key={m.id}
                    href={`/members/${m.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition group"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={m.avatarUrl}
                        alt={m.fullName}
                        className="w-9 h-9 rounded-full object-cover border border-amber-500/30"
                      />
                      <div>
                        <div className="text-sm font-medium text-white group-hover:text-amber-300 transition">
                          {m.fullName}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5">
                          <span>{m.business.businessName}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-amber-400/90">{m.business.category}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Events Results */}
          {matchingEvents.length > 0 && (
            <div>
              <div className="flex items-center text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                Events
              </div>
              <div className="space-y-1.5">
                {matchingEvents.map((e) => (
                  <Link
                    key={e.id}
                    href={`/events/${e.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition group"
                  >
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-amber-300 transition">
                        {e.title}
                      </div>
                      <div className="text-xs text-slate-400">
                        {e.date} • {e.venue.split(',')[0]}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
