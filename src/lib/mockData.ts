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

export const INITIAL_CATEGORIES: BusinessCategory[] = [
  { id: 'it', name: 'IT & Software', description: 'Web, mobile, SaaS, cloud and technology' },
  { id: 'manufacturing', name: 'Manufacturing & Steel', description: 'Machinery, foundries, industrial goods' },
  { id: 'textiles', name: 'Textile & Garments', description: 'Yarn, fabrics, readymade apparel and mills' },
  { id: 'realestate', name: 'Real Estate & Construction', description: 'Commercial, residential, civil contracts' },
  { id: 'food', name: 'Food & Agriculture', description: 'Sago, mango processing, restaurants, organics' },
  { id: 'healthcare', name: 'Healthcare & Pharma', description: 'Clinics, hospitals, medical supplies' },
  { id: 'education', name: 'Education & Training', description: 'Institutes, academies, professional coaching' },
  { id: 'retail', name: 'Retail & Supermarkets', description: 'FMCG, electronics, lifestyle stores' },
  { id: 'consulting', name: 'Consulting & Legal', description: 'Audit, legal, business strategy, tax' },
  { id: 'marketing', name: 'Marketing & Media', description: 'Digital marketing, branding, printing' },
  { id: 'automobile', name: 'Automobile & Spares', description: 'Dealerships, EV services, components' },
  { id: 'logistics', name: 'Logistics & Transport', description: 'Fleet, warehousing, supply chain' },
];

export const INITIAL_SETTINGS: AdminSettings = {
  clubName: 'Salem Entrepreneurs Forum',
  tagline: 'Meet. Learn. Collaborate. Grow.',
  logoUrl: '/images/sec-logo.png',
  membershipFee: 5000,
  membershipDurationMonths: 12,
  referralPercentage: 10,
  upiId: 'salementrepreneurs@okaxis',
  gpayNumber: '+91 98427 88990',
  qrCodeUrl: '', // Awaiting admin upload from Admin Panel
  paymentInstructions: 'Scan the QR code or send payment to the official UPI ID. After payment, copy the 12-digit UTR/Transaction Reference ID and attach your payment screenshot proof below for instant verification.',
  contactPhone: '+91 98427 88990',
  contactEmail: 'connect@salementrepreneursclub.com',
  contactAddress: '4th Floor, Apex Business Center, Fairlands Main Road, Salem - 636016, Tamil Nadu',
  whatsappNumber: '+91 98427 88990',
  instagramUrl: 'https://instagram.com/salementrepreneursclub',
  facebookUrl: 'https://facebook.com/salementrepreneursclub',
  youtubeUrl: 'https://youtube.com/@salementrepreneurs',
  linkedinUrl: 'https://linkedin.com/company/salem-entrepreneurs-club',
  aboutText: 'Salem Entrepreneurs Club (SEC) is the premier business and networking coalition designed specifically for ambitious business owners, startup founders, manufacturers, and trade leaders across Salem and the Kongu region. Born from a vision to break the traditional silos of local commerce, SEC connects dynamic minds across diverse industries to unlock collaborative partnerships, high-value referral pipelines, and mutual growth.',
  missionText: 'To create a vibrant entrepreneurial ecosystem where business owners can connect with like-minded people, exchange ideas, generate opportunities, build meaningful relationships, and grow together.',
  visionText: 'To build one of the most active entrepreneur communities in Tamil Nadu where business, friendship, collaboration, and opportunity come together.',
  termsText: 'Membership is by peer application and review. All members are expected to maintain the highest standards of professional ethics, respect peer confidentiality, and actively support mutual community growth.',
  privacyText: 'Your privacy is paramount. SEC provides member-controlled visibility preferences. Private contact details are never sold or exposed to unauthorized third parties.',
  gamification: {
    eventAttendancePoints: 10,
    referralPoints: 50,
    postPoints: 2,
    connectionPoints: 5,
  },
  reminders: {
    sevenDays: true,
    oneDay: true,
    twoHours: true,
  },
};

// All existing mock data cleared clean for production
export const INITIAL_MEMBERS: Member[] = [];
export const INITIAL_EVENTS: SECEvent[] = [];
export const INITIAL_REGISTRATIONS: EventRegistration[] = [];
export const INITIAL_PAYMENTS: PaymentSubmission[] = [];
export const INITIAL_REFERRALS: Referral[] = [];
export const INITIAL_POSTS: CommunityPost[] = [];
export const INITIAL_FORUM_THREADS: ForumThread[] = [];
export const INITIAL_CONNECTIONS: Connection[] = [];
export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
export const INITIAL_TESTIMONIALS: Testimonial[] = [];
export const INITIAL_GALLERY: GalleryItem[] = [];
