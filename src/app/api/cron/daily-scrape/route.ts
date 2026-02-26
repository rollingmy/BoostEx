import { NextResponse } from 'next/server';
import { getAllExtensionsWithHistory, trackExtension } from '@/lib/db';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    // Optional: check for cron secret auth here to secure it
    // if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    try {
        const extensions = await getAllExtensionsWithHistory();
        let updatedCount = 0;

        for (const ext of extensions) {
            try {
                const response = await fetch(ext.url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
                        'Accept-Language': 'en-US,en;q=0.9',
                    }
                });

                if (!response.ok) continue;

                const html = await response.text();
                const $ = cheerio.load(html);

                const title = $('meta[property="og:title"]').attr('content') || $('title').text() || ext.title;
                const bodyText = $('body').text();
                const usersMatch = bodyText.match(/([\d,]+)\s*\+?\s*users/i) || bodyText.match(/([\d,]+)\s*users/i);
                const users = usersMatch ? usersMatch[1] : '0';

                await trackExtension(ext.url, title, users);
                updatedCount++;
            } catch (err) {
                console.error(`Failed to scrape ${ext.url}:`, err);
            }
        }

        return NextResponse.json({ success: true, updatedCount });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
