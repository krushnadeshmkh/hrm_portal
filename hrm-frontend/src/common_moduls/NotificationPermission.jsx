import React, { useState, useEffect } from 'react';

const NotificationPermission = () => {
  const [permission, setPermission] = useState(Notification.permission);

  useEffect(() => {
    setPermission(Notification.permission);
  }, []);

  const handleRequestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      new Notification('Notifications Enabled ✅', {
        body: 'You will now receive desktop notifications for new messages',
        icon: '/logo-192.png'
      });
    }
  };

  if (permission === 'granted') {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px',
        fontSize: '0.75rem',
        color: '#22C55E',
        background: 'rgba(34, 197, 94, 0.1)',
        padding: '4px 12px',
        borderRadius: '20px'
      }}>
        <span>🔔</span> Notifications On
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px',
        fontSize: '0.75rem',
        color: '#EF4444',
        background: 'rgba(239, 68, 68, 0.1)',
        padding: '4px 12px',
        borderRadius: '20px'
      }}>
        <span>🔕</span> Notifications Blocked
        <button
          onClick={() => {
            alert('Please enable notifications in browser settings:\n1. Click the lock icon in address bar\n2. Find notifications setting\n3. Allow notifications');
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#EF4444',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontSize: '0.7rem',
            padding: '2px 6px'
          }}
        >
          How to enable?
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleRequestPermission}
      style={{
        padding: '6px 16px',
        borderRadius: '20px',
        border: 'none',
        background: '#4F46E5',
        color: '#fff',
        fontSize: '0.75rem',
        cursor: 'pointer',
        fontWeight: 500,
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}
      onMouseEnter={e => {
        e.target.style.background = '#4338CA';
        e.target.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={e => {
        e.target.style.background = '#4F46E5';
        e.target.style.transform = 'scale(1)';
      }}
    >
      🔔 Enable Notifications
    </button>
  );
};

export default NotificationPermission;