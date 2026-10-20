export type UserRole = 'visitor' | 'member' | 'admin';

export type MembershipStatus =
  | 'application_pending'
  | 'payment_pending'
  | 'active'
  | 'expired'
  | 'suspended'
  | 'rejected';

export type MemberBadge =
  | 'FOUNDING MEMBER'
  | 'ACTIVE MEMBER'
  | 'TOP NETWORKER'
  | 'TOP REFERRER'
  | 'EVENT CHAMPION'
  | 'COMMUNITY CONTRIBUTOR';

export interface BusinessCategory {
  id: string;
  name: string;
  icon?: string;
  description?: string;
}

export interface Business {
  id: string;
  memberId: string;
  businessName: string;
  category: string;
  designation: string;
  description: string;
  productsServices: string[];
  location: string;
  phone: string;
  whatsapp: string;
  email: string;
  website?: string;
  instagram?: string;
  linkedin?: string;
  facebook?: string;
  youtube?: string;
  posterUrl?: string;
  logoUrl?: string;
  galleryUrls?: string[];
  promotions?: string[];
  isPublic: boolean;
}

export interface Member {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  avatarUrl: string;
  coverImageUrl?: string;
  bio: string;
  role: UserRole;
  status: MembershipStatus;
  joinedDate: string;
  membershipExpiryDate: string;
  memberIdCode: string; // e.g. "SEC-2024-001"
  referralCode: string; // e.g. "SEC-SARAVANAN-007"
  referredBy?: string; // referral code
  badges: MemberBadge[];
  gamificationPoints: number;
  business: Business;
  privacy: {
    phoneVisible: 'public' | 'members_only' | 'admin_only';
    emailVisible: 'public' | 'members_only' | 'admin_only';
  };
}

export interface EventSpeaker {
  name: string;
  role: string;
  company: string;
  avatarUrl?: string;
}

export interface SECEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  googleMapsUrl?: string;
  imageUrl: string;
  bannerUrl?: string;
  category: string;
  maxParticipants: number;
  registrationFee: number; // 0 for free
  dressCode?: string;
  agenda: { time: string; activity: string }[];
  speakers: EventSpeaker[];
  sponsors: string[];
  isPublished: boolean;
  registeredCount: number;
  qrCodeUrl?: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  memberId: string;
  memberName: string;
  businessName: string;
  phone: string;
  email: string;
  memberIdCode: string;
  registrationDate: string;
  status: 'attending' | 'maybe' | 'not_attending';
  paymentStatus: 'paid' | 'pending' | 'free';
  attendanceStatus: 'present' | 'absent';
  notes?: string;
}

export interface PaymentSubmission {
  id: string;
  memberId: string;
  memberName: string;
  businessName: string;
  email: string;
  phone: string;
  amount: number;
  paymentType: 'membership' | 'event';
  eventId?: string;
  upiTransactionId: string;
  screenshotUrl: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  referralCodeUsed?: string;
  adminNotes?: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  referrerName: string;
  referrerCode: string;
  newMemberId: string;
  newMemberName: string;
  newMemberBusiness: string;
  date: string;
  membershipAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  paymentStatus: 'pending' | 'approved' | 'rejected';
  commissionStatus: 'pending' | 'approved' | 'paid' | 'rejected';
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorBusiness: string;
  authorAvatar: string;
  authorDesignation: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  postType:
    | 'general'
    | 'business_promotion'
    | 'event_discussion'
    | 'question'
    | 'achievement'
    | 'announcement';
  createdAt: string;
  likesCount: number;
  likedBy: string[]; // member IDs
  comments: PostComment[];
  isPinned: boolean;
  isHidden: boolean;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface ForumThread {
  id: string;
  title: string;
  description: string;
  category: string;
  authorId: string;
  authorName: string;
  authorBusiness: string;
  authorAvatar: string;
  createdAt: string;
  likesCount: number;
  likedBy: string[];
  commentsCount: number;
  comments: ForumComment[];
  isPinned: boolean;
}

export interface ForumComment {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface Connection {
  id: string;
  requesterId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderBusiness: string;
  content: string;
  imageUrl?: string;
  businessCardShare?: {
    businessName: string;
    category: string;
    phone: string;
    location: string;
  };
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type:
    | 'membership'
    | 'event'
    | 'connection'
    | 'referral'
    | 'announcement'
    | 'payment';
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  business: string;
  designation: string;
  photoUrl: string;
  content: string;
  rating: number;
  isPublished: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Events' | 'Networking' | 'Celebrations' | 'Workshops' | 'Community';
  imageUrl: string;
  date: string;
}

export interface AdminSettings {
  clubName: string;
  tagline: string;
  logoUrl?: string;
  membershipFee: number;
  membershipDurationMonths: number;
  referralPercentage: number;
  upiId: string;
  gpayNumber: string;
  qrCodeUrl: string;
  paymentInstructions: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  whatsappNumber: string;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  linkedinUrl: string;
  aboutText: string;
  missionText: string;
  visionText: string;
  termsText: string;
  privacyText: string;
  gamification: {
    eventAttendancePoints: number;
    referralPoints: number;
    postPoints: number;
    connectionPoints: number;
  };
  reminders: {
    sevenDays: boolean;
    oneDay: boolean;
    twoHours: boolean;
  };
}

export interface AuditLog {
  id: string;
  adminName: string;
  action: string;
  objectType: string;
  objectId: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}
