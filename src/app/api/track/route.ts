import { NextResponse } from 'next/server';
import { trackExtension, getAllExtensionsWithHistory } from '@/lib/db';
import * as cheerio from 'cheerio';

// Endpoint to manually add a URL to tracking
export async function POST(req: Request) {
    try {
        const { url } = await req.json();
        if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 });

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });
        const html = await response.text();
        const $ = cheerio.load(html);

        // Support modern CWS URL formats
        const title = $('meta[property="og:title"]').attr('content') || $('title').text() || 'Unknown Title';
        const bodyText = $('body').text();
        const usersMatch = bodyText.match(/([\d,]+)\s*\+?\s*users/i) || bodyText.match(/([\d,]+)\s*users/i);
        const users = usersMatch ? usersMatch[1] : '0';

        const ext = await trackExtension(url, title, users);

        // Note: We disabled the dummy data generator since Supabase doesn't need it. 
        // It will show real data starting from today.

        return NextResponse.json({ success: true, item: ext });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// Endpoint to list all tracked extensions
export async function GET() {
    try {
        const extensions = await getAllExtensionsWithHistory();
        return NextResponse.json({ extensions });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
