-- =========================================================================
-- SALEM ENTREPRENEURS CLUB (SEC) — PRODUCTION POSTGRESQL SUPABASE SCHEMA
-- Tagline: "Connect. Collaborate. Grow."
-- Fully Idempotent (safe to re-run multiple times in Supabase SQL Editor)
-- =========================================================================

-- Enable standard cryptographic & uuid extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BUSINESS CATEGORIES
CREATE TABLE IF NOT EXISTS public.business_categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ADMIN SETTINGS
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id VARCHAR(32) PRIMARY KEY DEFAULT 'global',
    club_name VARCHAR(255) DEFAULT 'Salem Entrepreneurs Club',
    tagline TEXT DEFAULT 'Where Entrepreneurs Connect, Collaborate, Have Fun & Grow Together.',
    logo_url TEXT,
    membership_fee NUMERIC(12, 2) DEFAULT 5000.00,
    membership_duration_months INT DEFAULT 12,
    referral_percentage NUMERIC(5, 2) DEFAULT 10.00,
    upi_id VARCHAR(255) DEFAULT 'salementrepreneurs@okaxis',
    gpay_number VARCHAR(64) DEFAULT '+91 98427 88990',
    qr_code_url TEXT,
    payment_instructions TEXT,
    contact_phone VARCHAR(64) DEFAULT '+91 98427 88990',
    contact_email VARCHAR(255) DEFAULT 'connect@salementrepreneursclub.com',
    contact_address TEXT DEFAULT '4th Floor, Apex Business Center, Fairlands Main Road, Salem - 636016, Tamil Nadu',
    whatsapp_number VARCHAR(64) DEFAULT '+91 98427 88990',
    instagram_url TEXT DEFAULT 'https://instagram.com/salementrepreneursclub',
    facebook_url TEXT DEFAULT 'https://facebook.com/salementrepreneursclub',
    youtube_url TEXT DEFAULT 'https://youtube.com/@salementrepreneurs',
    linkedin_url TEXT DEFAULT 'https://linkedin.com/company/salem-entrepreneurs-club',
    about_text TEXT,
    mission_text TEXT,
    vision_text TEXT,
    terms_text TEXT,
    privacy_text TEXT,
    referral_points INT DEFAULT 50,
    event_attendance_points INT DEFAULT 10,
    post_points INT DEFAULT 2,
    connection_points INT DEFAULT 5,
    reminder_seven_days BOOLEAN DEFAULT TRUE,
    reminder_one_day BOOLEAN DEFAULT TRUE,
    reminder_two_hours BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MEMBERS (Profiles)
CREATE TABLE IF NOT EXISTS public.members (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(64) NOT NULL,
    whatsapp VARCHAR(64),
    avatar_url TEXT,
    cover_image_url TEXT,
    bio TEXT,
    role VARCHAR(32) DEFAULT 'member' CHECK (role IN ('visitor', 'member', 'admin')),
    status VARCHAR(32) DEFAULT 'payment_pending' CHECK (status IN ('application_pending', 'payment_pending', 'active', 'expired', 'suspended', 'rejected')),
    joined_date DATE DEFAULT CURRENT_DATE,
    membership_expiry_date DATE DEFAULT (CURRENT_DATE + 365),
    member_id_code VARCHAR(64) NOT NULL UNIQUE,
    referral_code VARCHAR(64) NOT NULL UNIQUE,
    referred_by VARCHAR(64),
    badges TEXT[] DEFAULT '{}',
    gamification_points INT DEFAULT 0,
    phone_privacy VARCHAR(32) DEFAULT 'members_only' CHECK (phone_privacy IN ('public', 'members_only', 'admin_only')),
    email_privacy VARCHAR(32) DEFAULT 'members_only' CHECK (email_privacy IN ('public', 'members_only', 'admin_only')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. BUSINESSES
CREATE TABLE IF NOT EXISTS public.businesses (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    member_id VARCHAR(64) NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    description TEXT,
    products_services TEXT[] DEFAULT '{}',
    location VARCHAR(255) NOT NULL,
    phone VARCHAR(64) NOT NULL,
    whatsapp VARCHAR(64),
    email VARCHAR(255),
    website TEXT,
    instagram TEXT,
    linkedin TEXT,
    facebook TEXT,
    youtube TEXT,
    poster_url TEXT,
    logo_url TEXT,
    gallery_urls TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. EVENTS
CREATE TABLE IF NOT EXISTS public.events (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    start_time VARCHAR(32) NOT NULL,
    end_time VARCHAR(32) NOT NULL,
    venue TEXT NOT NULL,
    google_maps_url TEXT,
    image_url TEXT NOT NULL,
    banner_url TEXT,
    category VARCHAR(64) NOT NULL,
    max_participants INT DEFAULT 100,
    registration_fee NUMERIC(10, 2) DEFAULT 0.00,
    dress_code VARCHAR(255),
    agenda JSONB DEFAULT '[]'::jsonb,
    speakers JSONB DEFAULT '[]'::jsonb,
    sponsors TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT TRUE,
    registered_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. EVENT REGISTRATIONS
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    event_id VARCHAR(64) NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    member_id VARCHAR(64) NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    member_name VARCHAR(255) NOT NULL,
    business_name VARCHAR(255),
    phone VARCHAR(64) NOT NULL,
    email VARCHAR(255) NOT NULL,
    member_id_code VARCHAR(64) NOT NULL,
    registration_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(32) DEFAULT 'attending' CHECK (status IN ('attending', 'maybe', 'not_attending')),
    payment_status VARCHAR(32) DEFAULT 'free' CHECK (payment_status IN ('paid', 'pending', 'free')),
    attendance_status VARCHAR(32) DEFAULT 'absent' CHECK (attendance_status IN ('present', 'absent')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, member_id)
);

-- 7. PAYMENTS & UTR VERIFICATIONS
CREATE TABLE IF NOT EXISTS public.payments (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    member_id VARCHAR(64) REFERENCES public.members(id) ON DELETE SET NULL,
    member_name VARCHAR(255) NOT NULL,
    business_name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(64) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    payment_type VARCHAR(32) DEFAULT 'membership' CHECK (payment_type IN ('membership', 'event')),
    event_id VARCHAR(64) REFERENCES public.events(id) ON DELETE SET NULL,
    upi_transaction_id VARCHAR(128) NOT NULL,
    screenshot_url TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'under_review' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by VARCHAR(255),
    referral_code_used VARCHAR(64),
    admin_notes TEXT
);

-- 8. REFERRALS & COMMISSIONS
CREATE TABLE IF NOT EXISTS public.referrals (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    referrer_id VARCHAR(64) REFERENCES public.members(id) ON DELETE SET NULL,
    referrer_name VARCHAR(255) NOT NULL,
    referrer_code VARCHAR(64) NOT NULL,
    new_member_id VARCHAR(64) REFERENCES public.members(id) ON DELETE SET NULL,
    new_member_name VARCHAR(255) NOT NULL,
    new_member_business VARCHAR(255),
    date DATE DEFAULT CURRENT_DATE,
    membership_amount NUMERIC(12, 2) NOT NULL,
    commission_percentage NUMERIC(5, 2) NOT NULL,
    commission_amount NUMERIC(12, 2) NOT NULL,
    payment_status VARCHAR(32) DEFAULT 'approved' CHECK (payment_status IN ('pending', 'approved', 'rejected')),
    commission_status VARCHAR(32) DEFAULT 'pending' CHECK (commission_status IN ('pending', 'approved', 'paid', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. COMMUNITY POSTS
CREATE TABLE IF NOT EXISTS public.posts (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    author_id VARCHAR(64) REFERENCES public.members(id) ON DELETE SET NULL,
    author_name VARCHAR(255) NOT NULL,
    author_business VARCHAR(255),
    author_avatar TEXT,
    author_designation VARCHAR(255),
    content TEXT NOT NULL,
    image_url TEXT,
    video_url TEXT,
    post_type VARCHAR(64) DEFAULT 'general' CHECK (post_type IN ('general', 'business_promotion', 'event_discussion', 'question', 'achievement', 'announcement')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    likes_count INT DEFAULT 0,
    liked_by TEXT[] DEFAULT '{}',
    is_pinned BOOLEAN DEFAULT FALSE,
    is_hidden BOOLEAN DEFAULT FALSE
);

-- 10. POST COMMENTS
CREATE TABLE IF NOT EXISTS public.post_comments (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    post_id VARCHAR(64) NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id VARCHAR(64) REFERENCES public.members(id) ON DELETE SET NULL,
    author_name VARCHAR(255) NOT NULL,
    author_avatar TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. FORUM THREADS
CREATE TABLE IF NOT EXISTS public.forum_threads (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(64) NOT NULL,
    author_id VARCHAR(64) REFERENCES public.members(id) ON DELETE SET NULL,
    author_name VARCHAR(255) NOT NULL,
    author_business VARCHAR(255),
    author_avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    likes_count INT DEFAULT 0,
    liked_by TEXT[] DEFAULT '{}',
    comments_count INT DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE
);

-- 12. FORUM COMMENTS
CREATE TABLE IF NOT EXISTS public.forum_comments (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    thread_id VARCHAR(64) NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    author_id VARCHAR(64) REFERENCES public.members(id) ON DELETE SET NULL,
    author_name VARCHAR(255) NOT NULL,
    author_avatar TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. MEMBER CONNECTIONS
CREATE TABLE IF NOT EXISTS public.connections (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    requester_id VARCHAR(64) REFERENCES public.members(id) ON DELETE CASCADE,
    receiver_id VARCHAR(64) REFERENCES public.members(id) ON DELETE CASCADE,
    status VARCHAR(32) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(requester_id, receiver_id)
);

-- 14. COMMUNITY CHAT MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    sender_id VARCHAR(64) REFERENCES public.members(id) ON DELETE SET NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_avatar TEXT,
    sender_business VARCHAR(255),
    content TEXT NOT NULL,
    image_url TEXT,
    business_card_share JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(32) NOT NULL,
    link TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. TESTIMONIALS
CREATE TABLE IF NOT EXISTS public.testimonials (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(255) NOT NULL,
    business VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    photo_url TEXT NOT NULL,
    content TEXT NOT NULL,
    rating INT DEFAULT 5,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. GALLERY
CREATE TABLE IF NOT EXISTS public.gallery (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    image_url TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    admin_name VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    object_type VARCHAR(64) NOT NULL,
    object_id VARCHAR(64) NOT NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(64),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- INDEXES FOR FAST SEARCH AND QUERIES
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_members_email ON public.members(email);
CREATE INDEX IF NOT EXISTS idx_members_referral_code ON public.members(referral_code);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON public.businesses(category);
CREATE INDEX IF NOT EXISTS idx_event_reg_event ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reg_member ON public.event_registrations(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_upi ON public.payments(upi_transaction_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_posts_type ON public.posts(post_type);
CREATE INDEX IF NOT EXISTS idx_forum_category ON public.forum_threads(category);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Idempotent RLS Policy Setup: Drop existing policies before creating
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public read published events" ON public.events;
    DROP POLICY IF EXISTS "Public read settings" ON public.admin_settings;
    DROP POLICY IF EXISTS "Public read businesses" ON public.businesses;
    DROP POLICY IF EXISTS "Public read active members" ON public.members;
    DROP POLICY IF EXISTS "Members read posts" ON public.posts;
    DROP POLICY IF EXISTS "Members insert posts" ON public.posts;
    DROP POLICY IF EXISTS "Members read threads" ON public.forum_threads;
    DROP POLICY IF EXISTS "Members read messages" ON public.messages;
    DROP POLICY IF EXISTS "Members insert messages" ON public.messages;
    DROP POLICY IF EXISTS "Allow payment submissions" ON public.payments;
    DROP POLICY IF EXISTS "Allow read payments" ON public.payments;
END $$;

-- Public can read published events, settings, testimonials, and public businesses
CREATE POLICY "Public read published events" ON public.events FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Public read settings" ON public.admin_settings FOR SELECT USING (TRUE);
CREATE POLICY "Public read businesses" ON public.businesses FOR SELECT USING (is_public = TRUE);
CREATE POLICY "Public read active members" ON public.members FOR SELECT USING (status = 'active');

-- Members can read community posts, forum threads, messages
CREATE POLICY "Members read posts" ON public.posts FOR SELECT USING (is_hidden = FALSE);
CREATE POLICY "Members insert posts" ON public.posts FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Members read threads" ON public.forum_threads FOR SELECT USING (TRUE);
CREATE POLICY "Members read messages" ON public.messages FOR SELECT USING (TRUE);
CREATE POLICY "Members insert messages" ON public.messages FOR INSERT WITH CHECK (TRUE);

-- Payments: Anyone can insert payment proof; Read access for verification
CREATE POLICY "Allow payment submissions" ON public.payments FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow read payments" ON public.payments FOR SELECT USING (TRUE);

-- =========================================================================
-- INITIAL SEED DATA INSERTION
-- =========================================================================
INSERT INTO public.admin_settings (
    id, club_name, tagline, membership_fee, membership_duration_months, referral_percentage, upi_id, gpay_number
) VALUES (
    'global',
    'Salem Entrepreneurs Club',
    'Where Entrepreneurs Connect, Collaborate, Have Fun & Grow Together.',
    5000.00,
    12,
    10.00,
    'salementrepreneurs@okaxis',
    '+91 98427 88990'
) ON CONFLICT (id) DO UPDATE SET
    club_name = EXCLUDED.club_name,
    tagline = EXCLUDED.tagline,
    membership_fee = EXCLUDED.membership_fee,
    referral_percentage = EXCLUDED.referral_percentage,
    upi_id = EXCLUDED.upi_id,
    gpay_number = EXCLUDED.gpay_number;

INSERT INTO public.business_categories (id, name, description) VALUES
('it', 'IT & Software', 'Web, mobile, SaaS and cloud technology'),
('manufacturing', 'Manufacturing & Steel', 'Machinery, foundries, industrial goods'),
('textiles', 'Textile & Garments', 'Yarn, fabrics, readymade apparel'),
('realestate', 'Real Estate & Construction', 'Commercial, residential, civil contracts'),
('food', 'Food & Agriculture', 'Sago, mango processing, restaurants, organics'),
('healthcare', 'Healthcare & Pharma', 'Clinics, hospitals, medical supplies'),
('consulting', 'Consulting & Legal', 'Audit, legal, business strategy, tax'),
('marketing', 'Marketing & Media', 'Digital marketing, branding, printing')
ON CONFLICT (id) DO NOTHING;
