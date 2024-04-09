import React from 'react';
import '../styles/ProgressCircle.css';

// filing circle to show progression e.g. of box assigment
const ProgressCircle = ({ progress }) => {
  const strokeDasharray = 251;
  const strokeDashoffset = ((100 - progress) / 100) * strokeDasharray;

  return (
    <div className="progressCircle">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle
          className="progressBack"
          cx="50"
          cy="50"
          r="40"
          strokeWidth="4"
          fill="none"
        />
        <circle
          className="progressBar"
          transform="rotate(-90, 50, 50)"
          cx="50"
          cy="50"
          r="40"
          strokeWidth="10"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          fill="none"
        />
      </svg>
    </div>
  );
};

export default ProgressCircle;