import { useState } from 'react';
import './App.css';
import CookieAuth from './components/CookieAuth';
import Dashboard from './components/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cookies, setCookies] = useState<string[]>([]);

  const handleAuthSuccess = (cookieStrings: string[]) => {
    setCookies(cookieStrings);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setCookies([]);
    setIsAuthenticated(false);
  };

  return (
    <div className="app">
      {!isAuthenticated ? (
        <CookieAuth onAuthSuccess={handleAuthSuccess} />
      ) : (
        <Dashboard cookies={cookies} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
