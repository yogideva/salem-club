import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { INITIAL_SETTINGS } from '@/lib/mockData';
import { sanitizeInput } from '@/lib/security';

const SETTINGS_FILE = path.join(process.cwd(), 'src', 'data', 'settings.json');

function readSettingsFromFile() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading settings file:', err);
  }
  return INITIAL_SETTINGS;
}

function writeSettingsToFile(settings: any) {
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing settings file:', err);
    return false;
  }
}

// GET: Fetch current global settings (for mobile and desktop synchronization)
export async function GET() {
  const settings = readSettingsFromFile();
  return NextResponse.json(settings, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
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
      membershipFee: Number(body.membershipFee) || current.membershipFee,
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
      updatedAt: new Date().toISOString(),
    };

    writeSettingsToFile(updated);

    return NextResponse.json({
      success: true,
      settings: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
