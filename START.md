# Twitter Scraper Web App

## Quick Start

### 1. Start the App
```bash
npm run dev
```

The app will open on http://localhost:5173

### 2. Using the App

1. Open http://localhost:5173 in your browser
2. Paste your Twitter cookies in JSON format (see cookies.json for example format)
3. Click "Connect" to authenticate
4. Select "Fetch Profile Tweets" from the dashboard
5. Enter a Twitter username and max number of tweets
6. Click "Start Fetching" to scrape tweets
7. Export the results:
   - **Export Tweets JSON** - Full tweet data
   - **Export Images Only** - Just image URLs in high resolution
   - **Export Videos Only** - Just video URLs
   - **Export Images + Videos** - Combined media URLs

## Project Structure

- `/client` - Main application (Vite + React + TypeScript)
- `/client/api` - API routes for tweet fetching
- `/src` - Twitter scraper library source code
- `/dist` - Compiled scraper library

## Notes

- Cookies should be in the format shown in cookies.json
- The scraper uses the agent-twitter-client library
- All scraped data can be exported as JSON files
- Images are exported in high resolution format
- Videos are exported without query parameters
