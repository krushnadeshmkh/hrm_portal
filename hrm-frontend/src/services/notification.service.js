class NotificationService {
  constructor() {
    this.permission = Notification.permission;
    this.sound = new Audio('/notification-sound.mp3');
    this.notifications = new Map();
  }

  async requestPermission() {
    if (!("Notification" in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === "granted";
    } catch (error) {
      console.error("Notification permission error:", error);
      return false;
    }
  }

  showNotification({ title, body, icon = '/logo.png', tag = null, data = null }) {
    if (this.permission !== "granted") {
      return null;
    }

    if (tag && this.notifications.has(tag)) {
      const existing = this.notifications.get(tag);
      existing.close();
      this.notifications.delete(tag);
    }

    const options = {
      body,
      icon,
      tag: tag || Date.now().toString(),
      data,
      requireInteraction: true,
      silent: false,
      vibrate: [200, 100, 200],
      actions: [
        { action: 'reply', title: 'Reply' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      badge: '/badge.png'
    };

    try {
      const notification = new Notification(title, options);
      
      if (tag) {
        this.notifications.set(tag, notification);
      }

      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        
        if (data) {
          if (data.isGroup) {
            window.dispatchEvent(new CustomEvent('openGroupChat', { 
              detail: { groupId: data.chatId } 
            }));
          } else {
            window.dispatchEvent(new CustomEvent('openDirectChat', { 
              detail: { userId: data.chatId } 
            }));
          }
        }
        
        notification.close();
        if (tag) {
          this.notifications.delete(tag);
        }
      };

      notification.onaction = (event) => {
        if (event.action === 'reply') {
          window.focus();
          if (data) {
            if (data.isGroup) {
              window.dispatchEvent(new CustomEvent('openGroupChat', { 
                detail: { groupId: data.chatId } 
              }));
            } else {
              window.dispatchEvent(new CustomEvent('openDirectChat', { 
                detail: { userId: data.chatId } 
              }));
            }
          }
        }
        notification.close();
        if (tag) {
          this.notifications.delete(tag);
        }
      };

      this.sound.play().catch(() => {});

      return notification;
    } catch (error) {
      console.error("Error showing notification:", error);
      return null;
    }
  }

  closeAll() {
    for (const [tag, notification] of this.notifications) {
      notification.close();
      this.notifications.delete(tag);
    }
  }
}

export default new NotificationService();