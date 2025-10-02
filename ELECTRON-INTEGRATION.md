# Twitter Media Scraper - Electron Integration Guide

This guide shows how to integrate Twitter media scraping into your Electron desktop app.

## Installation

### Option 1: Using NPM Package (Recommended)

```bash
npm install agent-twitter-client
```

Then copy `electron-integration.js` to your project.

### Option 2: Manual Integration

Copy these files to your Electron project:
- `/dist/node/cjs/index.cjs` - The compiled library
- `electron-integration.js` - Integration wrapper

Install these dependencies:
```bash
npm install @sinclair/typebox headers-polyfill json-stable-stringify otpauth set-cookie-parser tough-cookie tslib
```

## Usage in Electron

### Main Process (IPC Handler)

```javascript
// main.js
const { ipcMain } = require('electron');
const TwitterMediaScraper = require('./electron-integration');

const scraper = new TwitterMediaScraper();

// Authenticate
ipcMain.handle('twitter:authenticate', async (event, cookies) => {
  return await scraper.authenticate(cookies);
});

// Get profile media
ipcMain.handle('twitter:getProfileMedia', async (event, username, maxTweets) => {
  return await scraper.getProfileMedia(username, maxTweets);
});

// Get liked media
ipcMain.handle('twitter:getLikedMedia', async (event, username, maxTweets) => {
  return await scraper.getLikedMedia(username, maxTweets);
});

// Search media
ipcMain.handle('twitter:searchMedia', async (event, query, maxTweets) => {
  return await scraper.searchMedia(query, maxTweets);
});

// Logout
ipcMain.handle('twitter:logout', async () => {
  return await scraper.logout();
});
```

### Renderer Process

```javascript
// renderer.js or your React/Vue component
const { ipcRenderer } = require('electron');

// Authenticate with Twitter
async function authenticateTwitter(cookies) {
  const isAuthenticated = await ipcRenderer.invoke('twitter:authenticate', cookies);
  return isAuthenticated;
}

// Get media from a user's profile
async function getProfileMedia(username, maxTweets = 200) {
  const media = await ipcRenderer.invoke('twitter:getProfileMedia', username, maxTweets);
  return media;
}

// Get media from liked tweets
async function getLikedMedia(username, maxTweets = 200) {
  const media = await ipcRenderer.invoke('twitter:getLikedMedia', username, maxTweets);
  return media;
}

// Search for tweets with media
async function searchMedia(query, maxTweets = 50) {
  const media = await ipcRenderer.invoke('twitter:searchMedia', query, maxTweets);
  return media;
}

// Example usage
async function loadTwitterMedia() {
  // Cookie format from your browser
  const cookies = [
    {
      name: 'auth_token',
      value: 'your_token_here',
      domain: '.twitter.com',
      path: '/',
      secure: true,
      httpOnly: true
    },
    {
      name: 'ct0',
      value: 'your_ct0_here',
      domain: '.twitter.com',
      path: '/',
      secure: true,
      httpOnly: false
    }
  ];

  // Authenticate
  const isAuth = await authenticateTwitter(cookies);
  if (!isAuth) {
    console.error('Failed to authenticate');
    return;
  }

  // Get media
  const media = await getProfileMedia('elonmusk', 100);

  // Display images in your app
  media.forEach(item => {
    item.images.forEach(image => {
      console.log('Image URL:', image.url);
      // Display in your Electron UI
    });

    item.videos.forEach(video => {
      console.log('Video URL:', video.url);
      // Display in your Electron UI
    });
  });
}
```

## Getting Twitter Cookies

### Method 1: Browser DevTools

1. Log into Twitter in your browser
2. Open DevTools (F12)
3. Go to Application/Storage → Cookies → https://twitter.com
4. Copy these cookies:
   - `auth_token`
   - `ct0`
   - `guest_id`

### Method 2: Export from cookies.json file

Use the format in `cookies.json`:

```json
[
  {
    "domain": ".twitter.com",
    "expirationDate": 1234567890,
    "hostOnly": false,
    "httpOnly": true,
    "name": "auth_token",
    "path": "/",
    "sameSite": "no_restriction",
    "secure": true,
    "session": false,
    "storeId": null,
    "value": "your_auth_token_value_here"
  },
  {
    "domain": ".twitter.com",
    "expirationDate": 1234567890,
    "hostOnly": false,
    "httpOnly": false,
    "name": "ct0",
    "path": "/",
    "sameSite": "lax",
    "secure": true,
    "session": false,
    "storeId": null,
    "value": "your_ct0_value_here"
  }
]
```

## Media Object Structure

Each media item returned has this structure:

```javascript
{
  tweetId: "1234567890",
  tweetUrl: "https://twitter.com/user/status/1234567890",
  username: "username",
  text: "Tweet text content",
  timestamp: 1234567890000,
  likes: 42,
  retweets: 10,
  images: [
    {
      url: "https://pbs.twimg.com/media/xxx?name=large",      // High quality
      urlOriginal: "https://pbs.twimg.com/media/xxx?name=orig" // Original quality
    }
  ],
  videos: [
    {
      url: "https://video.twimg.com/xxx.mp4",
      thumbnailUrl: "https://pbs.twimg.com/xxx.jpg"
    }
  ]
}
```

## Features

- **Profile Media**: Scrape all images/videos from a user's tweets
- **Liked Media**: Get media from tweets a user has liked
- **Search Media**: Search Twitter for tweets with media
- **High Quality**: Automatically fetches high/original quality images
- **Rate Limit Handling**: Built-in retry logic for API limits
- **Authentication**: Secure cookie-based authentication

## Error Handling

```javascript
try {
  const media = await getProfileMedia('username', 100);
  console.log('Success:', media);
} catch (error) {
  if (error.message.includes('Not authenticated')) {
    // Handle authentication error
    console.error('Please authenticate first');
  } else if (error.message.includes('rate limit')) {
    // Handle rate limiting
    console.error('Rate limited, please wait');
  } else {
    console.error('Error:', error);
  }
}
```

## Best Practices

1. **Store Cookies Securely**: Use Electron's `safeStorage` API to encrypt cookies
2. **Cache Media**: Store scraped media locally to reduce API calls
3. **Handle Rate Limits**: Implement exponential backoff when rate limited
4. **User Privacy**: Respect Twitter's terms of service and user privacy
5. **Error Boundaries**: Wrap API calls in try-catch blocks

## Downloading Media

To download images/videos in your Electron app:

```javascript
const fs = require('fs');
const path = require('path');
const https = require('https');

async function downloadMedia(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(outputPath);
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
}

// Usage
const media = await getProfileMedia('username', 50);
for (const item of media) {
  for (const image of item.images) {
    const filename = `${item.tweetId}_${Date.now()}.jpg`;
    const filepath = path.join(app.getPath('downloads'), filename);
    await downloadMedia(image.urlOriginal, filepath);
    console.log('Downloaded:', filepath);
  }
}
```

## Troubleshooting

### Authentication Fails
- Verify cookies are valid and not expired
- Check that all required cookies are provided
- Ensure cookies are from twitter.com domain

### No Media Found
- User may have no media tweets
- Increase `maxTweets` parameter
- Check user's profile visibility settings

### Rate Limiting
- Reduce scraping frequency
- Implement delays between requests
- Use smaller `maxTweets` values

## Additional Resources

- See `client/api/fetch-tweets.js` for backend API implementation
- See `client/src/components/ProfileTweetsFetcher.tsx` for UI example
- Check Twitter's API documentation for rate limits
