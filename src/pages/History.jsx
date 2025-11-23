import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Tag from '../components/Tag';
import ScoreCircle from '../components/ScoreCircle';
import Modal from '../components/Modal';
import { getHistory } from '../services/api';
import './History.css';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await getHistory();
      if (response && response.data) {
        setHistory(response.data);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      setHistory([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const getTypeIcon = (type) => {
    if (type === 'image') return '🖼️';
    if (type === 'text') return '📝';
    if (type === 'url') return '🔗';
    return '📄';
  };

  const getRiskVariant = (riskLevel) => {
    if (riskLevel === 'Safe') return 'success';
    if (riskLevel === 'Medium') return 'warning';
    return 'danger';
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="history">
      <div className="history-header">
        <h1 className="history-title">Analysis History</h1>
        <p className="history-subtitle">View your previously scanned content</p>
      </div>

      {loading ? (
        <div className="history-loading">
          <div className="history-loading-spinner"></div>
          <p>Loading history...</p>
        </div>
      ) : history.length === 0 ? (
        <Card className="history-empty">
          <div className="history-empty-icon">📋</div>
          <h2>No history yet</h2>
          <p>Start analyzing content to see your history here.</p>
        </Card>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <Card
              key={item.id}
              hover
              className="history-item"
              onClick={() => handleItemClick(item)}
            >
              <div className="history-item-icon">
                {getTypeIcon(item.type)}
              </div>
              <div className="history-item-content">
                <div className="history-item-header">
                  <h3 className="history-item-title">
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)} Analysis
                  </h3>
                  <Tag variant={getRiskVariant(item.riskLevel)}>
                    {item.riskLevel}
                  </Tag>
                </div>
                <p className="history-item-preview">{item.content}</p>
                <p className="history-item-time">{formatDate(item.timestamp)}</p>
              </div>
              <div className="history-item-score">
                <ScoreCircle score={item.credibilityScore} size={80} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Analysis Details"
        size="large"
      >
        {selectedItem && (
          <div className="history-detail">
            <div className="history-detail-header">
              <div className="history-detail-type">
                {getTypeIcon(selectedItem.type)}
                <span>{selectedItem.type.toUpperCase()}</span>
              </div>
              <Tag variant={getRiskVariant(selectedItem.riskLevel)} size="large">
                {selectedItem.riskLevel} Risk
              </Tag>
            </div>

            <div className="history-detail-content">
              <h3>Content</h3>
              <p>{selectedItem.content}</p>
            </div>

            <div className="history-detail-score">
              <h3>Credibility Score</h3>
              <div className="history-detail-score-circle">
                <ScoreCircle score={selectedItem.credibilityScore} size={120} />
              </div>
            </div>

            <div className="history-detail-meta">
              <p>
                <strong>Analyzed:</strong> {formatDate(selectedItem.timestamp)}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default History;

