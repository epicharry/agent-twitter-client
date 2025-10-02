/**
 * Twitter Media Scraper Integration for Electron Apps
 *
 * This file provides a standalone integration for scraping Twitter media
 * (images and videos) from user profiles.
 *
 * Installation:
 * 1. Copy this file to your Electron project
 * 2. Install dependencies: npm install agent-twitter-client
 * 3. Import and use in your Electron main or renderer process
 */

const { Scraper } = require('agent-twitter-client');

class TwitterMediaScraper {
  constructor() {
    this.scraper = new Scraper();
    this.isAuthenticated = false;
  }

  /**
   * Authenticate with Twitter using cookies
   * @param {Array} cookies - Array of cookie objects with name, value, domain, path
   * @returns {Promise<boolean>} - Authentication success status
   */
  async authenticate(cookies) {
    try {
      await this.scraper.setCookies(cookies);

      // Verify authentication
      const isLoggedIn = await this.scraper.isLoggedIn();
      this.isAuthenticated = isLoggedIn;

      return isLoggedIn;
    } catch (error) {
      console.error('Authentication failed:', error);
      this.isAuthenticated = false;
      return false;
    }
  }

  /**
   * Get media (images and videos) from a Twitter user's profile
   * @param {string} username - Twitter username (without @)
   * @param {number} maxTweets - Maximum number of tweets to fetch (default: 200)
   * @returns {Promise<Array>} - Array of media objects
   */
  async getProfileMedia(username, maxTweets = 200) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated. Call authenticate() first.');
    }

    const mediaItems = [];

    try {
      const tweetIterator = await this.scraper.getTweets(username, maxTweets);

      for await (const tweet of tweetIterator) {
        const mediaItem = {
          tweetId: tweet.id,
          tweetUrl: tweet.permanentUrl,
          username: tweet.username,
          text: tweet.text,
          timestamp: tweet.timestamp,
          likes: tweet.likes,
          retweets: tweet.retweets,
          images: [],
          videos: []
        };

        // Extract images
        if (tweet.photos && tweet.photos.length > 0) {
          mediaItem.images = tweet.photos.map(photo => ({
            url: photo.url.replace('&name=small', '&name=large'), // Get high quality
            urlOriginal: photo.url.replace('&name=small', '&name=orig') // Original quality
          }));
        }

        // Extract videos
        if (tweet.videos && tweet.videos.length > 0) {
          mediaItem.videos = tweet.videos.map(video => ({
            url: video.url.split('?')[0], // Clean URL
            thumbnailUrl: video.preview
          }));
        }

        // Only include tweets with media
        if (mediaItem.images.length > 0 || mediaItem.videos.length > 0) {
          mediaItems.push(mediaItem);
        }
      }

      return mediaItems;
    } catch (error) {
      console.error('Error fetching profile media:', error);
      throw error;
    }
  }

  /**
   * Get media from a user's liked tweets
   * @param {string} username - Twitter username (without @)
   * @param {number} maxTweets - Maximum number of liked tweets to fetch
   * @returns {Promise<Array>} - Array of media objects
   */
  async getLikedMedia(username, maxTweets = 200) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated. Call authenticate() first.');
    }

    const mediaItems = [];

    try {
      const likedIterator = await this.scraper.getLikedTweets(username, maxTweets);

      for await (const tweet of likedIterator) {
        const mediaItem = {
          tweetId: tweet.id,
          tweetUrl: tweet.permanentUrl,
          username: tweet.username,
          text: tweet.text,
          timestamp: tweet.timestamp,
          likes: tweet.likes,
          retweets: tweet.retweets,
          images: [],
          videos: []
        };

        if (tweet.photos && tweet.photos.length > 0) {
          mediaItem.images = tweet.photos.map(photo => ({
            url: photo.url.replace('&name=small', '&name=large'),
            urlOriginal: photo.url.replace('&name=small', '&name=orig')
          }));
        }

        if (tweet.videos && tweet.videos.length > 0) {
          mediaItem.videos = tweet.videos.map(video => ({
            url: video.url.split('?')[0],
            thumbnailUrl: video.preview
          }));
        }

        if (mediaItem.images.length > 0 || mediaItem.videos.length > 0) {
          mediaItems.push(mediaItem);
        }
      }

      return mediaItems;
    } catch (error) {
      console.error('Error fetching liked media:', error);
      throw error;
    }
  }

  /**
   * Search for tweets with media by keyword
   * @param {string} query - Search query
   * @param {number} maxTweets - Maximum tweets to fetch
   * @returns {Promise<Array>} - Array of media objects
   */
  async searchMedia(query, maxTweets = 50) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated. Call authenticate() first.');
    }

    const mediaItems = [];

    try {
      const searchIterator = this.scraper.searchTweets(query, maxTweets, 'Latest');

      for await (const tweet of searchIterator) {
        const mediaItem = {
          tweetId: tweet.id,
          tweetUrl: tweet.permanentUrl,
          username: tweet.username,
          text: tweet.text,
          timestamp: tweet.timestamp,
          likes: tweet.likes,
          retweets: tweet.retweets,
          images: [],
          videos: []
        };

        if (tweet.photos && tweet.photos.length > 0) {
          mediaItem.images = tweet.photos.map(photo => ({
            url: photo.url.replace('&name=small', '&name=large'),
            urlOriginal: photo.url.replace('&name=small', '&name=orig')
          }));
        }

        if (tweet.videos && tweet.videos.length > 0) {
          mediaItem.videos = tweet.videos.map(video => ({
            url: video.url.split('?')[0],
            thumbnailUrl: video.preview
          }));
        }

        if (mediaItem.images.length > 0 || mediaItem.videos.length > 0) {
          mediaItems.push(mediaItem);
        }
      }

      return mediaItems;
    } catch (error) {
      console.error('Error searching media:', error);
      throw error;
    }
  }

  /**
   * Logout and clear session
   */
  async logout() {
    try {
      await this.scraper.logout();
      this.isAuthenticated = false;
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}

// Example usage for Electron
async function example() {
  const mediaScraper = new TwitterMediaScraper();

  // Cookie format - get these from your browser's Twitter session
  const cookies = [
    {
      name: 'auth_token',
      value: 'your_auth_token_here',
      domain: '.twitter.com',
      path: '/',
      secure: true,
      httpOnly: true
    },
    {
      name: 'ct0',
      value: 'your_ct0_token_here',
      domain: '.twitter.com',
      path: '/',
      secure: true,
      httpOnly: false
    }
    // Add other required cookies
  ];

  // Authenticate
  const isAuth = await mediaScraper.authenticate(cookies);
  if (!isAuth) {
    console.error('Authentication failed');
    return;
  }

  // Get media from a profile
  const profileMedia = await mediaScraper.getProfileMedia('username', 100);
  console.log(`Found ${profileMedia.length} media items`);

  // Get media from liked tweets
  const likedMedia = await mediaScraper.getLikedMedia('username', 50);
  console.log(`Found ${likedMedia.length} liked media items`);

  // Search for media
  const searchResults = await mediaScraper.searchMedia('cats filter:media', 20);
  console.log(`Found ${searchResults.length} media items in search`);

  // Logout
  await mediaScraper.logout();
}

module.exports = TwitterMediaScraper;
