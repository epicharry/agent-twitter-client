const express = require('express');
const cors = require('cors');
const { Scraper } = require('./dist/node/cjs/index.cjs');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/api/fetch-tweets', async (req, res) => {
  const { username, maxTweets, cookies } = req.body;

  if (!username || !cookies || !Array.isArray(cookies)) {
    return res.status(400).json({ error: 'Invalid request parameters' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = (type, data) => {
    res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
  };

  try {
    const scraper = new Scraper();
    await scraper.setCookies(cookies);

    sendEvent('progress', { message: `Fetching tweets for @${username}...` });

    const tweetIterator = await scraper.getTweets(username, 100);
    let tweets = [];
    let count = 0;

    for await (const tweet of tweetIterator) {
      tweets.push(tweet);
      count++;

      sendEvent('tweet', { tweet });

      if (count % 10 === 0) {
        sendEvent('progress', { message: `Fetched ${count} tweets...` });
      }

      if (count >= maxTweets) {
        break;
      }
    }

    sendEvent('complete', { count });
    res.end();
  } catch (error) {
    console.error('Error fetching tweets:', error);
    sendEvent('error', { message: error.message || 'Failed to fetch tweets' });
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
