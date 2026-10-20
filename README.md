# SALEM ENTREPRENEURS CLUB (SEC)

> **Connect. Collaborate. Grow.**  
> The premier digital platform and Progressive Web App (PWA) for Salem's visionary entrepreneurs, industrial leaders, MSME founders, and innovators across Tamil Nadu.

---

## 🌟 Overview

**Salem Entrepreneurs Club (SEC)** is a private community web application and mobile-friendly PWA engineered to power business networking, peer masterminds, conclave registrations, verified business referrals, and community engagement.

Designed with a high-energy, premium gold-and-navy aesthetic (`#D4AF37` / `#0F172A`), this platform offers an all-in-one ecosystem for entrepreneurs to connect, collaborate, have fun, and accelerate mutual business growth.

---

## 🚀 Key Features

### 1. 🏛️ Public Experience
- **Interactive Landing Page**: Hero section with video/photo banners, Mission, Vision, and the 8 SEC Pillars (*Network, Business, Collaboration, Knowledge, Events, Fun, Visibility, Growth*).
- **Featured Directory Preview**: Privacy-guarded view of prominent member enterprises (Textiles, Sago, Steel, Mango Agro, IT, Foundry).
- **Upcoming Conclaves & Events**: Public calendar preview with category filters (*Masterclass, Networking, Dinner, Talk*).
- **Membership Application Wizard**: 3-step onboarding capturing applicant biodata, enterprise details, sponsor referral code, and dynamic UPI / GPay QR code payment submission.

### 2. 👥 Member Portal
- **SEC Member Directory**: Advanced search with category filters (*Textiles & Apparel, Food & Agro, IT & Software, Engineering, Healthcare, etc.*).
- **Comprehensive Member Profiles**: Products/services showcase, corporate posters, promo reels, social channels (WhatsApp, LinkedIn, Instagram, Facebook, YouTube), and contact cards.
- **Privacy Controls**: Custom visibility switches for phone, email, WhatsApp, and revenue metrics (*Public / Members Only / Admin Only*).
- **Digital Membership Card Pass**: Holographic gold-foil membership card with dynamic QR code generator, live status verification, and instant print/save.
- **Conclaves & Event Passes**: Event RSVP (*Attending, Maybe, Not Attending*), agenda timeline, speaker spotlights, and entry QR code for swift gate check-in.
- **Community Social Feed**: Post business milestones, promotional posters, event discussions, and announcements with applauds and threaded comments.
- **Discussion Forums**: Structured mastermind threads categorized into Business, Marketing, Sales, Finance, Startups, Technology, Investment, and Fun & Social.
- **Realtime Community Chat**: Fast community discussion lounge with media sharing, business card exchange, and instant replies.
- **Professional Connection Network**: Peer-to-peer connection requests (*Pending, Accepted, Connected*) mimicking LinkedIn tailored to local Salem business owners.
- **Referral Rewards Wallet**: Unique member referral code (e.g., `SEC-YOGI-001`) and direct link (`/join?ref=SEC-YOGI-001`). Real-time calculated commission (e.g., 10% of ₹5,000 = ₹500) with status tracking (*Pending, Approved, Paid*).
- **Gamification & Leaderboard**: Monthly Hall of Fame scoring points for referrals, event attendance, and forum contributions.

### 3. 🛡️ Admin Command Console
- **10 KPI Executive Dashboard**: Total members, active memberships, monthly revenue, pending approvals, conclave attendance, referral royalties, and platform engagement.
- **Member Management**: Approve/reject applicants, assign VIP badges, toggle directory visibility, and export full member rosters as CSV.
- **Conclave & Event Manager**: Create/edit events with venue GPS, dress codes, speaker rosters, fee structures, and **QR Gate Check-in Scanner** with duplicate attendance prevention.
- **Payment & UTR Verification**: Review UPI/GPay transaction screenshots, match UTR/Transaction reference IDs, approve memberships with one click, and export payment logs as CSV.
- **Referral Royalty Payouts**: Review earned member commissions, approve disbursements, mark as Paid with payout reference numbers, and export reports.
- **Content Management System (CMS)**: Live editing for Club Taglines, Mission & Vision statements, About Salem Entrepreneurs Club, Testimonials, and Event Gallery.
- **System Settings & Configuration**: Dynamic control over Membership Annual Fee (e.g. ₹5,000), Referral Commission % (e.g. 10%), UPI ID / GPay details, renewal reminder intervals, and gamification point weighting.
- **Audit Logging**: Immutable ledger of administrative actions (status overrides, approvals, fee adjustments).
- **Sector Analytics**: Visual breakdowns of member industries, monthly revenue trajectories, and top business referrers.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | **Next.js 16** (App Router, Turbopack, TypeScript) |
| **Styling & Design** | **Tailwind CSS** (Gold `#D4AF37`, Emerald, Sapphire palette) |
| **Icons & UI** | **Lucide React** + Custom SVG Social Icons (WhatsApp, Instagram, etc.) |
| **Database & Auth** | **Supabase** (PostgreSQL, Row Level Security, Storage, Edge Functions) |
| **PWA Engine** | Service Worker (`/sw.js`), Web App Manifest (`/manifest.json`), Offline Fallback |
| **QR Code Engine** | `qrcode` for digital card passes and gate check-in tickets |
| **Hosting & Deployment** | **Netlify** (`netlify.toml` preconfigured for Next.js) |

---

## 🔐 Demo Credentials & Quick Switcher

A quick **Demo Role Switcher** is embedded directly inside the top Navigation bar for effortless testing across all roles:

### 1. Admin Role
- **Login URL**: `/admin/login`
- **Email**: `admin@salementrepreneursclub.com`
- **Password**: `Admin@SEC2026`
- **One-Click Demo**: Click *"Autofill Demo Admin"* on the login page.

### 2. Member Roles
- **Login URL**: `/login`
- **Demo Account 1**: `saravanan@salemtextiles.com` (Yogananth Saravanan — Founder, Salem Royal Tex Mills)
- **Demo Account 2**: `priya@avantisago.com` (Dr. Priya Shanmugam — Director, Avanti Agro Foods)
- **Demo Account 3**: `rajesh@salemsteels.com` (Rajesh Kumar — Managing Partner, Salem Steels & Castings)

---

## 💻 Local Development Setup

### Prerequisites
- Node.js 18.x or 20.x
- npm or yarn

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/salem-entrepreneurs-club.git
   cd "salem entreprenaur club"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase project credentials (optional for mock testing; the app runs seamlessly out-of-the-box with reactive in-memory state):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   npm run start
   ```

---

## 🗄️ Supabase Database Setup

When you are ready to connect a live Supabase project:

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in the Supabase Dashboard.
3. Open `supabase/schema.sql` in this repo and execute the entire script.
4. The script automatically creates:
   - Tables: `members`, `events`, `event_registrations`, `payments`, `referrals`, `feed_posts`, `feed_comments`, `forum_threads`, `forum_replies`, `chat_messages`, `connections`, `admin_settings`, `audit_logs`.
   - Complete Row Level Security (RLS) policies.
   - Initial seed data tailored to Salem industries.
   - Automated triggers for updating member referral points and timestamp columns.

---

## ☁️ Netlify Deployment Guide

This repository includes a production-ready `netlify.toml` file configured for the Next.js runtime.

### Automatic Git Deployment
1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Log in to [Netlify](https://app.netlify.com) and click **"Add new site" > "Import an existing project"**.
3. Select your repository.
4. Build configuration is auto-detected from `netlify.toml`:
   - **Base directory**: `/`
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
5. Add Environment Variables in Netlify Dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click **Deploy Site**.

### Custom Domain Configuration (`sec.yourdomain.com`)
1. In Netlify, go to **Domain management** > **Add custom domain**.
2. Point your DNS CNAME record:
   - Host: `sec`
   - Value: `<your-site-name>.netlify.app`
3. Netlify will automatically provision a free Let's Encrypt SSL certificate.

---

## 📱 Progressive Web App (PWA)

Salem Entrepreneurs Club is configured as an installable Progressive Web App:
- **Manifest**: Located at `/public/manifest.json` with brand gold theme color, standalone display, and crisp icons.
- **Service Worker**: Located at `/public/sw.js` with offline caching and background sync support.
- **Installation Banner**: An automated prompt appears on mobile and desktop browsers allowing members to add the app to their home screen with a single tap.

---

## 🔒 Security & Privacy Architecture

- **No Hardcoded Credentials**: Role checks and sensitive permissions are validated server-side and through RLS policies.
- **Privacy Guards**: Phone numbers, emails, and WhatsApp contacts are hidden from public visitors and only accessible to logged-in members or when explicitly made public by the owner.
- **UTR Deduplication**: The payments and conclave check-in systems check for duplicate transaction IDs and duplicate check-in scans.
- **Admin Audit Trail**: Every sensitive change (membership approval, payment verification, commission payout) logs an entry to the immutable audit trail.

---

## 📄 License
Copyright © 2026 Salem Entrepreneurs Club. All rights reserved.
