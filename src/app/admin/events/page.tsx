'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Plus,
  Users,
  Download,
  Check,
  X,
  Eye,
  EyeOff,
  Trash2,
  MapPin,
  Clock,
  QrCode,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { SECStore, subscribeToStore } from '@/lib/store';
import { SECEvent, EventRegistration } from '@/types';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<SECEvent[]>(SECStore.getEvents());
  const [registrations, setRegistrations] = useState<EventRegistration[]>(SECStore.getRegistrations());
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [scanSimulatorInput, setScanSimulatorInput] = useState('');
  const [scanMessage, setScanMessage] = useState('');

  // Create Event Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Networking');
  const [date, setDate] = useState('2026-12-20');
  const [startTime, setStartTime] = useState('06:30 PM');
  const [endTime, setEndTime] = useState('09:30 PM');
  const [venue, setVenue] = useState('Radisson Salem, Bangalore Highway, Mamangam, Salem');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('https://maps.google.com/?q=Radisson+Salem');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1511578314322-379afb476865?w=1000&fit=crop');
  const [maxParticipants, setMaxParticipants] = useState(100);
  const [registrationFee, setRegistrationFee] = useState(0);
  const [dressCode, setDressCode] = useState('Business Casuals');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setEvents(SECStore.getEvents());
      setRegistrations(SECStore.getRegistrations());
    };
    const unsubscribe = subscribeToStore(handleUpdate);
    return () => unsubscribe();
  }, []);

  const currentEvent = events.find((e) => e.id === selectedEventId) || events[0];
  const currentEventRegistrations = registrations.filter((r) => r.eventId === currentEvent?.id);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newEvt: SECEvent = {
      id: `evt-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      date,
      startTime,
      endTime,
      venue,
      googleMapsUrl,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1000&fit=crop',
      category,
      maxParticipants: Number(maxParticipants),
      registrationFee: Number(registrationFee),
      dressCode,
      agenda: [
        { time: `${startTime} - 07:15 PM`, activity: 'Networking High-Tea & Welcome' },
        { time: '07:15 PM - 08:30 PM', activity: 'Executive Roundtable & Introductions' },
        { time: '08:30 PM - Close', activity: 'Buffet Dinner & Peer Conversations' },
      ],
      speakers: [],
      sponsors: ['SEC Salem Chapter'],
      isPublished: true,
      registeredCount: 0,
    };

    SECStore.addEvent(newEvt, 'Super Admin');
    setShowCreateModal(false);
    setSelectedEventId(newEvt.id);
    setTitle('');
    setDescription('');
  };

  const handleTogglePublish = (evt: SECEvent) => {
    SECStore.updateEvent(evt.id, { isPublished: !evt.isPublished }, 'Super Admin');
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm('Permanently delete this event and its registrations?')) {
      SECStore.deleteEvent(id, 'Super Admin');
    }
  };

  const handleToggleAttendance = (registrationId: string, currentStatus: 'present' | 'absent') => {
    const nextStatus = currentStatus === 'present' ? 'absent' : 'present';
    SECStore.toggleAttendance(registrationId, nextStatus, 'Super Admin');
  };

  // QR Attendance check-in simulator: checks in attendee by Member ID Code
  const handleSimulateScan = (e: React.FormEvent) => {
    e.preventDefault();
    const query = scanSimulatorInput.trim().toUpperCase();
    if (!query) return;

    const match = currentEventRegistrations.find(
      (r) =>
        r.memberIdCode.toUpperCase() === query ||
        r.memberName.toUpperCase().includes(query) ||
        r.phone.includes(query)
    );

    if (match) {
      if (match.attendanceStatus === 'present') {
        setScanMessage(`⚠️ ${match.memberName} is ALREADY marked present! (Duplicate attendance prevented)`);
      } else {
        SECStore.toggleAttendance(match.id, 'present', 'Super Admin');
        setScanMessage(`✓ Success! Marked attendance PRESENT for ${match.memberName} (+10 points awarded)`);
      }
    } else {
      setScanMessage(`❌ No registration found for "${query}" in this event.`);
    }

    setScanSimulatorInput('');
    setTimeout(() => setScanMessage(''), 5000);
  };

  const handleExportParticipants = () => {
    if (!currentEvent) return;
    const rows = currentEventRegistrations.map((r) => ({
      EventTitle: currentEvent.title,
      EventDate: currentEvent.date,
      MemberCode: r.memberIdCode,
      Name: r.memberName,
      Business: r.businessName,
      Phone: r.phone,
      Email: r.email,
      RSVP: r.status,
      Attendance: r.attendanceStatus,
      RegistrationDate: r.registrationDate,
    }));
    SECStore.exportToCSV(`Event_Attendees_${currentEvent.id}`, rows);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            Events & Attendance Operations
          </h1>
          <p className="text-xs text-slate-400">
            Publish conclaves, manage participant rosters, scan QR codes, and log attendance.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider shadow flex items-center gap-1.5 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create New Event
        </button>
      </div>

      {/* Event Selector Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {events.map((evt) => (
          <button
            key={evt.id}
            onClick={() => setSelectedEventId(evt.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
              selectedEventId === evt.id
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-[#0F172A] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>{evt.title}</span>
            <span
              className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                evt.isPublished ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
              }`}
            >
              {evt.isPublished ? 'Live' : 'Draft'}
            </span>
          </button>
        ))}
      </div>

      {currentEvent && (
        <div className="space-y-6">
          {/* Current Event Quick Controls Card */}
          <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 uppercase">
                  {currentEvent.category}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  {currentEvent.date} • {currentEvent.startTime}
                </span>
              </div>
              <h2 className="text-lg font-black text-white">{currentEvent.title}</h2>
              <p className="text-xs text-slate-400">{currentEvent.venue}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleTogglePublish(currentEvent)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  currentEvent.isPublished
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                }`}
              >
                {currentEvent.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{currentEvent.isPublished ? 'Unpublish' : 'Publish Event'}</span>
              </button>

              <button
                onClick={handleExportParticipants}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-400 border border-slate-700 flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Attendees CSV</span>
              </button>

              <button
                onClick={() => handleDeleteEvent(currentEvent.id)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                title="Delete event"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* QR Code / Member ID Attendance Check-in Simulator */}
          <div className="p-6 rounded-3xl bg-[#0F172A] border border-amber-500/30 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <QrCode className="w-4 h-4" /> Event Gate Attendance Scanner (Scan QR or Enter Member ID)
              </h3>
              <span className="text-[10px] text-slate-500">Duplicate Check-in Guard Active</span>
            </div>

            {scanMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  scanMessage.includes('Success')
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    : scanMessage.includes('ALREADY')
                    ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                    : 'bg-red-500/15 border border-red-500/30 text-red-300'
                }`}
              >
                {scanMessage}
              </div>
            )}

            <form onSubmit={handleSimulateScan} className="flex items-center gap-2">
              <input
                type="text"
                value={scanSimulatorInput}
                onChange={(e) => setScanSimulatorInput(e.target.value)}
                placeholder="Scan / Type Member Code (e.g. SEC-2024-001) or Member Name..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow"
              >
                Mark Check-In
              </button>
            </form>
          </div>

          {/* Attendees Table */}
          <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Registered Attendees Roster ({currentEventRegistrations.length})
              </h3>
              <span className="text-xs text-emerald-400 font-semibold font-mono">
                Present: {currentEventRegistrations.filter((r) => r.attendanceStatus === 'present').length} / {currentEventRegistrations.length}
              </span>
            </div>

            {currentEventRegistrations.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No member registrations recorded for this event yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0A101D] text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-3">Member ID</th>
                      <th className="py-3 px-3">Attendee Name</th>
                      <th className="py-3 px-3">Business</th>
                      <th className="py-3 px-3">Phone</th>
                      <th className="py-3 px-3">RSVP Status</th>
                      <th className="py-3 px-3">Payment</th>
                      <th className="py-3 px-3 text-right">Attendance Check-In</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {currentEventRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-900/60 transition">
                        <td className="py-3 px-3 font-mono font-bold text-amber-300">{reg.memberIdCode}</td>
                        <td className="py-3 px-3 font-bold text-white">{reg.memberName}</td>
                        <td className="py-3 px-3 text-slate-300">{reg.businessName}</td>
                        <td className="py-3 px-3 text-slate-400 font-mono">{reg.phone}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-900 text-slate-300 border border-slate-700">
                            {reg.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {reg.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleToggleAttendance(reg.id, reg.attendanceStatus)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ml-auto ${
                              reg.attendanceStatus === 'present'
                                ? 'bg-emerald-500 text-slate-950 shadow'
                                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{reg.attendanceStatus === 'present' ? 'PRESENT' : 'Mark Present'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-[#0F172A] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" /> Create New Conclave / Event
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Salem MSME Founders Breakfast Conclave"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Networking">Networking</option>
                    <option value="Business Meetup">Business Meetup</option>
                    <option value="Masterclass">Masterclass</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Outdoor Activity">Outdoor Activity</option>
                    <option value="Party">Party</option>
                    <option value="Entrepreneur Talk">Entrepreneur Talk</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Start Time</label>
                  <input
                    type="text"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="06:30 PM"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">End Time</label>
                  <input
                    type="text"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="10:00 PM"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Venue Details *</label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Radisson Salem Grand Ballroom"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Max Participants</label>
                  <input
                    type="number"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Fee (0 = Free)</label>
                  <input
                    type="number"
                    value={registrationFee}
                    onChange={(e) => setRegistrationFee(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Dress Code</label>
                  <input
                    type="text"
                    value={dressCode}
                    onChange={(e) => setDressCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline the conclave focus, networking objectives, and key takeaways..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Event to Member Calendar</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
