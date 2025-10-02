import { useState } from 'react';
import './ProfileTweetsFetcher.css';

interface ProfileTweetsFetcherProps {
  cookies: string[];
}

interface Tweet {
  id: string;
  text: string;
  createdAt: string;
  [key: string]: any;
}

function ProfileTweetsFetcher({ cookies }: ProfileTweetsFetcherProps) {
  const [username, setUsername] = useState('');
  const [maxTweets, setMaxTweets] = useState(100);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  const handleFetch = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setIsLoading(true);
    setError('');
    setProgress('Initializing scraper...');
    setTweets([]);

    try {
      const response = await fetch('/api/fetch-tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          maxTweets,
          cookies,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch tweets');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Stream not supported');
      }

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'progress') {
              setProgress(data.message);
            } else if (data.type === 'tweet') {
              setTweets(prev => [...prev, data.tweet]);
            } else if (data.type === 'complete') {
              setProgress(`Completed! Fetched ${data.count} tweets`);
            } else if (data.type === 'error') {
              setError(data.message);
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tweets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(tweets, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${username}_tweets.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportImages = () => {
    const imageLinks: string[] = [];

    tweets.forEach(tweet => {
      if (tweet.photos && Array.isArray(tweet.photos)) {
        tweet.photos.forEach((photo: any) => {
          if (photo.url) {
            const baseUrl = photo.url.split('?')[0];
            const highResUrl = `${baseUrl}?format=jpg&name=large`;
            imageLinks.push(highResUrl);
          }
        });
      }
    });

    const dataStr = JSON.stringify(imageLinks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${username}_images.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="profile-tweets-fetcher">
      <h2>Fetch Profile Tweets</h2>

      <div className="input-section">
        <div className="form-group">
          <label>Twitter Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g., elonmusk"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>Max Tweets to Fetch:</label>
          <input
            type="number"
            value={maxTweets}
            onChange={(e) => setMaxTweets(Number(e.target.value))}
            min="1"
            max="10000"
            disabled={isLoading}
          />
        </div>

        <button
          className="btn-fetch"
          onClick={handleFetch}
          disabled={isLoading}
        >
          {isLoading ? 'Fetching...' : 'Start Fetching'}
        </button>
      </div>

      {progress && (
        <div className="progress-box">
          {progress}
        </div>
      )}

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {tweets.length > 0 && (
        <div className="results-section">
          <div className="results-header">
            <h3>Fetched {tweets.length} tweets</h3>
            <div className="export-buttons">
              <button className="btn-export" onClick={handleExport}>
                Export Tweets JSON
              </button>
              <button className="btn-export" onClick={handleExportImages}>
                Export Images Only
              </button>
            </div>
          </div>

          <div className="tweets-preview">
            {tweets.slice(0, 10).map((tweet, idx) => (
              <div key={idx} className="tweet-card">
                <div className="tweet-text">{tweet.text}</div>
                <div className="tweet-meta">
                  {tweet.createdAt && new Date(tweet.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
            {tweets.length > 10 && (
              <div className="more-tweets">
                +{tweets.length - 10} more tweets (export to see all)
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileTweetsFetcher;
