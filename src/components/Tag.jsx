import React from 'react';
import './Tag.css';

const Tag = ({ children, variant = 'default', size = 'medium' }) => {
  return (
    <span className={`tag tag-${variant} tag-${size}`}>
      {children}
    </span>
  );
};

export default Tag;

