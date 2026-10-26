'use client';

import {
  Member,
  BusinessCategory,
  SECEvent,
  EventRegistration,
  PaymentSubmission,
  Referral,
  CommunityPost,
  ForumThread,
  Connection,
  ChatMessage,
  NotificationItem,
  Testimonial,
  GalleryItem,
  AdminSettings,
  AuditLog,
} from '@/types';
import {
  INITIAL_CATEGORIES,
  INITIAL_SETTINGS,
  INITIAL_MEMBERS,
  INITIAL_EVENTS,
  INITIAL_REGISTRATIONS,
  INITIAL_PAYMENTS,
  INITIAL_REFERRALS,
  INITIAL_POSTS,
  INITIAL_FORUM_THREADS,
  INITIAL_CONNECTIONS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_TESTIMONIALS,
  INITIAL_GALLERY,
  INITIAL_AUDIT_LOGS,
} from './mockData';

const STORAGE_KEYS = {
  MEMBERS: 'sec_members',
  EVENTS: 'sec_events',
  REGISTRATIONS: 'sec_registrations',
  PAYMENTS: 'sec_payments',
  REFERRALS: 'sec_referrals',
  POSTS: 'sec_posts',
  FORUM_THREADS: 'sec_forum_threads',
  CONNECTIONS: 'sec_connections',
  CHAT_MESSAGES: 'sec_chat_messages',
  NOTIFICATIONS: 'sec_notifications',
  TESTIMONIALS: 'sec_testimonials',
  GALLERY: 'sec_gallery',
  SETTINGS: 'sec_settings',
  AUDIT_LOGS: 'sec_audit_logs',
  CATEGORIES: 'sec_categories',
  ADMIN_CREDENTIALS: 'sec_admin_credentials',
};

const STORAGE_CLEAN_VERSION_KEY = 'sec_data_clean_version';
const CURRENT_CLEAN_VERSION = 'v4_clean_production';

if (typeof window !== 'undefined') {
  const currentVer = localStorage.getItem(STORAGE_CLEAN_VERSION_KEY);
  if (currentVer !== CURRENT_CLEAN_VERSION) {
    // Clear all previously cached mock/demo data from browser storage
    [
      STORAGE_KEYS.MEMBERS,
      STORAGE_KEYS.EVENTS,
      STORAGE_KEYS.REGISTRATIONS,
      STORAGE_KEYS.PAYMENTS,
      STORAGE_KEYS.REFERRALS,
      STORAGE_KEYS.POSTS,
      STORAGE_KEYS.FORUM_THREADS,
      STORAGE_KEYS.CONNECTIONS,
      STORAGE_KEYS.CHAT_MESSAGES,
      STORAGE_KEYS.NOTIFICATIONS,
      STORAGE_KEYS.TESTIMONIALS,
      STORAGE_KEYS.GALLERY,
      STORAGE_KEYS.AUDIT_LOGS,
      'sec_auth_member_id',
      'sec_auth_role',
      'sec_auth_admin',
    ].forEach((k) => {
      localStorage.removeItem(k);
    });
    localStorage.setItem(STORAGE_CLEAN_VERSION_KEY, CURRENT_CLEAN_VERSION);
  }
}

// Auto-sync settings from server to ensure all devices (mobile & desktop) stay in sync
export async function syncSettingsWithServer(): Promise<AdminSettings | null> {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch(`/api/settings?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { Pragma: 'no-cache', 'Cache-Control': 'no-cache' },
    });
    if (res.ok) {
      const serverSettings = await res.json();
      if (serverSettings && (serverSettings.membershipFee !== undefined || serverSettings.clubName)) {
        const local = getStoredItem<AdminSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
        const merged = { ...local, ...serverSettings };
        setStoredItem(STORAGE_KEYS.SETTINGS, merged);
        notifyListeners();
        return merged;
      }
    }
  } catch (err) {
    console.warn('Sync settings error:', err);
  }
  return null;
}

if (typeof window !== 'undefined') {
  syncSettingsWithServer();

  fetch('/api/events', { cache: 'no-store' })
    .then((res) => (res.ok ? res.json() : null))
    .then((serverEvents) => {
      if (Array.isArray(serverEvents) && serverEvents.length > 0) {
        const local = getStoredItem<SECEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
        // Merge or replace
        setStoredItem(STORAGE_KEYS.EVENTS, serverEvents);
        notifyListeners();
      }
    })
    .catch(() => {});
}

function getStoredItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error loading ${key} from storage:`, err);
    return defaultValue;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error('Error in store listener:', err);
    }
  });
}

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Global SEC Data Store
export const SECStore = {
  getCategories(): BusinessCategory[] {
    return getStoredItem<BusinessCategory[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },

  addCategory(category: BusinessCategory, adminName = 'Super Admin'): void {
    const cats = this.getCategories();
    setStoredItem(STORAGE_KEYS.CATEGORIES, [...cats, category]);
    this.addAuditLog('Added Category', 'Category', category.id, `Created industry category ${category.name}`, adminName);
    notifyListeners();
  },

  updateCategory(id: string, updated: Partial<BusinessCategory>, adminName = 'Super Admin'): void {
    const cats = this.getCategories();
    const newCats = cats.map((c) => (c.id === id ? { ...c, ...updated } : c));
    setStoredItem(STORAGE_KEYS.CATEGORIES, newCats);
    this.addAuditLog('Updated Category', 'Category', id, `Updated category ${id}`, adminName);
    notifyListeners();
  },

  deleteCategory(id: string, adminName = 'Super Admin'): void {
    const cats = this.getCategories();
    const newCats = cats.filter((c) => c.id !== id);
    setStoredItem(STORAGE_KEYS.CATEGORIES, newCats);
    this.addAuditLog('Deleted Category', 'Category', id, `Removed category ${id}`, adminName);
    notifyListeners();
  },

  getSettings(): AdminSettings {
    return getStoredItem<AdminSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  updateSettings(newSettings: Partial<AdminSettings>, adminName = 'Super Admin'): void {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    setStoredItem(STORAGE_KEYS.SETTINGS, updated);
    this.addAuditLog('Updated Settings', 'AdminSettings', 'global', 'Updated club settings and policies', adminName);
    notifyListeners();

    // Sync to server storage so mobile phones and laptops stay synchronized
    if (typeof window !== 'undefined') {
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch((err) => console.warn('Cloud settings sync notice:', err));
    }
  },

  getAdminCredentials(): { username: string; password: string } {
    return getStoredItem<{ username: string; password: string }>(STORAGE_KEYS.ADMIN_CREDENTIALS, {
      username: 'admin@salementrepreneursclub.com',
      password: 'Admin@SEC2026',
    });
  },

  updateAdminCredentials(credentials: { username: string; password: string }, adminName = 'Super Admin'): void {
    setStoredItem(STORAGE_KEYS.ADMIN_CREDENTIALS, credentials);
    this.addAuditLog('Updated Admin Credentials', 'Auth', 'admin', `Super admin credentials updated (${credentials.username})`, adminName);
    notifyListeners();
  },

  getMembers(): Member[] {
    return getStoredItem<Member[]>(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
  },

  getMemberById(id: string): Member | undefined {
    return this.getMembers().find((m) => m.id === id || m.userId === id || m.memberIdCode === id);
  },

  getMemberByReferralCode(code: string): Member | undefined {
    return this.getMembers().find(
      (m) => m.referralCode.toLowerCase() === code.trim().toLowerCase()
    );
  },

  addMember(member: Member): void {
    const members = this.getMembers();
    setStoredItem(STORAGE_KEYS.MEMBERS, [member, ...members]);
    this.addAuditLog('New Application', 'Member', member.id, `Application received for ${member.fullName}`, 'System');
    notifyListeners();
  },

  updateMember(id: string, partial: Partial<Member>): void {
    const members = this.getMembers().map((m) => (m.id === id ? { ...m, ...partial } : m));
    setStoredItem(STORAGE_KEYS.MEMBERS, members);
    notifyListeners();
  },

  approveMember(id: string, adminName = 'Super Admin'): void {
    const members = this.getMembers().map((m) => {
      if (m.id === id) {
        return {
          ...m,
          status: 'active' as const,
          badges: m.badges.includes('ACTIVE MEMBER') ? m.badges : [...m.badges, 'ACTIVE MEMBER' as const],
        };
      }
      return m;
    });
    setStoredItem(STORAGE_KEYS.MEMBERS, members);
    this.addAuditLog('Approved Member', 'Member', id, `Approved membership status for member ID: ${id}`, adminName);
    this.addNotification({
      userId: id,
      title: 'Membership Approved!',
      message: 'Congratulations! Your Salem Entrepreneurs Club membership is now active. Welcome aboard!',
      type: 'membership',
      link: '/dashboard',
    });
    notifyListeners();
  },

  suspendMember(id: string, adminName = 'Super Admin'): void {
    const members = this.getMembers().map((m) =>
      m.id === id ? { ...m, status: 'suspended' as const } : m
    );
    setStoredItem(STORAGE_KEYS.MEMBERS, members);
    this.addAuditLog('Suspended Member', 'Member', id, `Suspended member ID: ${id}`, adminName);
    notifyListeners();
  },

  deleteMember(id: string, adminName = 'Super Admin'): void {
    const members = this.getMembers().filter((m) => m.id !== id);
    setStoredItem(STORAGE_KEYS.MEMBERS, members);
    this.addAuditLog('Deleted Member', 'Member', id, `Deleted member ID: ${id}`, adminName);
    notifyListeners();
  },

  toggleMemberBadge(memberId: string, badge: Member['badges'][number]): void {
    const members = this.getMembers().map((m) => {
      if (m.id === memberId) {
        const has = m.badges.includes(badge);
        return {
          ...m,
          badges: has ? m.badges.filter((b) => b !== badge) : [...m.badges, badge],
        };
      }
      return m;
    });
    setStoredItem(STORAGE_KEYS.MEMBERS, members);
    notifyListeners();
  },

  // Events
  getEvents(): SECEvent[] {
    return getStoredItem<SECEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  },

  getEventById(id: string): SECEvent | undefined {
    return this.getEvents().find((e) => e.id === id);
  },

  addEvent(event: SECEvent, adminName = 'Super Admin'): void {
    const events = this.getEvents();
    const updated = [event, ...events];
    setStoredItem(STORAGE_KEYS.EVENTS, updated);
    this.addAuditLog('Created Event', 'Event', event.id, `Created event: ${event.title}`, adminName);
    notifyListeners();

    if (typeof window !== 'undefined') {
      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch((err) => console.warn('Cloud events sync notice:', err));
    }
  },

  updateEvent(id: string, partial: Partial<SECEvent>, adminName = 'Super Admin'): void {
    const events = this.getEvents().map((e) => (e.id === id ? { ...e, ...partial } : e));
    setStoredItem(STORAGE_KEYS.EVENTS, events);
    this.addAuditLog('Updated Event', 'Event', id, `Updated event: ${partial.title || id}`, adminName);
    notifyListeners();

    if (typeof window !== 'undefined') {
      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(events),
      }).catch((err) => console.warn('Cloud events sync notice:', err));
    }
  },

  deleteEvent(id: string, adminName = 'Super Admin'): void {
    const events = this.getEvents().filter((e) => e.id !== id);
    setStoredItem(STORAGE_KEYS.EVENTS, events);
    this.addAuditLog('Deleted Event', 'Event', id, `Deleted event ID: ${id}`, adminName);
    notifyListeners();

    if (typeof window !== 'undefined') {
      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(events),
      }).catch((err) => console.warn('Cloud events sync notice:', err));
    }
  },

  // Event Registrations & Attendance
  getRegistrations(): EventRegistration[] {
    return getStoredItem<EventRegistration[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
  },

  getRegistrationsForEvent(eventId: string): EventRegistration[] {
    return this.getRegistrations().filter((r) => r.eventId === eventId);
  },

  registerForEvent(reg: EventRegistration): void {
    const all = this.getRegistrations();
    // Check if already registered
    const existing = all.find((r) => r.eventId === reg.eventId && r.memberId === reg.memberId);
    let updated: EventRegistration[];
    if (existing) {
      updated = all.map((r) => (r.id === existing.id ? { ...r, ...reg } : r));
    } else {
      updated = [reg, ...all];
      // Increment event registeredCount
      const events = this.getEvents().map((e) =>
        e.id === reg.eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e
      );
      setStoredItem(STORAGE_KEYS.EVENTS, events);
    }
    setStoredItem(STORAGE_KEYS.REGISTRATIONS, updated);

    // Gamification points for member
    this.addGamificationPoints(reg.memberId, 5);

    notifyListeners();
  },

  toggleAttendance(registrationId: string, status: 'present' | 'absent', adminName = 'Super Admin'): void {
    const all = this.getRegistrations();
    const updated = all.map((r) => {
      if (r.id === registrationId) {
        if (status === 'present' && r.attendanceStatus !== 'present') {
          // Add 10 points for attending
          this.addGamificationPoints(r.memberId, 10);
        }
        return { ...r, attendanceStatus: status };
      }
      return r;
    });
    setStoredItem(STORAGE_KEYS.REGISTRATIONS, updated);
    this.addAuditLog('Marked Attendance', 'Registration', registrationId, `Marked attendance as ${status}`, adminName);
    notifyListeners();
  },

  // Payments
  getPayments(): PaymentSubmission[] {
    return getStoredItem<PaymentSubmission[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
  },

  submitPayment(payment: PaymentSubmission): void {
    const payments = this.getPayments();
    setStoredItem(STORAGE_KEYS.PAYMENTS, [payment, ...payments]);

    // Also update member status to payment_pending / under_review
    this.updateMember(payment.memberId, { status: 'payment_pending' });

    this.addAuditLog('Payment Submitted', 'Payment', payment.id, `Payment proof submitted for ₹${payment.amount} (Ref: ${payment.upiTransactionId})`, 'System');
    notifyListeners();
  },

  approvePayment(paymentId: string, adminName = 'Super Admin'): void {
    const payments = this.getPayments();
    const target = payments.find((p) => p.id === paymentId);
    if (!target) return;

    const updated = payments.map((p) =>
      p.id === paymentId
        ? {
            ...p,
            status: 'approved' as const,
            reviewedAt: new Date().toISOString(),
            reviewedBy: adminName,
          }
        : p
    );
    setStoredItem(STORAGE_KEYS.PAYMENTS, updated);

    // Activate the member
    this.approveMember(target.memberId, adminName);

    // If referral code was used, process referral commission
    if (target.referralCodeUsed) {
      const referrer = this.getMemberByReferralCode(target.referralCodeUsed);
      if (referrer) {
        const settings = this.getSettings();
        const commissionAmount = Math.round((target.amount * settings.referralPercentage) / 100);

        const newReferral: Referral = {
          id: `ref-${Date.now()}`,
          referrerId: referrer.id,
          referrerName: referrer.fullName,
          referrerCode: referrer.referralCode,
          newMemberId: target.memberId,
          newMemberName: target.memberName,
          newMemberBusiness: target.businessName,
          date: new Date().toISOString().split('T')[0],
          membershipAmount: target.amount,
          commissionPercentage: settings.referralPercentage,
          commissionAmount,
          paymentStatus: 'approved',
          commissionStatus: 'approved',
        };

        const referrals = this.getReferrals();
        setStoredItem(STORAGE_KEYS.REFERRALS, [newReferral, ...referrals]);

        // Award gamification points to referrer (50 points)
        this.addGamificationPoints(referrer.id, settings.gamification.referralPoints);

        // Notify referrer
        this.addNotification({
          userId: referrer.id,
          title: 'Referral Commission Approved!',
          message: `Great news! Your referral ${target.memberName} has joined SEC. ₹${commissionAmount} commission recorded.`,
          type: 'referral',
          link: '/referrals',
        });
      }
    }

    notifyListeners();
  },

  rejectPayment(paymentId: string, adminNotes: string, adminName = 'Super Admin'): void {
    const payments = this.getPayments().map((p) =>
      p.id === paymentId
        ? {
            ...p,
            status: 'rejected' as const,
            adminNotes,
            reviewedAt: new Date().toISOString(),
            reviewedBy: adminName,
          }
        : p
    );
    setStoredItem(STORAGE_KEYS.PAYMENTS, payments);
    this.addAuditLog('Payment Rejected', 'Payment', paymentId, `Rejected payment: ${adminNotes}`, adminName);
    notifyListeners();
  },

  // Referrals
  getReferrals(): Referral[] {
    return getStoredItem<Referral[]>(STORAGE_KEYS.REFERRALS, INITIAL_REFERRALS);
  },

  getReferralsForMember(memberId: string): Referral[] {
    return this.getReferrals().filter((r) => r.referrerId === memberId);
  },

  updateReferralCommissionStatus(
    referralId: string,
    status: Referral['commissionStatus'],
    adminName = 'Super Admin'
  ): void {
    const referrals = this.getReferrals().map((r) =>
      r.id === referralId ? { ...r, commissionStatus: status } : r
    );
    setStoredItem(STORAGE_KEYS.REFERRALS, referrals);
    this.addAuditLog('Referral Commission Updated', 'Referral', referralId, `Marked referral commission as ${status}`, adminName);
    notifyListeners();
  },

  // Community Feed Posts
  getPosts(): CommunityPost[] {
    return getStoredItem<CommunityPost[]>(STORAGE_KEYS.POSTS, INITIAL_POSTS);
  },

  addPost(post: CommunityPost): void {
    const posts = this.getPosts();
    setStoredItem(STORAGE_KEYS.POSTS, [post, ...posts]);
    this.addGamificationPoints(post.authorId, 2);
    notifyListeners();
  },

  likePost(postId: string, memberId: string): void {
    const posts = this.getPosts().map((p) => {
      if (p.id === postId) {
        const liked = p.likedBy.includes(memberId);
        const updatedLikedBy = liked
          ? p.likedBy.filter((id) => id !== memberId)
          : [...p.likedBy, memberId];
        return {
          ...p,
          likedBy: updatedLikedBy,
          likesCount: updatedLikedBy.length,
        };
      }
      return p;
    });
    setStoredItem(STORAGE_KEYS.POSTS, posts);
    notifyListeners();
  },

  addPostComment(postId: string, comment: CommunityPost['comments'][0]): void {
    const posts = this.getPosts().map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...p.comments, comment],
        };
      }
      return p;
    });
    setStoredItem(STORAGE_KEYS.POSTS, posts);
    notifyListeners();
  },

  deletePost(postId: string, adminName?: string): void {
    const posts = this.getPosts().filter((p) => p.id !== postId);
    setStoredItem(STORAGE_KEYS.POSTS, posts);
    if (adminName) {
      this.addAuditLog('Deleted Post', 'Post', postId, 'Admin removed post', adminName);
    }
    notifyListeners();
  },

  togglePinPost(postId: string): void {
    const posts = this.getPosts().map((p) =>
      p.id === postId ? { ...p, isPinned: !p.isPinned } : p
    );
    setStoredItem(STORAGE_KEYS.POSTS, posts);
    notifyListeners();
  },

  toggleHidePost(postId: string): void {
    const posts = this.getPosts().map((p) =>
      p.id === postId ? { ...p, isHidden: !p.isHidden } : p
    );
    setStoredItem(STORAGE_KEYS.POSTS, posts);
    notifyListeners();
  },

  // Forum Threads
  getForumThreads(): ForumThread[] {
    return getStoredItem<ForumThread[]>(STORAGE_KEYS.FORUM_THREADS, INITIAL_FORUM_THREADS);
  },

  addForumThread(thread: ForumThread): void {
    const threads = this.getForumThreads();
    setStoredItem(STORAGE_KEYS.FORUM_THREADS, [thread, ...threads]);
    this.addGamificationPoints(thread.authorId, 3);
    notifyListeners();
  },

  likeForumThread(threadId: string, memberId: string): void {
    const threads = this.getForumThreads().map((t) => {
      if (t.id === threadId) {
        const liked = t.likedBy.includes(memberId);
        const updated = liked ? t.likedBy.filter((id) => id !== memberId) : [...t.likedBy, memberId];
        return {
          ...t,
          likedBy: updated,
          likesCount: updated.length,
        };
      }
      return t;
    });
    setStoredItem(STORAGE_KEYS.FORUM_THREADS, threads);
    notifyListeners();
  },

  addForumComment(threadId: string, comment: ForumThread['comments'][0]): void {
    const threads = this.getForumThreads().map((t) => {
      if (t.id === threadId) {
        return {
          ...t,
          comments: [...t.comments, comment],
          commentsCount: t.commentsCount + 1,
        };
      }
      return t;
    });
    setStoredItem(STORAGE_KEYS.FORUM_THREADS, threads);
    notifyListeners();
  },

  // Connections
  getConnections(): Connection[] {
    return getStoredItem<Connection[]>(STORAGE_KEYS.CONNECTIONS, INITIAL_CONNECTIONS);
  },

  sendConnectionRequest(requesterId: string, receiverId: string): void {
    const connections = this.getConnections();
    const existing = connections.find(
      (c) =>
        (c.requesterId === requesterId && c.receiverId === receiverId) ||
        (c.requesterId === receiverId && c.receiverId === requesterId)
    );
    if (existing) return;

    const newConn: Connection = {
      id: `con-${Date.now()}`,
      requesterId,
      receiverId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setStoredItem(STORAGE_KEYS.CONNECTIONS, [newConn, ...connections]);

    const requester = this.getMemberById(requesterId);
    this.addNotification({
      userId: receiverId,
      title: 'New Connection Request',
      message: `${requester?.fullName || 'A member'} sent you a connection request.`,
      type: 'connection',
      link: '/connections',
    });

    notifyListeners();
  },

  respondConnection(connectionId: string, status: 'accepted' | 'rejected'): void {
    const connections = this.getConnections().map((c) =>
      c.id === connectionId ? { ...c, status, updatedAt: new Date().toISOString() } : c
    );
    setStoredItem(STORAGE_KEYS.CONNECTIONS, connections);

    if (status === 'accepted') {
      const conn = connections.find((c) => c.id === connectionId);
      if (conn) {
        this.addGamificationPoints(conn.requesterId, 5);
        this.addGamificationPoints(conn.receiverId, 5);

        const receiver = this.getMemberById(conn.receiverId);
        this.addNotification({
          userId: conn.requesterId,
          title: 'Connection Accepted',
          message: `${receiver?.fullName || 'A member'} accepted your connection request.`,
          type: 'connection',
          link: `/members/${conn.receiverId}`,
        });
      }
    }
    notifyListeners();
  },

  // Community Chat
  getChatMessages(): ChatMessage[] {
    return getStoredItem<ChatMessage[]>(STORAGE_KEYS.CHAT_MESSAGES, INITIAL_CHAT_MESSAGES);
  },

  sendChatMessage(message: ChatMessage): void {
    const messages = this.getChatMessages();
    setStoredItem(STORAGE_KEYS.CHAT_MESSAGES, [...messages, message]);
    notifyListeners();
  },

  // Notifications
  getNotifications(userId: string): NotificationItem[] {
    const all = getStoredItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return all.filter((n) => n.userId === userId || n.userId === 'all');
  },

  addNotification(notif: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>): void {
    const all = getStoredItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const item: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setStoredItem(STORAGE_KEYS.NOTIFICATIONS, [item, ...all]);
    notifyListeners();
  },

  markNotificationAsRead(id: string): void {
    const all = getStoredItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    setStoredItem(
      STORAGE_KEYS.NOTIFICATIONS,
      all.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    notifyListeners();
  },

  markAllNotificationsAsRead(userId: string): void {
    const all = getStoredItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    setStoredItem(
      STORAGE_KEYS.NOTIFICATIONS,
      all.map((n) => ((n.userId === userId || n.userId === 'all') ? { ...n, read: true } : n))
    );
    notifyListeners();
  },

  // Testimonials
  getTestimonials(): Testimonial[] {
    return getStoredItem<Testimonial[]>(STORAGE_KEYS.TESTIMONIALS, INITIAL_TESTIMONIALS);
  },

  addTestimonial(testimonial: Testimonial): void {
    const current = this.getTestimonials();
    setStoredItem(STORAGE_KEYS.TESTIMONIALS, [testimonial, ...current]);
    notifyListeners();
  },

  updateTestimonial(id: string, partial: Partial<Testimonial>): void {
    const updated = this.getTestimonials().map((t) => (t.id === id ? { ...t, ...partial } : t));
    setStoredItem(STORAGE_KEYS.TESTIMONIALS, updated);
    notifyListeners();
  },

  deleteTestimonial(id: string): void {
    const updated = this.getTestimonials().filter((t) => t.id !== id);
    setStoredItem(STORAGE_KEYS.TESTIMONIALS, updated);
    notifyListeners();
  },

  // Gallery
  getGallery(): GalleryItem[] {
    return getStoredItem<GalleryItem[]>(STORAGE_KEYS.GALLERY, INITIAL_GALLERY);
  },

  addGalleryItem(item: GalleryItem): void {
    const current = this.getGallery();
    setStoredItem(STORAGE_KEYS.GALLERY, [item, ...current]);
    notifyListeners();
  },

  deleteGalleryItem(id: string): void {
    const updated = this.getGallery().filter((g) => g.id !== id);
    setStoredItem(STORAGE_KEYS.GALLERY, updated);
    notifyListeners();
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return getStoredItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },

  addAuditLog(
    action: string,
    objectType: string,
    objectId: string,
    details: string,
    adminName = 'Super Admin'
  ): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      adminName,
      action,
      objectType,
      objectId,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
    };
    setStoredItem(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...logs]);
    notifyListeners();
  },

  // Gamification helper
  addGamificationPoints(memberId: string, points: number): void {
    const members = this.getMembers().map((m) =>
      m.id === memberId
        ? { ...m, gamificationPoints: (m.gamificationPoints || 0) + points }
        : m
    );
    setStoredItem(STORAGE_KEYS.MEMBERS, members);
  },

  // CSV Export utility
  exportToCSV(filename: string, rows: Record<string, unknown>[]): void {
    if (!rows.length) return;
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows
        .map((row) =>
          keys
            .map((k) => {
              const raw = row[k] === null || row[k] === undefined ? '' : row[k];
              let cellStr = typeof raw === 'object' ? JSON.stringify(raw) : String(raw);
              cellStr = cellStr.replace(/"/g, '""');
              if (cellStr.search(/("|,|\n)/g) >= 0) cellStr = `"${cellStr}"`;
              return cellStr;
            })
            .join(separator)
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Clear all existing demo data from the entire application
  clearAllData(adminName = 'Super Admin'): void {
    setStoredItem(STORAGE_KEYS.MEMBERS, []);
    setStoredItem(STORAGE_KEYS.EVENTS, []);
    setStoredItem(STORAGE_KEYS.REGISTRATIONS, []);
    setStoredItem(STORAGE_KEYS.PAYMENTS, []);
    setStoredItem(STORAGE_KEYS.REFERRALS, []);
    setStoredItem(STORAGE_KEYS.POSTS, []);
    setStoredItem(STORAGE_KEYS.FORUM_THREADS, []);
    setStoredItem(STORAGE_KEYS.CONNECTIONS, []);
    setStoredItem(STORAGE_KEYS.CHAT_MESSAGES, []);
    setStoredItem(STORAGE_KEYS.NOTIFICATIONS, []);
    setStoredItem(STORAGE_KEYS.TESTIMONIALS, []);
    setStoredItem(STORAGE_KEYS.GALLERY, []);
    setStoredItem(STORAGE_KEYS.AUDIT_LOGS, []);
    this.addAuditLog('Data Wipe', 'AllData', 'system', 'Admin wiped all existing mock and demo data clean', adminName);
    notifyListeners();
  },
};
