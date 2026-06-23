import { useEffect, useRef, useState, useCallback } from "react";
import { subscribeToGlobalNotifications, clearAllNotifications, markGroupMessagesAsRead, getGlobalUnreadMap, getGlobalGroupUnreadMap } from "./useSocket";

let audioContext = null;

export function useNotification(socket, currentUserId, onShowToast) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const permissionGranted = useRef(false);
  const processedMessageIds = useRef(new Set());
  const lastTitleUpdate = useRef(0);
  const notificationSound = useRef(null);
  const isTabVisible = useRef(true);
  const hasSetUpListeners = useRef(false);

  useEffect(() => {
    const checkPermission = async () => {
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          permissionGranted.current = true;
          console.log("Notification permission granted");
        } else if (Notification.permission === "denied") {
          console.log("Notification permission denied");
          permissionGranted.current = false;
        } else {
          try {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
              permissionGranted.current = true;
              console.log("Notification permission granted after request");
            } else {
              permissionGranted.current = false;
            }
          } catch (error) {
            console.log("Error requesting permission:", error);
            permissionGranted.current = false;
          }
        }
      }
    };

    checkPermission();

    const handleVisibilityChange = () => {
      isTabVisible.current = !document.hidden;
      
      if (!document.hidden) {
        const socketUnreadMap = getGlobalUnreadMap();
        const socketGroupUnreadMap = getGlobalGroupUnreadMap();
        const totalUnread = Object.values(socketUnreadMap).reduce((a, b) => a + b, 0) +
                           Object.values(socketGroupUnreadMap).reduce((a, b) => a + b, 0);
        if (totalUnread === 0) {
          document.title = "HRM Portal";
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const playNotificationSound = useCallback(() => {
    try {
      if (!notificationSound.current) {
        notificationSound.current = new Audio("/notification.mp3");
        notificationSound.current.volume = 1;
      }
      notificationSound.current.currentTime = 0;
      notificationSound.current.play().catch(() => {
        if (!audioContext) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          audioContext = new AudioContextClass();
        }
        if (audioContext.state === "suspended") {
          audioContext.resume();
        }
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        const now = audioContext.currentTime;
        oscillator.frequency.setValueAtTime(880, now);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 0.25);
        oscillator.start(now);
        oscillator.stop(now + 0.25);
      });
    } catch (error) {
      console.log("Sound error:", error);
    }
  }, []);

  const updateBrowserTitle = useCallback((count) => {
    const now = Date.now();
    if (now - lastTitleUpdate.current < 100) return;
    lastTitleUpdate.current = now;
    
    if (count > 0 && !isTabVisible.current) {
      document.title = `(${count > 99 ? '99+' : count}) HRM Portal`;
    } else if (count === 0) {
      document.title = "HRM Portal";
    }
  }, []);

  const showBrowserNotification = useCallback((notification) => {
    if (Notification.permission !== "granted") {
      console.log("Permission not granted");
      return;
    }

    const senderName = notification.sender_name || notification.senderName || 'New Message';
    const content = notification.content || notification.text || 'You have a new message';
    
    const title = notification.is_group 
      ? `${senderName} in ${notification.group_name || "Group"}`
      : senderName;

    const options = {
      body: content,
      icon: notification.sender_avatar || notification.icon || '/logo-192.png',
      badge: '/favicon.ico',
      tag: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      renotify: false,
      silent: false,
      vibrate: [200, 100, 200],
      requireInteraction: true,
      data: {
        type: notification.is_group ? "group" : "direct",
        id: notification.is_group ? notification.group_id : notification.sender_id,
        notificationId: notification.id || notification._id
      }
    };

    try {
      const browserNotif = new Notification(title, options);
      
      browserNotif.onclick = () => {
        window.focus();
        browserNotif.close();
        
        if (notification.is_group && notification.group_id) {
          window.dispatchEvent(new CustomEvent("openGroupChat", { 
            detail: { groupId: notification.group_id } 
          }));
        } else if (!notification.is_group && notification.sender_id) {
          window.dispatchEvent(new CustomEvent("openDirectChat", { 
            detail: { userId: notification.sender_id } 
          }));
        }
      };

      setTimeout(() => {
        try {
          browserNotif.close();
        } catch (e) {}
      }, 8000);

      return browserNotif;
    } catch (error) {
      console.log("Notification creation error:", error);
    }
  }, []);

  const showToastNotification = useCallback((notification) => {
    if (onShowToast) {
      onShowToast(notification);
    }
  }, [onShowToast]);

  useEffect(() => {
    if (!socket) {
      hasSetUpListeners.current = false;
      return;
    }

    if (hasSetUpListeners.current) {
      return;
    }

    console.log("Setting up notification listeners");

    const handleReceiveMessage = (message) => {
      const messageId = message._id || message.id;
      if (processedMessageIds.current.has(messageId)) {
        return;
      }
      processedMessageIds.current.add(messageId);

      const isOwnMessage = message.sender_id?._id === currentUserId || 
                          message.sender_id === currentUserId;

      if (isOwnMessage) {
        return;
      }

      const isTabHidden = !isTabVisible.current;

      if (isTabHidden) {
        const senderName = message.sender_id?.name || message.senderName || 'New Message';
        const content = message.content || message.text || 'New message';
        
        const notification = {
          sender_name: senderName,
          senderName: senderName,
          content: content,
          text: content,
          sender_id: message.sender_id?._id || message.sender_id,
          sender_avatar: message.sender_id?.avatar || '/logo-192.png',
          icon: message.sender_id?.avatar || '/logo-192.png',
          is_group: false,
          id: messageId,
          _id: messageId,
          created_at: message.createdAt
        };
        
        showBrowserNotification(notification);
        showToastNotification(notification);
        playNotificationSound();
        
        const socketUnreadMap = getGlobalUnreadMap();
        const socketGroupUnreadMap = getGlobalGroupUnreadMap();
        const totalUnread = Object.values(socketUnreadMap).reduce((a, b) => a + b, 0) +
                           Object.values(socketGroupUnreadMap).reduce((a, b) => a + b, 0);
        updateBrowserTitle(totalUnread);
      } else {
        playNotificationSound();
      }

      setTimeout(() => {
        processedMessageIds.current.delete(messageId);
      }, 5000);
    };

    const handleGroupMessage = ({ group_id, message }) => {
      const messageId = message._id || message.id;
      if (processedMessageIds.current.has(messageId)) {
        return;
      }
      processedMessageIds.current.add(messageId);

      const isOwnMessage = message.sender_id?._id === currentUserId || 
                          message.sender_id === currentUserId;

      if (isOwnMessage) {
        return;
      }

      const isTabHidden = !isTabVisible.current;

      if (isTabHidden) {
        const senderName = message.sender_id?.name || message.senderName || 'Group Member';
        const content = message.content || message.text || 'New message';
        
        const notification = {
          sender_name: senderName,
          senderName: senderName,
          content: content,
          text: content,
          sender_id: message.sender_id?._id || message.sender_id,
          sender_avatar: message.sender_id?.avatar || '/logo-192.png',
          icon: message.sender_id?.avatar || '/logo-192.png',
          group_id: group_id,
          is_group: true,
          group_name: message.group_name || 'Group',
          id: messageId,
          _id: messageId,
          created_at: message.createdAt
        };
        
        showBrowserNotification(notification);
        showToastNotification(notification);
        playNotificationSound();
        
        const socketUnreadMap = getGlobalUnreadMap();
        const socketGroupUnreadMap = getGlobalGroupUnreadMap();
        const totalUnread = Object.values(socketUnreadMap).reduce((a, b) => a + b, 0) +
                           Object.values(socketGroupUnreadMap).reduce((a, b) => a + b, 0);
        updateBrowserTitle(totalUnread);
      } else {
        playNotificationSound();
      }

      setTimeout(() => {
        processedMessageIds.current.delete(messageId);
      }, 5000);
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_sent', handleReceiveMessage);
    socket.on('group_message', handleGroupMessage);

    hasSetUpListeners.current = true;

    return () => {
      console.log("Cleaning up notification listeners");
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_sent', handleReceiveMessage);
      socket.off('group_message', handleGroupMessage);
      hasSetUpListeners.current = false;
    };
  }, [socket, currentUserId, showBrowserNotification, showToastNotification, playNotificationSound, updateBrowserTitle]);

  useEffect(() => {
    const unsubscribe = subscribeToGlobalNotifications((newNotifications) => {
      const socketUnreadMap = getGlobalUnreadMap();
      const socketGroupUnreadMap = getGlobalGroupUnreadMap();
      
      const socketTotalUnread = Object.values(socketUnreadMap).reduce((a, b) => a + b, 0) +
                                 Object.values(socketGroupUnreadMap).reduce((a, b) => a + b, 0);

      setNotifications(newNotifications);
      setUnreadCount(socketTotalUnread);
      if (!isTabVisible.current) {
        updateBrowserTitle(socketTotalUnread);
      }
    });

    return () => unsubscribe();
  }, [updateBrowserTitle]);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    clearAllNotifications();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    document.title = "HRM Portal";
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    playSound: playNotificationSound
  };
}