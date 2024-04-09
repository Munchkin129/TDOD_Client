import React from 'react';
import '../styles/LoadingIndicator.css';

// spinning indicator to show the user something is happening
function LoadingIndicator() {
  return (
    <div className="loading-indicator">
      <div className="spinner"></div>
    </div>
  );
}

export default LoadingIndicator;