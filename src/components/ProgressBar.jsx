import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ value, max = 100, showLabel = false, variant = 'primary' }) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="progress-bar-container">
      {showLabel && (
        <div className="progress-bar-label">
          <span>{value}%</span>
        </div>
      )}
      <div className="progress-bar-track">
        <div
          className={`progress-bar-fill progress-${variant}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;

