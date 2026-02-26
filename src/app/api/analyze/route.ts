import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Example mapping since CWS is heavily dynamic, we might need specific selectors
        // This is a basic CHEERIO scrape. Note: Google CWS uses modern react, so basic HTML fetch might not give all data.
        // However, basic meta tags are usually present for SEO. 
        // We fetch the raw HTML.

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch the URL' }, { status: response.status });
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Meta tags are the most reliable way to extract data without relying on obfuscated CSS classes
        const title = $('meta[property="og:title"]').attr('content') || $('title').text() || 'Unknown Title';
        const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
        const image = $('meta[property="og:image"]').attr('content');

        // Trying to extract user count and rating (these are harder, might require regex on the HTML body if meta isn\'t enough)
        // Often, user counts are buried in spans. We'll do a basic regex over the text as a fallback
        const bodyText = $('body').text();

        const usersMatch = bodyText.match(/([\d,]+)\s*\+?\s*users/i);
        const users = usersMatch ? usersMatch[1] : 'Unknown';

        const versionMatch = bodyText.match(/Version\s*([\d\.]+)/i);
        const version = versionMatch ? versionMatch[1] : 'Unknown';

        // Basic Keyword Density logic on Description
        const words = description.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
        const stopWords = new Set(['the', 'and', 'to', 'a', 'of', 'in', 'is', 'for', 'you', 'it', 'on', 'with', 'this', 'that', 'are', 'as', 'by', 'your', 'be', 'or', 'can', 'from', 'we']);

        const wordCounts: Record<string, number> = {};
        words.forEach(w => {
            if (w.length > 3 && !stopWords.has(w)) {
                wordCounts[w] = (wordCounts[w] || 0) + 1;
            }
        });

        const topKeywords = Object.entries(wordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word, count]) => ({ word, count }));

        return NextResponse.json({
            title,
            description,
            users,
            version,
            rating: "4.8", // Placeholder if we can't regex it easily immediately
            image,
            titleLength: title.length,
            descLength: description.length,
            keywords: topKeywords
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
