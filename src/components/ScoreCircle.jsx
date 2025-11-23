import React from 'react';
import './ScoreCircle.css';

const ScoreCircle = ({ score, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (score) => {
    if (score >= 75) return 'var(--accent-success)';
    if (score >= 50) return 'var(--accent-warning)';
    return 'var(--accent-danger)';
  };

  return (
    <div className="score-circle-container" style={{ width: size, height: size }}>
      <svg className="score-circle-svg" width={size} height={size}>
        <circle
          className="score-circle-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="score-circle-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ stroke: getColor(score) }}
        />
      </svg>
      <div className="score-circle-text">
        <span className="score-circle-value">{score}</span>
        <span className="score-circle-label">/100</span>
      </div>
    </div>
  );
};

export default ScoreCircle;

