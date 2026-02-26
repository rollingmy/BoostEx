const cheerio = require('cheerio');

async function test() {
    const url = "https://chromewebstore.google.com/detail/google-translate/aapbdbdomjkkjkaonfhkkikfgjllcleb";
    console.log(`Fetching ${url}...`);
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });

        const html = await response.text();
        const $ = cheerio.load(html);

        const title = $('meta[property="og:title"]').attr('content') || $('title').text();
        const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';

        const bodyText = $('body').text();
        const usersMatch = bodyText.match(/([\d,]+)\s*\+?\s*users/i) || bodyText.match(/([\d,]+)\s*users/i);
        const users = usersMatch ? usersMatch[1] : 'Unknown';

        console.log("Title:", title);
        console.log("Description length:", description.length);
        console.log("Users:", users);

        if (title && description) {
            console.log("✅ Scraping basic fields successful");
        } else {
            console.log("❌ Failed to scrape basic fields");
        }
    } catch (e) {
        console.error("Test error:", e);
    }
}
test();
