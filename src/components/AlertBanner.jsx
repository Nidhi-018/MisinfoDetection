import React from 'react';
import './AlertBanner.css';

const AlertBanner = ({ type = 'info', message, onClose, children }) => {
  return (
    <div className={`alert-banner alert-${type}`}>
      <div className="alert-content">
        <span className="alert-icon">
          {type === 'success' && '✓'}
          {type === 'error' && '✕'}
          {type === 'warning' && '⚠'}
          {type === 'info' && 'ℹ'}
        </span>
        <div className="alert-message">
          {message || children}
        </div>
      </div>
      {onClose && (
        <button className="alert-close" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
};

export default AlertBanner;

