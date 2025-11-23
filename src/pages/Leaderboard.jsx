import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Tag from '../components/Tag';
import { getLeaderboard } from '../services/api';
import './Leaderboard.css';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [filter]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await getLeaderboard(filter);
      if (response && response.data) {
        setLeaderboard(response.data);
      } else {
        setLeaderboard([]);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      setLeaderboard([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (badge) => {
    if (badge === 'gold') return '🥇';
    if (badge === 'silver') return '🥈';
    if (badge === 'bronze') return '🥉';
    return '⭐';
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return 'default';
  };

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h1 className="leaderboard-title">Leaderboard</h1>
        <p className="leaderboard-subtitle">Top verified players</p>
      </div>

      {/* Filters */}
      <div className="leaderboard-filters">
        <button
          className={`leaderboard-filter ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Time
        </button>
        <button
          className={`leaderboard-filter ${filter === 'weekly' ? 'active' : ''}`}
          onClick={() => setFilter('weekly')}
        >
          Weekly
        </button>
        <button
          className={`leaderboard-filter ${filter === 'daily' ? 'active' : ''}`}
          onClick={() => setFilter('daily')}
        >
          Daily
        </button>
      </div>

      {/* Leaderboard List */}
      {loading ? (
        <div className="leaderboard-loading">
          <div className="leaderboard-loading-spinner"></div>
          <p>Loading leaderboard...</p>
        </div>
      ) : (
        <Card className="leaderboard-card">
          <div className="leaderboard-list">
            {leaderboard.map((player, index) => {
              const rank = index + 1;
              return (
                <div
                  key={player.id}
                  className={`leaderboard-item ${rank <= 3 ? `leaderboard-top-${rank}` : ''}`}
                >
                  <div className="leaderboard-rank">
                    {rank <= 3 ? (
                      <span className="leaderboard-rank-icon">
                        {getBadgeIcon(player.badge)}
                      </span>
                    ) : (
                      <span className="leaderboard-rank-number">#{rank}</span>
                    )}
                  </div>
                  <div className="leaderboard-user">
                    <div className="leaderboard-username">{player.username}</div>
                    <div className="leaderboard-badges">
                      <Tag variant={getRankColor(rank)} size="small">
                        {getBadgeIcon(player.badge)} {player.badge}
                      </Tag>
                    </div>
                  </div>
                  <div className="leaderboard-stats">
                    <div className="leaderboard-stat">
                      <span className="leaderboard-stat-label">Score</span>
                      <span className="leaderboard-stat-value">
                        {player.score.toLocaleString()}
                      </span>
                    </div>
                    <div className="leaderboard-stat">
                      <span className="leaderboard-stat-label">Streak</span>
                      <span className="leaderboard-stat-value">🔥 {player.streak}</span>
                    </div>
                    <div className="leaderboard-stat">
                      <span className="leaderboard-stat-label">Accuracy</span>
                      <span className="leaderboard-stat-value">{player.accuracy}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!loading && leaderboard.length === 0 && (
        <Card className="leaderboard-empty">
          <p>No players found. Be the first to join the leaderboard!</p>
        </Card>
      )}
    </div>
  );
};

export default Leaderboard;

