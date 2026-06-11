import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

let socketInstance = null;
const globalUnreadListeners = new Set();
const globalNotificationListeners = new Set();

export function notifyUnreadListeners(map) {
  globalUnreadListeners.forEach((fn) => fn(map));
}

let globalUnreadMap = {};
let globalNotifications = [];

export function getGlobalUnreadMap() {
  return globalUnreadMap;
}

export function getGlobalNotifications() {
  return globalNotifications;
}

function notifyNotificationListeners() {
  globalNotificationListeners.forEach((fn) => fn([...globalNotifications]));
}

function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function showBrowserNotification(senderName, content, fileType) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  if (document.visibilityState === "visible" && document.hasFocus()) return;

  const body = fileType
    ? fileType === "image"
      ? "📷 Photo"
      : fileType === "video"
      ? "🎥 Video"
      : fileType === "audio"
      ? "🎵 Audio"
      : "📎 File"
    : content || "New message";

  const notification = new Notification(senderName || "New Message", {
    body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: `msg-${senderName}`,
    renotify: true,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}

function handleGlobalReceive(msg) {
  const senderId = String(msg.sender_id?._id || msg.sender_id).trim();
  const senderName = msg.sender_id?.name || "Someone";

  globalUnreadMap = {
    ...globalUnreadMap,
    [senderId]: (globalUnreadMap[senderId] ?? 0) + 1,
  };

  const previewText = msg.file_type
    ? msg.file_type === "image"
      ? "📷 Photo"
      : msg.file_type === "video"
      ? "🎥 Video"
      : msg.file_type === "audio"
      ? "🎵 Audio"
      : "📎 File"
    : msg.content || "New message";

  globalNotifications = [
    {
      id: `${senderId}-${msg._id || Date.now()}`,
      sender_id: senderId,
      sender_name: senderName,
      content: previewText,
      created_at: msg.createdAt || new Date().toISOString(),
      read: false,
    },
    ...globalNotifications,
  ].slice(0, 30);

  notifyUnreadListeners({ ...globalUnreadMap });
  notifyNotificationListeners();
  showBrowserNotification(senderName, msg.content, msg.file_type);
}

function ensureSocket() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  if (!socketInstance) {
    socketInstance = io(
      import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com",
      {
        auth: { token },
        transports: ["websocket"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    );

    requestNotificationPermission();
    socketInstance.on("receive_message", handleGlobalReceive);
  }

  return socketInstance;
}

export function useSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = ensureSocket();
    socketRef.current = socket;
  }, []);

  return socketRef.current ?? socketInstance;
}

export function resetUnreadForSender(senderId) {
  globalUnreadMap = { ...globalUnreadMap, [senderId]: 0 };
  notifyUnreadListeners({ ...globalUnreadMap });

  globalNotifications = globalNotifications.map((n) =>
    n.sender_id === senderId.toString() ? { ...n, read: true } : n
  );
  notifyNotificationListeners();
}

export function clearAllNotifications() {
  globalNotifications = globalNotifications.map((n) => ({ ...n, read: true }));
  notifyNotificationListeners();
}

export function subscribeToGlobalUnread(fn) {
  globalUnreadListeners.add(fn);
  fn({ ...globalUnreadMap });
  return () => globalUnreadListeners.delete(fn);
}

export function subscribeToGlobalNotifications(fn) {
  globalNotificationListeners.add(fn);
  fn([...globalNotifications]);
  return () => globalNotificationListeners.delete(fn);
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.off("receive_message", handleGlobalReceive);
    socketInstance.disconnect();
    socketInstance = null;
  }
}