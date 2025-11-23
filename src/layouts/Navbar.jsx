import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-icon">🛡️</span>
          <span className="navbar-logo-text">TruthGuard</span>
        </Link>

        <div className="navbar-links">
          <Link 
            to="/" 
            className={`navbar-link ${isActive('/') ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/analyze" 
            className={`navbar-link ${isActive('/analyze') ? 'active' : ''}`}
          >
            Analyze
          </Link>
          <Link 
            to="/challenge" 
            className={`navbar-link ${isActive('/challenge') ? 'active' : ''}`}
          >
            Challenge
          </Link>
          <Link 
            to="/leaderboard" 
            className={`navbar-link ${isActive('/leaderboard') ? 'active' : ''}`}
          >
            Leaderboard
          </Link>
          <Link 
            to="/history" 
            className={`navbar-link ${isActive('/history') ? 'active' : ''}`}
          >
            History
          </Link>
        </div>

        <div className="navbar-actions">
          <button 
            className="navbar-theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button 
            className="navbar-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="navbar-mobile-menu">
          <Link 
            to="/" 
            className={`navbar-mobile-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link 
            to="/analyze" 
            className={`navbar-mobile-link ${isActive('/analyze') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Analyze
          </Link>
          <Link 
            to="/challenge" 
            className={`navbar-mobile-link ${isActive('/challenge') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Challenge
          </Link>
          <Link 
            to="/leaderboard" 
            className={`navbar-mobile-link ${isActive('/leaderboard') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Leaderboard
          </Link>
          <Link 
            to="/history" 
            className={`navbar-mobile-link ${isActive('/history') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            History
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

