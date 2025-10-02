import { useState } from 'react';
import './Dashboard.css';
import ProfileTweetsFetcher from './ProfileTweetsFetcher';

interface DashboardProps {
  cookies: string[];
  onLogout: () => void;
}

type Feature = 'profile-tweets' | null;

function Dashboard({ cookies, onLogout }: DashboardProps) {
  const [activeFeature, setActiveFeature] = useState<Feature>(null);

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Twitter Scraper Dashboard</h1>
          <button className="btn-logout" onClick={onLogout}>
            Logout
          </button>
        </header>

        {!activeFeature ? (
          <div className="features-grid">
            <div className="feature-card" onClick={() => setActiveFeature('profile-tweets')}>
              <div className="feature-icon">📝</div>
              <h3>Fetch Profile Tweets</h3>
              <p>Download all tweets from any Twitter profile</p>
            </div>

            <div className="feature-card disabled">
              <div className="feature-icon">🔍</div>
              <h3>Search Tweets</h3>
              <p>Coming soon</p>
            </div>

            <div className="feature-card disabled">
              <div className="feature-icon">👥</div>
              <h3>Get Followers</h3>
              <p>Coming soon</p>
            </div>

            <div className="feature-card disabled">
              <div className="feature-icon">📊</div>
              <h3>Trending Topics</h3>
              <p>Coming soon</p>
            </div>
          </div>
        ) : (
          <div className="feature-content">
            <button className="btn-back" onClick={() => setActiveFeature(null)}>
              ← Back to Features
            </button>

            {activeFeature === 'profile-tweets' && (
              <ProfileTweetsFetcher cookies={cookies} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
