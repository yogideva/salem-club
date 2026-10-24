import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const EVENTS_FILE = path.join(process.cwd(), 'src', 'data', 'events.json');

function readEventsFromFile() {
  try {
    if (fs.existsSync(EVENTS_FILE)) {
      const data = fs.readFileSync(EVENTS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading events file:', err);
  }
  return [];
}

function writeEventsToFile(events: any) {
  try {
    const dir = path.dirname(EVENTS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing events file:', err);
    return false;
  }
}

export async function GET() {
  const events = readEventsFromFile();
  return NextResponse.json(events, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let events = readEventsFromFile();

    if (Array.isArray(body)) {
      events = body;
    } else if (body.id) {
      // Upsert event
      const index = events.findIndex((e: any) => e.id === body.id);
      if (index >= 0) {
        events[index] = { ...events[index], ...body };
      } else {
        events = [body, ...events];
      }
    }

    writeEventsToFile(events);
    return NextResponse.json({ success: true, events });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to save event' },
      { status: 500 }
    );
  }
}
