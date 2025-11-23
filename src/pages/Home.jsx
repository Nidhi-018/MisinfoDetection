import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Tag from '../components/Tag';
import './Home.css';

const Home = () => {
  // Mock data
  const stats = {
    totalScans: 1250,
    realDetected: 892,
    fakeDetected: 358,
    userScore: 87
  };

  const recentVerifications = [
    { id: 1, type: 'image', result: 'Real', score: 92, time: '2 hours ago' },
    { id: 2, type: 'text', result: 'Fake', score: 34, time: '5 hours ago' },
    { id: 3, type: 'url', result: 'Real', score: 88, time: '1 day ago' },
    { id: 4, type: 'image', result: 'Real', score: 91, time: '2 days ago' }
  ];

  const getResultVariant = (result) => {
    return result === 'Real' ? 'success' : 'danger';
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-content">
          <h1 className="home-hero-title">
            Detect Misinformation with
            <span className="home-hero-gradient"> AI-Powered Analysis</span>
          </h1>
          <p className="home-hero-description">
            Verify the credibility of images, text, and URLs using advanced multimodal AI.
            Protect yourself and others from misinformation.
          </p>
          <div className="home-hero-actions">
            <Link to="/analyze">
              <Button size="large" variant="primary">
                Start Analysis
              </Button>
            </Link>
            <Link to="/challenge">
              <Button size="large" variant="outline">
                Play Real or Fake Challenge
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Overview Cards */}
      <section className="home-stats">
        <Card hover className="home-stat-card">
          <div className="home-stat-icon">📊</div>
          <div className="home-stat-content">
            <h3 className="home-stat-value">{stats.totalScans.toLocaleString()}</h3>
            <p className="home-stat-label">Total Scans</p>
          </div>
        </Card>

        <Card hover className="home-stat-card">
          <div className="home-stat-icon">✅</div>
          <div className="home-stat-content">
            <h3 className="home-stat-value">{stats.realDetected}</h3>
            <p className="home-stat-label">Real Detected</p>
          </div>
        </Card>

        <Card hover className="home-stat-card">
          <div className="home-stat-icon">⚠️</div>
          <div className="home-stat-content">
            <h3 className="home-stat-value">{stats.fakeDetected}</h3>
            <p className="home-stat-label">Fake Detected</p>
          </div>
        </Card>

        <Card hover className="home-stat-card">
          <div className="home-stat-icon">⭐</div>
          <div className="home-stat-content">
            <h3 className="home-stat-value">{stats.userScore}</h3>
            <p className="home-stat-label">Your Score</p>
          </div>
        </Card>
      </section>

      {/* Recent Verifications */}
      <section className="home-recent">
        <h2 className="home-section-title">Recent Verifications</h2>
        <div className="home-recent-list">
          {recentVerifications.map(item => (
            <Card key={item.id} hover className="home-recent-item">
              <div className="home-recent-type">
                {item.type === 'image' && '🖼️'}
                {item.type === 'text' && '📝'}
                {item.type === 'url' && '🔗'}
                <span className="home-recent-type-text">{item.type.toUpperCase()}</span>
              </div>
              <div className="home-recent-info">
                <div className="home-recent-header">
                  <Tag variant={getResultVariant(item.result)}>
                    {item.result}
                  </Tag>
                  <span className="home-recent-score">Score: {item.score}</span>
                </div>
                <p className="home-recent-time">{item.time}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;

