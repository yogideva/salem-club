'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  Clock,
  Check,
  X,
  UserPlus,
  MessageSquare,
  Building,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { SECStore, subscribeToStore } from '@/lib/store';
import { Connection, Member } from '@/types';

export default function ConnectionsPage() {
  const { currentUser, role } = useAuth();
  const [connections, setConnections] = useState<Connection[]>(SECStore.getConnections());
  const [members, setMembers] = useState<Member[]>(SECStore.getMembers());
  const [tab, setTab] = useState<'my_connections' | 'received' | 'sent' | 'suggestions'>('my_connections');

  useEffect(() => {
    const handleUpdate = () => {
      setConnections(SECStore.getConnections());
      setMembers(SECStore.getMembers());
    };
    const unsubscribe = subscribeToStore(handleUpdate);
    return () => unsubscribe();
  }, []);

  const currentMemberId = currentUser?.id || 'm1';

  // My accepted connections
  const myAcceptedConnections = connections.filter(
    (c) =>
      c.status === 'accepted' &&
      (c.requesterId === currentMemberId || c.receiverId === currentMemberId)
  );

  // Received pending requests
  const receivedRequests = connections.filter(
    (c) => c.status === 'pending' && c.receiverId === currentMemberId
  );

  // Sent pending requests
  const sentRequests = connections.filter(
    (c) => c.status === 'pending' && c.requesterId === currentMemberId
  );

  // Suggested members not yet connected
  const connectedPartnerIds = new Set(
    connections
      .filter((c) => c.requesterId === currentMemberId || c.receiverId === currentMemberId)
      .map((c) => (c.requesterId === currentMemberId ? c.receiverId : c.requesterId))
  );

  const suggestedMembers = members.filter(
    (m) => m.id !== currentMemberId && !connectedPartnerIds.has(m.id) && m.status === 'active'
  );

  const handleRespond = (connId: string, status: 'accepted' | 'rejected') => {
    SECStore.respondConnection(connId, status);
  };

  const handleSendRequest = (targetId: string) => {
    SECStore.sendConnectionRequest(currentMemberId, targetId);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
          LinkedIn-Style Private Network
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">
          My Professional Connections
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Build high-trust 1-on-1 relationships with peer industrialists and decision-makers in Salem.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setTab('my_connections')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            tab === 'my_connections'
              ? 'bg-amber-400 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>My Network ({myAcceptedConnections.length})</span>
        </button>

        <button
          onClick={() => setTab('received')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            tab === 'received'
              ? 'bg-amber-400 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Received Requests ({receivedRequests.length})</span>
          {receivedRequests.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>

        <button
          onClick={() => setTab('sent')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            tab === 'sent'
              ? 'bg-amber-400 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <span>Sent Requests ({sentRequests.length})</span>
        </button>

        <button
          onClick={() => setTab('suggestions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            tab === 'suggestions'
              ? 'bg-amber-400 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Discover Leaders ({suggestedMembers.length})</span>
        </button>
      </div>

      {/* Tab 1: My Accepted Connections */}
      {tab === 'my_connections' && (
        <div className="space-y-4">
          {myAcceptedConnections.length === 0 ? (
            <div className="py-16 text-center bg-[#0F172A] rounded-3xl border border-slate-800">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No active connections yet</h3>
              <p className="text-xs text-slate-400 mt-1">
                Explore the directory and connect with fellow entrepreneurs.
              </p>
              <button
                onClick={() => setTab('suggestions')}
                className="mt-4 px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Discover Members →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myAcceptedConnections.map((c) => {
                const partnerId = c.requesterId === currentMemberId ? c.receiverId : c.requesterId;
                const partner = members.find((m) => m.id === partnerId);
                if (!partner) return null;

                return (
                  <div
                    key={c.id}
                    className="p-5 rounded-3xl bg-[#0F172A] border border-slate-800 hover:border-amber-400/40 shadow-xl transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src={partner.avatarUrl}
                          alt={partner.fullName}
                          className="w-14 h-14 rounded-2xl object-cover border border-amber-400 shadow"
                        />
                        <div>
                          <Link
                            href={`/members/${partner.id}`}
                            className="text-sm font-bold text-white hover:text-amber-400 transition"
                          >
                            {partner.fullName}
                          </Link>
                          <p className="text-xs text-amber-400">{partner.business.designation}</p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {partner.business.businessName}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs text-slate-300 my-2">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-700">
                          {partner.business.category}
                        </span>
                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {partner.business.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                      <Link
                        href={`/members/${partner.id}`}
                        className="text-amber-400 font-semibold hover:underline"
                      >
                        Profile →
                      </Link>
                      <Link
                        href="/chat"
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                        <span>Chat</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Received Requests */}
      {tab === 'received' && (
        <div className="space-y-4">
          {receivedRequests.length === 0 ? (
            <div className="py-16 text-center bg-[#0F172A] rounded-3xl border border-slate-800 text-xs text-slate-400">
              No pending connection requests.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {receivedRequests.map((c) => {
                const requester = members.find((m) => m.id === c.requesterId);
                if (!requester) return null;

                return (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl bg-[#0F172A] border border-amber-500/30 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={requester.avatarUrl}
                        alt={requester.fullName}
                        className="w-12 h-12 rounded-xl object-cover border border-amber-400"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white">{requester.fullName}</h4>
                        <p className="text-xs text-amber-400 font-medium">
                          {requester.business.designation}
                        </p>
                        <p className="text-[11px] text-slate-400">{requester.business.businessName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRespond(c.id, 'accepted')}
                        className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1 shadow"
                      >
                        <Check className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button
                        onClick={() => handleRespond(c.id, 'rejected')}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                        title="Ignore"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Sent Requests */}
      {tab === 'sent' && (
        <div className="space-y-4">
          {sentRequests.length === 0 ? (
            <div className="py-16 text-center bg-[#0F172A] rounded-3xl border border-slate-800 text-xs text-slate-400">
              You have no pending outgoing connection requests.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sentRequests.map((c) => {
                const receiver = members.find((m) => m.id === c.receiverId);
                if (!receiver) return null;

                return (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={receiver.avatarUrl}
                        alt={receiver.fullName}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white">{receiver.fullName}</h4>
                        <p className="text-[11px] text-amber-400 font-medium">
                          {receiver.business.businessName}
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Awaiting Response
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Suggestions */}
      {tab === 'suggestions' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestedMembers.map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-3xl bg-[#0F172A] border border-slate-800 hover:border-amber-400/40 shadow-xl transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={m.avatarUrl}
                    alt={m.fullName}
                    className="w-12 h-12 rounded-2xl object-cover border border-amber-400"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{m.fullName}</h4>
                    <p className="text-xs text-amber-400">{m.business.designation}</p>
                    <p className="text-[11px] text-slate-400">{m.business.businessName}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                  {m.business.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <Link href={`/members/${m.id}`} className="text-xs text-amber-400 hover:underline">
                  View Profile
                </Link>
                <button
                  onClick={() => handleSendRequest(m.id)}
                  className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1 shadow"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
