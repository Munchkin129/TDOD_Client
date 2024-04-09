import React from 'react';

// to show if model and assignment of boxes are loaded
function StatusIndicator({ label, status }) {
  const color = status ? "green" : "red";

  return (
    <div style={{ color }}>
      {label}: {status ? "Loaded" : "Not Loaded"}
    </div>
  );
}

export default StatusIndicator;