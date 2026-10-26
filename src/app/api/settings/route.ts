import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { INITIAL_SETTINGS } from '@/lib/mockData';
import { sanitizeInput } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SETTINGS_FILE = path.join(process.cwd(), 'src', 'data', 'settings.json');

// In-memory cache for ultra-fast response and serverless runtime persistence
let memoryCache: any = null;

function readSettingsFromFile() {
  if (memoryCache) {
    return memoryCache;
  }
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      memoryCache = { ...INITIAL_SETTINGS, ...parsed };
      return memoryCache;
    }
  } catch (err) {
    console.error('Error reading settings file:', err);
  }
  return INITIAL_SETTINGS;
}

function writeSettingsToFile(settings: any) {
  memoryCache = settings;
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing settings file (may be read-only runtime):', err);
    return false;
  }
}

// GET: Fetch current global settings (for mobile and desktop synchronization)
export async function GET() {
  const settings = readSettingsFromFile();
  return NextResponse.json(settings, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

// POST: Update settings from Admin panel
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const current = readSettingsFromFile();

    const updated = {
      ...current,
      ...body,
      clubName: sanitizeInput(body.clubName || current.clubName),
      tagline: sanitizeInput(body.tagline || current.tagline),
      logoUrl: body.logoUrl || current.logoUrl || '/images/sec-logo.png',
      membershipFee: Number(body.membershipFee) !== undefined && !isNaN(Number(body.membershipFee))
        ? Number(body.membershipFee)
        : current.membershipFee,
      membershipDurationMonths: Number(body.membershipDurationMonths) || current.membershipDurationMonths,
      referralPercentage: Number(body.referralPercentage) || current.referralPercentage,
      upiId: sanitizeInput(body.upiId || current.upiId),
      gpayNumber: sanitizeInput(body.gpayNumber || current.gpayNumber),
      qrCodeUrl: body.qrCodeUrl !== undefined ? body.qrCodeUrl : current.qrCodeUrl,
      paymentInstructions: sanitizeInput(body.paymentInstructions || current.paymentInstructions),
      contactPhone: sanitizeInput(body.contactPhone || current.contactPhone),
      whatsappNumber: sanitizeInput(body.whatsappNumber || current.whatsappNumber),
      contactEmail: sanitizeInput(body.contactEmail || current.contactEmail),
      contactAddress: sanitizeInput(body.contactAddress || current.contactAddress),
      instagramUrl: sanitizeInput(body.instagramUrl || current.instagramUrl || ''),
      linkedinUrl: sanitizeInput(body.linkedinUrl || current.linkedinUrl || ''),
      youtubeUrl: sanitizeInput(body.youtubeUrl || current.youtubeUrl || ''),
      facebookUrl: sanitizeInput(body.facebookUrl || current.facebookUrl || ''),
      aboutText: sanitizeInput(body.aboutText || current.aboutText || ''),
      missionText: sanitizeInput(body.missionText || current.missionText || ''),
      visionText: sanitizeInput(body.visionText || current.visionText || ''),
      termsText: sanitizeInput(body.termsText || current.termsText || ''),
      privacyText: sanitizeInput(body.privacyText || current.privacyText || ''),
      gamification: body.gamification || current.gamification,
      reminders: body.reminders || current.reminders,
      updatedAt: new Date().toISOString(),
    };

    writeSettingsToFile(updated);

    return NextResponse.json({
      success: true,
      settings: updated,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
