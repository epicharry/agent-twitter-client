import { useState } from 'react';
import './CookieAuth.css';

interface CookieAuthProps {
  onAuthSuccess: (cookieStrings: string[]) => void;
}

function CookieAuth({ onAuthSuccess }: CookieAuthProps) {
  const [cookieJson, setCookieJson] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    try {
      setError('');
      const cookies = JSON.parse(cookieJson);

      if (!Array.isArray(cookies)) {
        setError('Invalid format: Expected an array of cookies');
        return;
      }

      const cookieStrings = cookies.map((c: any) => {
        let domain = (c.domain || '')
          .replace('.x.com', '.twitter.com')
          .replace('x.com', 'twitter.com');
        let parts = [`${c.key || c.name}=${c.value}`];
        if (domain) parts.push(`Domain=${domain}`);
        if (c.path) parts.push(`Path=${c.path}`);
        if (c.secure) parts.push('Secure');
        if (c.httpOnly) parts.push('HttpOnly');
        return parts.join('; ');
      });

      onAuthSuccess(cookieStrings);
    } catch (err) {
      setError('Invalid JSON format. Please check your cookies.json');
    }
  };

  const loadExample = () => {
    const example = [
      {
        "name": "auth_token",
        "value": "your_auth_token_here",
        "domain": ".twitter.com",
        "path": "/",
        "secure": true,
        "httpOnly": true
      },
      {
        "name": "ct0",
        "value": "your_ct0_token_here",
        "domain": ".twitter.com",
        "path": "/",
        "secure": true,
        "httpOnly": false
      }
    ];
    setCookieJson(JSON.stringify(example, null, 2));
  };

  return (
    <div className="cookie-auth">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🐦</div>
          <h1>Twitter Scraper</h1>
          <p className="subtitle">Enter your Twitter cookies to get started</p>
        </div>

        <div className="form-group">
          <label>Paste your cookies.json content:</label>
          <textarea
            value={cookieJson}
            onChange={(e) => setCookieJson(e.target.value)}
            placeholder="Paste your cookies array here..."
            rows={12}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="button-group">
          <button className="btn-primary" onClick={handleSubmit}>
            Connect
          </button>
          <button className="btn-secondary" onClick={loadExample}>
            Load Example
          </button>
        </div>

        <div className="info-box">
          <p><strong>How to get your cookies:</strong></p>
          <ol>
            <li>Open Twitter/X in your browser and login</li>
            <li>Open Developer Tools (F12)</li>
            <li>Go to Application/Storage tab</li>
            <li>Find Cookies and export as JSON</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default CookieAuth;
