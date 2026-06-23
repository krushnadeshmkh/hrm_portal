import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

let socketInstance = null;
let reconnectAttempts = 0;
const globalUnreadListeners = new Set();
const globalGroupUnreadListeners = new Set();
const globalNotificationListeners = new Set();

let globalUnreadMap = {};
let globalGroupUnreadMap = {};
let globalNotifications = [];

let activeChatContact = null;
let activeChatGroup = null;

function getCurrentUserId() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);
    return decoded.id || decoded.userId;
  } catch {
    return null;
  }
}

export function notifyUnreadListeners(map) {
  globalUnreadListeners.forEach((fn) => fn(map));
}

export function getGlobalUnreadMap() {
  return globalUnreadMap;
}

export function getGlobalGroupUnreadMap() {
  return globalGroupUnreadMap;
}

export function getGlobalNotifications() {
  return globalNotifications;
}

export function setActiveChatContact(contactId) {
  activeChatContact = contactId;
  if (contactId && socketInstance) {
    socketInstance.emit("mark_read", { sender_id: contactId });
  }
}

export function setActiveChatGroup(groupId) {
  activeChatGroup = groupId;
  if (groupId && socketInstance) {
    socketInstance.emit("mark_group_read", { group_id: groupId });
  }
}

export function getActiveChatContact() {
  return activeChatContact;
}

export function getActiveChatGroup() {
  return activeChatGroup;
}

function notifyNotificationListeners() {
  globalNotificationListeners.forEach((fn) => fn([...globalNotifications]));
}

function notifyGroupUnreadListeners(map) {
  globalGroupUnreadListeners.forEach((fn) => fn(map));
}

function getFilePreview(fileType) {
  if (fileType === "image") return "📷 Photo";
  if (fileType === "video") return "🎥 Video";
  if (fileType === "audio") return "🎵 Audio";
  return "📎 File";
}

function handleGlobalReceive(msg) {
  const currentUserId = getCurrentUserId();
  const senderId = String(msg.sender_id?._id || msg.sender_id).trim();

  if (currentUserId && senderId === String(currentUserId)) return;

  if (activeChatContact === senderId) {
    if (socketInstance) socketInstance.emit("mark_read", { sender_id: senderId });
    return;
  }

  globalUnreadMap = {
    ...globalUnreadMap,
    [senderId]: (globalUnreadMap[senderId] ?? 0) + 1,
  };

  const previewText = msg.file_type ? getFilePreview(msg.file_type) : msg.content || "New message";

  const newNotification = {
    id: `${senderId}-${msg._id || Date.now()}`,
    sender_id: senderId,
    sender_name: msg.sender_id?.name || "Someone",
    content: previewText,
    created_at: msg.createdAt || new Date().toISOString(),
    read: false,
    type: "direct",
    is_group: false,
  };

  const exists = globalNotifications.some((n) => n.id === newNotification.id);
  if (!exists) {
    globalNotifications = [newNotification, ...globalNotifications].slice(0, 50);
  }

  notifyUnreadListeners({ ...globalUnreadMap });
  notifyNotificationListeners();
}

function handleGlobalGroupMessage(data) {
  const { group_id, message } = data;
  const currentUserId = getCurrentUserId();
  const messageSenderId = String(message.sender_id?._id || message.sender_id);

  const gid = String(group_id);

  if (activeChatGroup === gid) {
    if (socketInstance) socketInstance.emit("mark_group_read", { group_id: gid });
    return;
  }

  globalGroupUnreadMap = {
    ...globalGroupUnreadMap,
    [gid]: (globalGroupUnreadMap[gid] ?? 0) + 1,
  };

  const previewText = message.file_type ? getFilePreview(message.file_type) : message.content || "New message";
  const groupName = message.group_name || "Group";
  const senderName = message.sender_id?.name || "Someone";

  const newNotification = {
    id: `group-${gid}-${message._id || Date.now()}`,
    sender_id: gid,
    sender_name: senderName,
    group_name: groupName,
    content: previewText,
    created_at: message.createdAt || new Date().toISOString(),
    read: false,
    is_group: true,
    group_id: gid,
  };

  const exists = globalNotifications.some((n) => n.id === newNotification.id);
  if (!exists) {
    globalNotifications = [newNotification, ...globalNotifications].slice(0, 50);
  }

  notifyGroupUnreadListeners({ ...globalGroupUnreadMap });
  notifyNotificationListeners();
}

export function initializeSocket() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  if (socketInstance && socketInstance.connected) return socketInstance;

  if (socketInstance) {
    if (socketInstance.connected) socketInstance.disconnect();
    socketInstance.removeAllListeners();
    socketInstance = null;
  }

  socketInstance = io("https://hrm-backend-vvqg.onrender.com", {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    reconnection: true,
  });

  socketInstance.on("connect", () => {
    reconnectAttempts = 0;
    console.log("Socket connected successfully");
  });

  socketInstance.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  socketInstance.on("connect_error", () => {
    reconnectAttempts++;
    console.log("Socket connection error:", reconnectAttempts);
    if (reconnectAttempts > 3) {
      socketInstance.io.opts.transports = ["polling", "websocket"];
    }
  });

  socketInstance.on("receive_message", handleGlobalReceive);
  socketInstance.on("group_message", handleGlobalGroupMessage);

  return socketInstance;
}

export function clearAllNotifications() {
  globalNotifications = globalNotifications.map((n) => ({ ...n, read: true }));
  notifyNotificationListeners();
}

export function useSocket() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found, socket not connected");
      return;
    }

    const newSocket = initializeSocket();
    setSocket(newSocket);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const currentSocket = initializeSocket();
        setSocket(currentSocket);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return socket;
}

export function resetUnreadForSender(senderId) {
  globalUnreadMap = { ...globalUnreadMap, [senderId]: 0 };
  notifyUnreadListeners({ ...globalUnreadMap });
  globalNotifications = globalNotifications.map((n) =>
    n.sender_id === senderId.toString() && !n.is_group ? { ...n, read: true } : n
  );
  notifyNotificationListeners();
}

export function subscribeToGlobalUnread(fn) {
  globalUnreadListeners.add(fn);
  fn({ ...globalUnreadMap });
  return () => globalUnreadListeners.delete(fn);
}

export function resetUnreadForGroup(groupId) {
  const gid = String(groupId);
  globalGroupUnreadMap = { ...globalGroupUnreadMap, [gid]: 0 };
  notifyGroupUnreadListeners({ ...globalGroupUnreadMap });
  globalNotifications = globalNotifications.map((n) =>
    n.is_group && n.group_id === gid ? { ...n, read: true } : n
  );
  notifyNotificationListeners();
}

export function subscribeToGroupUnread(fn) {
  globalGroupUnreadListeners.add(fn);
  fn({ ...globalGroupUnreadMap });
  return () => globalGroupUnreadListeners.delete(fn);
}

export function subscribeToGlobalNotifications(fn) {
  globalNotificationListeners.add(fn);
  fn([...globalNotifications]);
  return () => globalNotificationListeners.delete(fn);
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.removeAllListeners();
    socketInstance.disconnect();
    socketInstance = null;
  }
}

export function markGroupMessagesAsRead(groupId) {
  if (socketInstance && groupId) {
    socketInstance.emit("mark_group_read", { group_id: groupId });
    resetUnreadForGroup(groupId);
  }
}