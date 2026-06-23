import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const CustomToast = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 8000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  const title = notification.is_group 
    ? `${notification.sender_name} in ${notification.group_name || "Group"}`
    : notification.sender_name;

  const handleClick = () => {
    console.log("Toast clicked", notification);
    window.focus();
    
    try {
      if (notification.is_group && notification.group_id) {
        console.log("Opening group chat:", notification.group_id);
        const event = new CustomEvent("openGroupChat", { 
          detail: { groupId: notification.group_id } 
        });
        window.dispatchEvent(event);
        
        if (window.location.pathname !== '/chat') {
          window.location.href = '/chat';
          setTimeout(() => {
            window.dispatchEvent(event);
          }, 500);
        }
      } else if (!notification.is_group && notification.sender_id) {
        console.log("Opening direct chat:", notification.sender_id);
        const event = new CustomEvent("openDirectChat", { 
          detail: { userId: notification.sender_id } 
        });
        window.dispatchEvent(event);
        
        if (window.location.pathname !== '/chat') {
          window.location.href = '/chat';
          setTimeout(() => {
            window.dispatchEvent(event);
          }, 500);
        }
      }
    } catch (error) {
      console.log("Error opening chat:", error);
      window.location.href = '/chat';
    }
    
    onClose();
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        maxWidth: '400px',
        minWidth: '300px',
        background: '#1a1a2e',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        padding: '16px 20px',
        zIndex: 99999,
        animation: 'slideInRight 0.4s ease',
        border: '1px solid rgba(255,255,255,0.1)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}
      onClick={handleClick}
    >
      <div style={{ flexShrink: 0 }}>
        <img
          src={notification.sender_avatar || '/logo-192.png'}
          alt=""
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
          onError={(e) => {
            e.target.src = '/logo-192.png';
          }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ 
          color: '#fff', 
          fontWeight: 600, 
          fontSize: '0.9rem',
          marginBottom: '4px'
        }}>
          {title}
        </div>
        <div style={{ 
          color: '#a0aec0', 
          fontSize: '0.85rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {notification.content || notification.text || 'New message'}
        </div>
        <div style={{ 
          color: '#718096', 
          fontSize: '0.7rem',
          marginTop: '4px'
        }}>
          Just now
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        style={{
          background: 'none',
          border: 'none',
          color: '#718096',
          cursor: 'pointer',
          fontSize: '18px',
          padding: '0 4px',
          flexShrink: 0
        }}
      >
        ×
      </button>
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default CustomToast;