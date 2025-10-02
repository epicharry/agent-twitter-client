# Twitter Scraper Web App

## Quick Start

### 1. Start the Backend Server
```bash
npm run server
```

The server will start on http://localhost:3001

### 2. Start the Frontend (in a new terminal)
```bash
cd client
npm run dev
```

The app will open on http://localhost:5173

### 3. Using the App

1. Open http://localhost:5173 in your browser
2. Paste your Twitter cookies in JSON format (see cookies.json for example format)
3. Click "Connect" to authenticate
4. Select "Fetch Profile Tweets" from the dashboard
5. Enter a Twitter username and max number of tweets
6. Click "Start Fetching" to scrape tweets
7. Export the results as JSON when complete

## Project Structure

- `/client` - React frontend (Vite + TypeScript)
- `/server.js` - Express API server
- `/src` - Twitter scraper library source code
- `/dist` - Compiled scraper library

## Notes

- Cookies should be in the format shown in cookies.json
- The scraper uses the agent-twitter-client library
- All scraped data can be exported as JSON files
