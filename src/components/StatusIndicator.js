import React from 'react';

function StatusIndicator({ label, status }) {
  const color = status ? "green" : "red";

  return (
    <div style={{ color }}>
      {label}: {status ? "Loaded" : "Not Loaded"}
    </div>
  );
}

export default StatusIndicator;