import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  useSocket, subscribeToGlobalUnread, resetUnreadForSender,
  subscribeToGroupUnread, resetUnreadForGroup,
  setActiveChatContact, setActiveChatGroup
} from "../hook/useSocket";

import NotificationPermission from "../common_moduls/NotificationPermission";
import axios from "axios";
import Sidebar from "../layouts/sidebar";
import MobileTopBar from "../employee/MobileTopBar";
import { useTheme } from "../context/ThemeContext";

import CreateGroupModal from "./Creategroupmodal";
import GroupSettingsPanel from "./GroupSettingsPanel";
import {
  Search, Send, MessageSquare, Circle, CheckCheck, Check,
  MoreVertical, ArrowLeft, Paperclip, X, Download,
  FileText, Film, Music, Trash2, Reply, CornerUpLeft,
  Users, Plus, Info, Video, Calendar, Copy
} from "lucide-react";

const API = "https://hrm-backend-vvqg.onrender.com/api";
const BASE_URL = "https://hrm-backend-vvqg.onrender.com";
const EMOJI_LIST = ["👍", "❤️", "😂", "😮", "😢", "🔥", "👏", "🎉"];
const MESSAGES_PER_PAGE = 30;

function authHeaders() {
  return { "x-auth-token": localStorage.getItem("token") };
}

function getCurrentUserId() {
  if (typeof window !== "undefined") {
    const id = localStorage.getItem("userId") || localStorage.getItem("user_id") || localStorage.getItem("employeeId");
    if (!id) return null;
    return String(id).trim().replace(/^["']|["']$/g, "");
  }
  return null;
}

function dedupMsgs(msgs) {
  const seen = new Set();
  return msgs.filter(m => {
    if (!m?._id) return true;
    if (seen.has(m._id)) return false;
    seen.add(m._id);
    return true;
  });
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatDateDivider(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function formatFileSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function parseMeetingMessage(content) {
  if (!content || !content.startsWith("📅 Meeting scheduled")) return null;

  const lines = content.split("\n");
  const titleMatch = lines[0]?.match(/"([^"]+)"/);
  const title = titleMatch ? titleMatch[1] : "Meeting";

  let date = "";
  let time = "";
  let link = "";
  let location = "";
  let agenda = "";

  lines.forEach((line) => {
    if (line.startsWith("🗓")) {
      const cleaned = line.replace("🗓", "").trim();
      const parts = cleaned.split(" at ");
      date = parts[0]?.trim() || "";
      time = parts[1]?.trim() || "";
    } else if (line.startsWith("🔗")) {
      link = line.replace("🔗 Join link:", "").trim();
    } else if (line.startsWith("📍")) {
      location = line.replace("📍 Location:", "").trim();
    } else if (line.startsWith("Agenda:")) {
      agenda = line.replace("Agenda:", "").trim();
    }
  });

  return { title, date, time, link, location, agenda };
}

function linkify(text) {
  if (!text) return null;

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const segments = text.split(urlRegex);

  return segments.map((seg, i) => {
    if (/^https?:\/\//.test(seg)) {
      return (
        <a
          key={i}
          href={seg}
          target="_blank"
          rel="noreferrer"
          style={{
            color: "inherit",
            textDecoration: "underline",
            wordBreak: "break-all",
          }}
        >
          {seg}
        </a>
      );
    }

    return <span key={i}>{seg}</span>;
  });
}

function Avatar({ name = "?", src = null, size = 38 }) {
  const safeName = name || "?";
  const hue = ((safeName.charCodeAt(0) || 65) * 17 + (safeName.charCodeAt(1) || 65) * 5) % 360;
  if (src) {
    return (
      <img
        src={`${BASE_URL}${src}`}
        alt={safeName}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: `hsl(${hue},50%,46%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontWeight: 600, fontSize: size * 0.36, flexShrink: 0, userSelect: "none",
      }}
    >
      {safeName.slice(0, 2).toUpperCase()}
    </div>
  );
}

function GroupAvatar({ name = "?", src = null, size = 38 }) {
  const safeName = name || "?";
  const hue = ((safeName.charCodeAt(0) || 71) * 13 + (safeName.charCodeAt(1) || 71) * 7) % 360;
  if (src) {
    return (
      <img
        src={`${BASE_URL}${src}`}
        alt={safeName}
        style={{ width: size, height: size, borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  return (
    <div
      style={{
        width: size, height: size, borderRadius: 10,
        background: `hsl(${hue},45%,42%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", flexShrink: 0,
      }}
    >
      <Users size={size * 0.42} />
    </div>
  );
}

export default function ChatPage() {
  const { isDark } = useTheme();
  const socket = useSocket();
  const socketRef = useRef(socket);
  const location = useLocation();
  useEffect(() => { socketRef.current = socket; }, [socket]);

  const currentUserId = getCurrentUserId();

  const getInitialWidth = () => typeof window !== "undefined" ? window.innerWidth : 1024;
  const [windowWidth, setWindowWidth] = useState(getInitialWidth());
  const isMobile = windowWidth <= 640;
  const isTablet = windowWidth > 640 && windowWidth <= 1024;

  const [isOpen, setIsOpen] = useState(!isMobile);
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState("dms");

  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);
  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadMap, setUnreadMap] = useState({});
  const [groupUnreadMap, setGroupUnreadMap] = useState({});
  const [searchQ, setSearchQ] = useState("");

  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [loadingOldMsgs, setLoadingOldMsgs] = useState(false);

  const [replyTo, setReplyTo] = useState(null);
  const [emojiPickerMsgId, setEmojiPickerMsgId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [totalMessages, setTotalMessages] = useState(0);
  const [copiedMsgId, setCopiedMsgId] = useState(null);

  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const activeContactRef = useRef(activeContact);
  const activeGroupRef = useRef(activeGroup);
  const replyToRef = useRef(replyTo);
  const uploadPreviewRef = useRef(uploadPreview);
  const inputRef = useRef(input);
  const listenersRegistered = useRef(false);

  activeContactRef.current = activeContact;
  activeGroupRef.current = activeGroup;
  replyToRef.current = replyTo;
  uploadPreviewRef.current = uploadPreview;
  inputRef.current = input;

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const contextMenuRef = useRef(null);
  const chatContainerRef = useRef(null);
  const previousHeightRef = useRef(0);
  const loadingCountRef = useRef(0);
  const contactsLoadedRef = useRef(false);
  const groupsLoadedRef = useRef(false);

  const isGroupChat = activeTab === "groups" && !!activeGroup;
  const isGroupChatRef = useRef(isGroupChat);
  isGroupChatRef.current = isGroupChat;

  const t = {
    bg: isDark ? "#0F1219" : "#F0F2F5",
    card: isDark ? "#161B27" : "#fff",
    border: isDark ? "#1E2535" : "#E8EAED",
    textPrimary: isDark ? "#F3F4F6" : "#111827",
    textSecondary: isDark ? "#9CA3AF" : "#6B7280",
    textMuted: isDark ? "#6B7280" : "#9CA3AF",
    inputBg: isDark ? "#1E2535" : "#F9FAFB",
    inputBorder: isDark ? "#2D3748" : "#E5E7EB",
    topbar: isDark ? "#1A2035" : "#fff",
    rowHover: isDark ? "#1A2535" : "#F5F7FF",
    accent: "#4F46E5",
    accentLight: isDark ? "#1E1B4B" : "#EEF2FF",
    bubbleOut: isDark ? "#3730A3" : "#4F46E5",
    bubbleOutText: "#fff",
    bubbleIn: isDark ? "#1E2535" : "#fff",
    bubbleInText: isDark ? "#F3F4F6" : "#111827",
    sidebarPanel: isDark ? "#111827" : "#fff",
    activeRow: isDark ? "#1E2535" : "#F0EDFF",
    chatBg: isDark ? "#0B0F1A" : "#ECE5DD",
    bubbleShadow: isDark ? "0 1px 2px rgba(0,0,0,0.4)" : "0 1px 2px rgba(0,0,0,0.1)",
    skeletonBg: isDark ? "#1E2535" : "#F3F4F6",
    dividerBg: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
    dividerText: isDark ? "#9CA3AF" : "#6B7280",
    searchBg: isDark ? "#1E2535" : "#F0F2F5",
    contextBg: isDark ? "#1E2535" : "#fff",
    contextBorder: isDark ? "#2D3748" : "#E5E7EB",
    replyBg: isDark ? "#1A2035" : "#F3F0FF",
    deletedText: isDark ? "#6B7280" : "#9CA3AF",
    tabBg: isDark ? "#0F1219" : "#F0F2F5",
    systemMsg: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
    systemText: isDark ? "#9CA3AF" : "#6B7280",
  };

  const sidebarWidth = isMobile ? 0 : isTablet ? 68 : isOpen ? 255 : 68;

  useEffect(() => {
    const fn = () => {
      const w = window.innerWidth;
      setWindowWidth(w);
      if (w > 1024) { setIsOpen(true); setShowChat(false); }
      else if (w <= 640) setIsOpen(false);
    };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => {
    const unsub = subscribeToGlobalUnread((map) => {
      setUnreadMap((prev) => {
        const next = { ...prev };
        Object.entries(map).forEach(([id, count]) => {
          if (activeContactRef.current?.user_id?.toString() === id) return;
          next[id] = count;
        });
        return next;
      });
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = subscribeToGroupUnread((map) => {
      setGroupUnreadMap((prev) => {
        const next = { ...prev };
        Object.entries(map).forEach(([id, count]) => {
          if (String(activeGroupRef.current?._id) === id) return;
          next[id] = count;
        });
        return next;
      });
    });
    return unsub;
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) setContextMenu(null);
      if (emojiPickerMsgId && !e.target.closest("[data-emoji-picker]")) setEmojiPickerMsgId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [emojiPickerMsgId]);

  useEffect(() => {
    setLoadingContacts(true);
    axios.get(`${API}/chat/contacts`, { headers: authHeaders() })
      .then(r => {
        setContacts(r.data.data || []);
        contactsLoadedRef.current = true;
      })
      .catch(console.error)
      .finally(() => setLoadingContacts(false));
  }, []);

  useEffect(() => {
    setLoadingGroups(true);
    axios.get(`${API}/groups`, { headers: authHeaders() })
      .then(r => {
        setGroups(r.data.data || []);
        groupsLoadedRef.current = true;
      })
      .catch(console.error)
      .finally(() => setLoadingGroups(false));
  }, []);

  useEffect(() => {
    axios.get(`${API}/chat/unread-per-sender`, { headers: authHeaders() })
      .then(r => setUnreadMap(r.data.data || {}))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!location.state) return;

    const { openUserId, openGroupId } = location.state;

    if (openUserId) {
      const tryOpen = () => {
        const found = contacts.find(c => String(c.user_id) === String(openUserId));
        if (found) {
          selectContact(found);
          window.history.replaceState({}, document.title);
        }
      };
      if (contactsLoadedRef.current) {
        tryOpen();
      } else {
        const interval = setInterval(() => {
          if (contactsLoadedRef.current) {
            clearInterval(interval);
            tryOpen();
          }
        }, 100);
        return () => clearInterval(interval);
      }
    } else if (openGroupId) {
      const tryOpen = () => {
        const found = groups.find(g => String(g._id) === String(openGroupId));
        if (found) {
          selectGroup(found);
          window.history.replaceState({}, document.title);
        }
      };
      if (groupsLoadedRef.current) {
        tryOpen();
      } else {
        const interval = setInterval(() => {
          if (groupsLoadedRef.current) {
            clearInterval(interval);
            tryOpen();
          }
        }, 100);
        return () => clearInterval(interval);
      }
    }
  }, [location.state, contacts, groups]);

  useEffect(() => {
    const onOpenDirect = (e) => {
      const userId = e.detail?.userId;
      if (!userId) return;
      const found = contacts.find(c => String(c.user_id) === String(userId));
      if (found) selectContact(found);
    };

    const onOpenGroup = (e) => {
      const groupId = e.detail?.groupId;
      if (!groupId) return;
      const found = groups.find(g => String(g._id) === String(groupId));
      if (found) selectGroup(found);
    };

    window.addEventListener("openDirectChat", onOpenDirect);
    window.addEventListener("openGroupChat", onOpenGroup);
    return () => {
      window.removeEventListener("openDirectChat", onOpenDirect);
      window.removeEventListener("openGroupChat", onOpenGroup);
    };
  }, [contacts, groups]);

  useEffect(() => {
    if (!socket) return;

    listenersRegistered.current = true;

    const onReceive = (msg) => {
      if (!msg) return;
      setMessages(prev => dedupMsgs([...prev, msg]));
      const sid = String(msg.sender_id?._id || msg.sender_id || "").trim();
      if (activeContactRef.current?.user_id?.toString() === sid) {
        socket.emit("mark_read", { sender_id: sid });
      }
    };

    const onSent = (msg) => {
      if (!isGroupChatRef.current && msg) {
        setMessages(prev => dedupMsgs([...prev, msg]));
      }
    };

    const onGroupMessage = ({ group_id, message }) => {
      if (!message || !message._id) return;

      if (activeGroupRef.current && String(activeGroupRef.current._id) === String(group_id)) {
        setMessages(prev => dedupMsgs([...prev, message]));

        const senderId = message.sender_id?._id || message.sender_id;
        if (String(senderId) !== String(currentUserId)) {
          socket.emit("mark_group_read", { group_id });
          setGroupUnreadMap(prev => ({ ...prev, [String(group_id)]: 0 }));
        }
      }

      setGroups(prev => prev.map(g =>
        String(g._id) === String(group_id)
          ? { ...g, last_message_time: message.createdAt, last_message_preview: message.content || "📎 File", last_message_sender: message.sender_id?.name }
          : g
      ));
    };

    const onTyping = ({ userId }) => {
      if (activeContactRef.current?.user_id?.toString() === userId?.toString()) setIsTyping(true);
    };
    const onStopTyping = ({ userId }) => {
      if (activeContactRef.current?.user_id?.toString() === userId?.toString()) setIsTyping(false);
    };

    const onOnline = ({ userId }) => setOnlineUsers(p => new Set([...p, userId]));
    const onOffline = ({ userId }) => setOnlineUsers(p => { const s = new Set(p); s.delete(userId); return s; });

    const onDeleted = ({ message_id, type }) => {
      if (!isGroupChatRef.current) {
        if (type === "everyone") {
          setMessages(p => p.map(m => m._id === message_id ? { ...m, deleted_for_everyone: true, content: "", file_url: null } : m));
        } else {
          setMessages(p => p.filter(m => m._id !== message_id));
        }
      }
    };

    const onReaction = ({ message_id, reactions }) => {
      if (!isGroupChatRef.current) setMessages(p => p.map(m => m._id === message_id ? { ...m, reactions } : m));
    };

    const onGroupMessageDeleted = ({ message_id, type, group_id }) => {
      if (activeGroupRef.current && String(activeGroupRef.current._id) === String(group_id)) {
        if (type === "everyone") {
          setMessages(p => p.map(m => m._id === message_id ? { ...m, deleted_for_everyone: true, content: "", file_url: null } : m));
        } else {
          setMessages(p => p.filter(m => m._id !== message_id));
        }
      }
    };

    const onGroupReaction = ({ message_id, reactions, group_id }) => {
      if (activeGroupRef.current && String(activeGroupRef.current._id) === String(group_id)) {
        setMessages(p => p.map(m => m._id === message_id ? { ...m, reactions } : m));
      }
    };

    const onGroupTyping = ({ userId, group_id }) => {
      if (activeGroupRef.current && String(activeGroupRef.current._id) === String(group_id)) {
        setTypingUsers(p => new Set([...p, userId]));
      }
    };

    const onGroupStopTyping = ({ userId, group_id }) => {
      if (activeGroupRef.current && String(activeGroupRef.current._id) === String(group_id)) {
        setTypingUsers(p => { const s = new Set(p); s.delete(userId); return s; });
      }
    };

    socket.on("receive_message", onReceive);
    socket.on("message_sent", onSent);
    socket.on("group_message", onGroupMessage);
    socket.on("user_typing", onTyping);
    socket.on("user_stopped_typing", onStopTyping);
    socket.on("user_online", onOnline);
    socket.on("user_offline", onOffline);
    socket.on("message_deleted", onDeleted);
    socket.on("message_reaction", onReaction);
    socket.on("group_message_deleted", onGroupMessageDeleted);
    socket.on("group_message_reaction", onGroupReaction);
    socket.on("group_user_typing", onGroupTyping);
    socket.on("group_user_stopped_typing", onGroupStopTyping);

    return () => {
      socket.off("receive_message", onReceive);
      socket.off("message_sent", onSent);
      socket.off("group_message", onGroupMessage);
      socket.off("user_typing", onTyping);
      socket.off("user_stopped_typing", onStopTyping);
      socket.off("user_online", onOnline);
      socket.off("user_offline", onOffline);
      socket.off("message_deleted", onDeleted);
      socket.off("message_reaction", onReaction);
      socket.off("group_message_deleted", onGroupMessageDeleted);
      socket.off("group_message_reaction", onGroupReaction);
      socket.off("group_user_typing", onGroupTyping);
      socket.off("group_user_stopped_typing", onGroupStopTyping);
      listenersRegistered.current = false;
    };
  }, [socket]);

  const loadMoreOldMessages = useCallback(async () => {
    if (loadingOldMsgs || !hasMoreMessages) return;
    const currentActive = activeContactRef.current;
    const currentGroup = activeGroupRef.current;
    if (!currentActive && !currentGroup) return;

    setLoadingOldMsgs(true);
    try {
      const offset = messages.length;
      const url = currentGroup
        ? `${API}/groups/${currentGroup._id}/messages?offset=${offset}&limit=${MESSAGES_PER_PAGE}`
        : `${API}/chat/messages/${currentActive.user_id}?offset=${offset}&limit=${MESSAGES_PER_PAGE}`;

      const response = await axios.get(url, { headers: authHeaders() });
      const oldMessages = response.data.data || [];
      loadingCountRef.current = oldMessages.length;

      if (oldMessages.length < MESSAGES_PER_PAGE) setHasMoreMessages(false);

      if (oldMessages.length > 0) {
        previousHeightRef.current = chatContainerRef.current?.scrollHeight || 0;
        setMessages(prev => dedupMsgs([...oldMessages, ...prev]));
      }
    } catch (err) {
      console.error("Load old messages error:", err);
    } finally {
      setLoadingOldMsgs(false);
    }
  }, [loadingOldMsgs, hasMoreMessages, messages.length]);

  const handleScroll = useCallback((e) => {
    if (e.target.scrollTop < 100 && !loadingOldMsgs && hasMoreMessages) loadMoreOldMessages();
  }, [loadingOldMsgs, hasMoreMessages, loadMoreOldMessages]);

  useEffect(() => {
    if (loadingCountRef.current > 0 && chatContainerRef.current) {
      const newHeight = chatContainerRef.current.scrollHeight;
      chatContainerRef.current.scrollTop = newHeight - previousHeightRef.current;
      loadingCountRef.current = 0;
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      setActiveChatContact(null);
      setActiveChatGroup(null);
    };
  }, []);

  useEffect(() => {
    if (!activeContact) return;
    setLoadingMsgs(true);
    setMessages([]);
    setIsTyping(false);
    setReplyTo(null);
    setHasMoreMessages(true);
    loadingCountRef.current = 0;

    resetUnreadForSender(activeContact.user_id.toString());
    setUnreadMap(p => ({ ...p, [activeContact.user_id]: 0 }));

    axios
      .get(`${API}/chat/messages/${activeContact.user_id}?offset=0&limit=${MESSAGES_PER_PAGE}`, { headers: authHeaders() })
      .then(r => {
        const initial = dedupMsgs(r.data.data || []);
        const total = r.data.totalCount || 0;
        setMessages(initial);
        setTotalMessages(total);
        if (initial.length < MESSAGES_PER_PAGE || initial.length >= total) setHasMoreMessages(false);
        socketRef.current?.emit("mark_read", { sender_id: activeContact.user_id });
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "auto" }), 50);
      })
      .catch(console.error)
      .finally(() => setLoadingMsgs(false));
  }, [activeContact?.user_id]);

  useEffect(() => {
    if (!activeGroup) return;
    setLoadingMsgs(true);
    setMessages([]);
    setTypingUsers(new Set());
    setReplyTo(null);
    setHasMoreMessages(true);
    loadingCountRef.current = 0;

    resetUnreadForGroup(activeGroup._id);
    setGroupUnreadMap(p => ({ ...p, [String(activeGroup._id)]: 0 }));

    socketRef.current?.emit("join_group_room", { group_id: activeGroup._id });

    axios
      .get(`${API}/groups/${activeGroup._id}/messages?offset=0&limit=${MESSAGES_PER_PAGE}`, { headers: authHeaders() })
      .then(r => {
        const initial = dedupMsgs(r.data.data || []);
        const total = r.data.totalCount || 0;
        setMessages(initial);
        setTotalMessages(total);
        if (initial.length < MESSAGES_PER_PAGE || initial.length >= total) setHasMoreMessages(false);
        socketRef.current?.emit("mark_group_read", { group_id: activeGroup._id });
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "auto" }), 50);
      })
      .catch(console.error)
      .finally(() => setLoadingMsgs(false));
  }, [activeGroup?._id]);

  const sendMessage = useCallback(() => {
    const currentSocket = socketRef.current;
    const currentInput = inputRef.current;
    const currentUploadPreview = uploadPreviewRef.current;
    const currentReplyTo = replyToRef.current;
    const currentContact = activeContactRef.current;
    const currentGroup = activeGroupRef.current;
    const currentIsGroup = isGroupChatRef.current;

    if (!currentSocket) return;
    if (!currentInput.trim() && !currentUploadPreview) return;
    if (!currentContact && !currentGroup) return;

    const messageData = {
      content: currentInput.trim(),
      reply_to: currentReplyTo?._id || null,
      file_url: currentUploadPreview?.file_url || null,
      file_name: currentUploadPreview?.file_name || null,
      file_type: currentUploadPreview?.file_type || null,
      file_size: currentUploadPreview?.file_size || null,
    };

    if (currentIsGroup) {
      currentSocket.emit("send_group_message", { ...messageData, group_id: currentGroup._id });
    } else {
      currentSocket.emit("send_message", { ...messageData, receiver_id: currentContact.user_id });
      currentSocket.emit("typing_stop", { receiver_id: currentContact.user_id });
    }

    clearTimeout(typingTimeout.current);
    setInput("");
    setReplyTo(null);
    setUploadPreview(null);
    textareaRef.current?.focus();
  }, []);

  const handleTyping = (e) => {
    setInput(e.target.value);
    const currentSocket = socketRef.current;
    if (!currentSocket) return;

    if (isGroupChatRef.current && activeGroupRef.current) {
      currentSocket.emit("group_typing_start", { group_id: activeGroupRef.current._id });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        currentSocket.emit("group_typing_stop", { group_id: activeGroupRef.current._id });
      }, 1500);
    } else if (activeContactRef.current) {
      currentSocket.emit("typing_start", { receiver_id: activeContactRef.current.user_id });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        currentSocket.emit("typing_stop", { receiver_id: activeContactRef.current.user_id });
      }, 1500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await axios.post(`${API}/chat/upload`, form, {
        headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) setUploadPreview(res.data.data);
    } catch (err) {
      console.error("File upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleReact = (msgId, emoji) => {
    const currentSocket = socketRef.current;
    if (!currentSocket) return;
    if (isGroupChatRef.current && activeGroupRef.current) {
      currentSocket.emit("react_group_message", { message_id: msgId, emoji, group_id: activeGroupRef.current._id });
    } else if (activeContactRef.current) {
      currentSocket.emit("react_message", { message_id: msgId, emoji, receiver_id: activeContactRef.current.user_id });
    }
    setEmojiPickerMsgId(null);
  };

  const handleDelete = (msg, type) => {
    const currentSocket = socketRef.current;
    if (!currentSocket) return;
    if (isGroupChatRef.current && activeGroupRef.current) {
      currentSocket.emit("delete_group_message", { message_id: msg._id, type, group_id: activeGroupRef.current._id });
    } else if (activeContactRef.current) {
      currentSocket.emit("delete_message", { message_id: msg._id, type, receiver_id: activeContactRef.current.user_id });
    }
    setContextMenu(null);
  };

  const openContextMenu = (e, msg, isMine) => {
    e.preventDefault();
    e.stopPropagation();
    const container = chatContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const menuWidth = 180;
    const menuHeight = isMine ? 120 : 88;
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    if (x + menuWidth > rect.width) x = rect.width - menuWidth - 8;
    if (x < 8) x = 8;
    if (y + menuHeight > rect.height) y = y - menuHeight;
    if (y < 8) y = 8;
    setContextMenu({ x, y, msg, isMine });
    setEmojiPickerMsgId(null);
  };

  const handleCopyLink = (id, link) => {
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedMsgId(id);
      setTimeout(() => setCopiedMsgId(null), 2000);
    });
  };

  const selectContact = (c) => {
    setActiveChatContact(c.user_id.toString());
    setActiveChatGroup(null);
    setActiveContact(c);
    setActiveGroup(null);
    setActiveTab("dms");
    if (isMobile || isTablet) setShowChat(true);
  };

  const selectGroup = (g) => {
    setActiveChatGroup(String(g._id));
    setActiveChatContact(null);
    setActiveGroup(g);
    setActiveContact(null);
    setShowGroupSettings(false);
    setActiveTab("groups");
    if (isMobile || isTablet) setShowChat(true);
  };

  const handleGroupCreated = (newGroup) => {
    setGroups(prev => [newGroup, ...prev]);
    setActiveTab("groups");
    selectGroup(newGroup);
  };

  const handleGroupUpdated = (updated) => {
    setGroups(prev => prev.map(g => String(g._id) === String(updated._id) ? { ...g, ...updated } : g));
    setActiveGroup(prev => prev && String(prev._id) === String(updated._id) ? { ...prev, ...updated } : prev);
  };

  const handleGroupLeft = () => {
    setGroups(prev => prev.filter(g => String(g._id) !== String(activeGroup?._id)));
    setActiveGroup(null);
    setShowGroupSettings(false);
    setMessages([]);
    if (isMobile || isTablet) setShowChat(false);
  };

  const filteredContacts = contacts.filter(c =>
    c.name?.toLowerCase().includes(searchQ.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQ.toLowerCase())
  );

  const filteredGroups = groups.filter(g =>
    g.name?.toLowerCase().includes(searchQ.toLowerCase())
  );

  const totalUnread = Object.values(unreadMap).reduce((a, b) => a + b, 0);
  const totalGroupUnread = Object.values(groupUnreadMap).reduce((a, b) => a + b, 0);

  const groupedMessages = messages.reduce((groups, msg) => {
    if (!msg) return groups;
    const day = new Date(msg.createdAt).toDateString();
    if (!groups[day]) groups[day] = [];
    groups[day].push(msg);
    return groups;
  }, {});

  const isContactOnline = activeContact ? onlineUsers.has(activeContact.user_id?.toString()) : false;

  const getSenderId = (msg) => {
    if (!msg) return null;
    if (msg.sender_id?._id) return String(msg.sender_id._id).trim();
    if (msg.sender_id) return String(msg.sender_id).trim();
    return null;
  };

  const getReactionSummary = (reactions = []) => {
    const map = {};
    reactions.forEach(r => { map[r.emoji] = (map[r.emoji] || 0) + 1; });
    return Object.entries(map);
  };

  const myReaction = (reactions = []) =>
    reactions.find(r => r.user_id?.toString() === currentUserId)?.emoji || null;

  const getGroupTypingText = () => {
    if (typingUsers.size === 0) return null;
    const names = activeGroup?.members
      ?.filter(m => typingUsers.has(String(m.user_id?._id || m.user_id)))
      .map(m => m.user_id?.name?.split(" ")[0])
      .filter(Boolean) || [];
    if (names.length === 0) return "Someone is typing...";
    if (names.length === 1) return `${names[0]} is typing...`;
    return `${names.slice(0, 2).join(", ")} are typing...`;
  };

  const contactListWidth = isMobile ? "100%" : isTablet ? 260 : 320;
  const showContactList = isMobile ? !showChat : true;
  const showChatPanel = isMobile ? showChat : true;
  const currentChatName = isGroupChat ? activeGroup?.name : activeContact?.name;

  const renderMessage = (msg, idx, dayMsgs, uniqueKey) => {
    if (!msg) return null;

    const sid = getSenderId(msg);
    const isMine = sid && currentUserId && sid === currentUserId;
    const prevSid = getSenderId(dayMsgs[idx - 1]);
    const nextSid = getSenderId(dayMsgs[idx + 1]);
    const isFirst = prevSid !== sid;
    const isLast = nextSid !== sid;
    const reactions = getReactionSummary(msg.reactions || []);
    const myEmoji = myReaction(msg.reactions || []);
    const showEmojiPicker = emojiPickerMsgId === msg._id;
    const senderName = msg.sender_id?.name || (isGroupChat ? "Member" : activeContact?.name) || "Unknown";

    if (msg.system_message) {
      return (
        <div key={uniqueKey || msg._id || idx} style={{ display: "flex", justifyContent: "center", margin: "8px 0" }}>
          <span style={{ fontSize: "0.72rem", color: t.systemText, background: t.systemMsg, padding: "4px 14px", borderRadius: 20 }}>
            {msg.content}
          </span>
        </div>
      );
    }

    const getBubbleRadius = () => {
      if (isMine) {
        if (isFirst && isLast) return "18px 4px 18px 18px";
        if (isFirst) return "18px 4px 6px 18px";
        if (isLast) return "18px 6px 4px 18px";
        return "18px 4px 4px 18px";
      } else {
        if (isFirst && isLast) return "4px 18px 18px 18px";
        if (isFirst) return "4px 18px 18px 6px";
        if (isLast) return "6px 18px 18px 4px";
        return "4px 18px 18px 4px";
      }
    };

    if (msg.deleted_for_everyone) {
      return (
        <div key={uniqueKey || msg._id || idx} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start", marginTop: isFirst ? 8 : 2, paddingLeft: isMine ? "15%" : "4px", paddingRight: isMine ? "4px" : "15%" }}>
          <div style={{ padding: "7px 13px", borderRadius: 14, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 6 }}>
            <Trash2 size={12} color={t.deletedText} />
            <span style={{ fontSize: "0.8rem", color: t.deletedText, fontStyle: "italic" }}>
              {isMine ? "You deleted this message" : "This message was deleted"}
            </span>
          </div>
        </div>
      );
    }

    const meetingInfo = parseMeetingMessage(msg.content);

    if (meetingInfo) {
      const isCopied = copiedMsgId === msg._id;
      return (
        <div
          key={uniqueKey || msg._id || idx}
          className="msg-bubble"
          style={{
            display: "flex", justifyContent: isMine ? "flex-end" : "flex-start",
            alignItems: "flex-end", gap: 6, marginTop: isFirst ? 8 : 2,
            animation: "bubbleIn 0.18s ease",
            paddingLeft: isMine ? "12%" : "4px", paddingRight: isMine ? "4px" : "12%",
          }}
        >
          {!isMine && (
            <div style={{ width: 28, height: 28, flexShrink: 0, marginBottom: 2 }}>
              {isLast && <Avatar name={senderName} size={28} />}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start" }}>
            <div
              style={{
                width: isMobile ? 235 : 280,
                background: t.bubbleIn,
                border: `1px solid ${t.border}`,
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: t.bubbleShadow,
              }}
            >
              <div style={{ padding: "14px 16px 10px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#1A73E8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Video size={18} color="#fff" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.88rem", color: t.textPrimary, wordBreak: "break-word" }}>
                    {meetingInfo.title}
                  </div>
                  <div style={{ fontSize: "0.74rem", color: t.textSecondary, marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
                    <Calendar size={11} />
                    {meetingInfo.date}{meetingInfo.time ? ` · ${meetingInfo.time}` : ""}
                  </div>
                </div>
              </div>

              {meetingInfo.location && (
                <div style={{ padding: "0 16px 10px", fontSize: "0.76rem", color: t.textSecondary }}>
                  📍 {meetingInfo.location}
                </div>
              )}

              {meetingInfo.agenda && (
                <div style={{ padding: "0 16px 10px", fontSize: "0.76rem", color: t.textSecondary, lineHeight: 1.4 }}>
                  {meetingInfo.agenda}
                </div>
              )}

              {meetingInfo.link && (
                <div style={{ padding: "4px 14px 14px", display: "flex", gap: 8 }}>
                  <a href={meetingInfo.link}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      background: "#1A73E8", color: "#fff", textDecoration: "none",
                      padding: "9px 0", borderRadius: 8, fontSize: "0.82rem", fontWeight: 600,
                    }}
                  >
                    <Video size={14} /> Join meeting
                  </a>
                  <button
                    onClick={() => handleCopyLink(msg._id, meetingInfo.link)}
                    style={{
                      width: 38, border: `1px solid ${t.inputBorder}`, borderRadius: 8, background: "transparent",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: t.textMuted,
                    }}
                  >
                    {isCopied ? <Check size={14} color="#22C55E" /> : <Copy size={14} />}
                  </button>
                </div>
              )}
            </div>
            <div style={{ fontSize: "0.68rem", color: t.textMuted, marginTop: 4, padding: isMine ? "0 4px 0 0" : "0 0 0 4px" }}>
              {formatTime(msg.createdAt)}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={uniqueKey || msg._id || idx}
        className="msg-bubble"
        style={{
          display: "flex", justifyContent: isMine ? "flex-end" : "flex-start",
          alignItems: "flex-end", gap: 6, marginTop: isFirst ? 8 : 2,
          animation: "bubbleIn 0.18s ease",
          paddingLeft: isMine ? "12%" : "4px", paddingRight: isMine ? "4px" : "12%",
          position: "relative",
        }}
        onContextMenu={e => openContextMenu(e, msg, isMine)}
      >
        {!isMine && (
          <div style={{ width: 28, height: 28, flexShrink: 0, marginBottom: 2 }}>
            {isLast && <Avatar name={senderName} size={28} />}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start", maxWidth: isMobile ? "85%" : "75%", minWidth: 0, position: "relative" }}>
          {!isMine && isFirst && isGroupChat && (
            <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#4F46E5", marginLeft: 4, marginBottom: 2 }}>
              {senderName}
            </span>
          )}

          {msg.reply_to && (
            <div style={{
              background: isMine ? "rgba(255,255,255,0.12)" : t.replyBg,
              borderLeft: `3px solid ${t.accent}`, borderRadius: "8px 8px 0 0",
              padding: "5px 10px", marginBottom: -4, maxWidth: "100%",
              fontSize: "0.75rem", color: isMine ? "rgba(255,255,255,0.8)" : t.textSecondary,
            }}>
              <div style={{ fontWeight: 600, color: t.accent, marginBottom: 1, fontSize: "0.72rem", display: "flex", alignItems: "center" }}>
                <CornerUpLeft size={10} style={{ marginRight: 3 }} />Reply
              </div>
              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>
                {msg.reply_to.file_type ? `📎 ${msg.reply_to.file_name || "File"}` : msg.reply_to.content}
              </div>
            </div>
          )}

          <div
            style={{
              padding: msg.file_type === "image" ? "4px" : "8px 12px",
              borderRadius: getBubbleRadius(),
              backgroundColor: isMine ? t.bubbleOut : t.bubbleIn,
              color: isMine ? t.bubbleOutText : t.bubbleInText,
              fontSize: isMobile ? "0.9rem" : "0.875rem",
              lineHeight: 1.55, wordBreak: "break-word", boxShadow: t.bubbleShadow,
              border: !isMine ? `1px solid ${t.border}` : "none", maxWidth: "100%",
            }}
          >
            {msg.file_url && (
              <div style={{ marginBottom: msg.content ? 6 : 0 }}>
                {msg.file_type === "image" ? (
                  <div style={{ position: "relative" }}>
                    <img
                      src={`${BASE_URL}${msg.file_url}`}
                      alt={msg.file_name || "image"}
                      style={{ maxWidth: isMobile ? 200 : 240, maxHeight: 200, borderRadius: 10, display: "block", cursor: "pointer", objectFit: "cover" }}
                      onClick={() => setLightboxUrl(`${BASE_URL}${msg.file_url}`)}
                    />
                    <a href={`${BASE_URL}${msg.file_url}`}
                      download={msg.file_name}
                      onClick={e => e.stopPropagation()}
                      style={{ position: "absolute", bottom: 6, right: 6, background: "rgba(0,0,0,0.5)", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}
                    >
                      <Download size={13} />
                    </a>
                  </div>
                ) : msg.file_type === "video" ? (
                  <video src={`${BASE_URL}${msg.file_url}`} controls style={{ maxWidth: isMobile ? 220 : 260, borderRadius: 10, display: "block" }} />
                ) : msg.file_type === "audio" ? (
                  <audio src={`${BASE_URL}${msg.file_url}`} controls style={{ maxWidth: isMobile ? 200 : 240, display: "block" }} />
                ) : (
                  <a href={`${BASE_URL}${msg.file_url}`}
                    download={msg.file_name}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: isMine ? "rgba(255,255,255,0.9)" : t.textPrimary, padding: "4px 2px" }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: 8, background: isMine ? "rgba(255,255,255,0.15)" : t.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <FileText size={18} color={isMine ? "#fff" : t.accent} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "0.82rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: isMobile ? 120 : 160 }}>{msg.file_name || "File"}</div>
                      {msg.file_size && <div style={{ fontSize: "0.7rem", opacity: 0.65, marginTop: 1 }}>{formatFileSize(msg.file_size)}</div>}
                    </div>
                    <Download size={15} style={{ flexShrink: 0, opacity: 0.65 }} />
                  </a>
                )}
              </div>
            )}

            {msg.content && <span style={{ whiteSpace: "pre-wrap" }}>{linkify(msg.content)}</span>}

            {isLast && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3, marginTop: 3 }}>
                <span style={{ fontSize: "0.68rem", opacity: 0.65, whiteSpace: "nowrap" }}>
                  {formatTime(msg.createdAt)}
                </span>
                {isMine && !isGroupChat && (
                  msg.is_read
                    ? <CheckCheck size={13} style={{ color: "#93C5FD", opacity: 0.9 }} />
                    : <Check size={13} style={{ opacity: 0.6 }} />
                )}
                {isMine && isGroupChat && msg.read_by && (
                  msg.read_by.length > 1
                    ? <CheckCheck size={13} style={{ color: "#93C5FD", opacity: 0.9 }} />
                    : <Check size={13} style={{ opacity: 0.6 }} />
                )}
              </div>
            )}
          </div>

          {reactions.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 3 }}>
              {reactions.map(([emoji, count]) => (
                <button
                  key={emoji}
                  className="reaction-chip"
                  onClick={() => handleReact(msg._id, emoji)}
                  style={{
                    background: myEmoji === emoji ? t.accentLight : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"),
                    border: myEmoji === emoji ? `1px solid ${t.accent}` : "1px solid transparent",
                    borderRadius: 20, padding: "2px 7px", fontSize: "0.78rem",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 3, transition: "transform 0.12s",
                  }}
                >
                  {emoji} {count > 1 && <span style={{ fontSize: "0.7rem", color: t.textSecondary }}>{count}</span>}
                </button>
              ))}
            </div>
          )}

          <div
            className="msg-actions"
            style={{
              position: "absolute", top: -34, ...(isMine ? { right: 0 } : { left: 0 }),
              display: "flex", gap: 2, background: t.contextBg,
              border: `1px solid ${t.contextBorder}`, borderRadius: 20, padding: "3px 6px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.14)", zIndex: 50, opacity: 0, whiteSpace: "nowrap",
            }}
          >
            <button
              className="emoji-btn-react icon-btn"
              data-emoji-picker={showEmojiPicker ? "true" : undefined}
              style={{ fontSize: 14, padding: "2px 3px", transition: "transform 0.12s", borderRadius: 6 }}
              onClick={e => { e.stopPropagation(); setEmojiPickerMsgId(showEmojiPicker ? null : msg._id); }}
            >😊</button>
            <button
              className="icon-btn"
              style={{ padding: "2px 4px", color: t.textMuted }}
              onClick={() => { setReplyTo(msg); textareaRef.current?.focus(); }}
            >
              <Reply size={13} />
            </button>
            <button
              className="icon-btn"
              style={{ padding: "2px 4px", color: t.textMuted }}
              onClick={e => { e.stopPropagation(); openContextMenu(e, msg, isMine); }}
            >
              <MoreVertical size={13} />
            </button>
          </div>

          {showEmojiPicker && (
            <div
              data-emoji-picker="true"
              style={{
                position: "absolute", top: -72, ...(isMine ? { right: 0 } : { left: 0 }),
                background: t.contextBg, border: `1px solid ${t.contextBorder}`,
                borderRadius: 20, padding: "6px 10px", display: "flex", gap: 6,
                zIndex: 100, boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                animation: "scaleIn 0.12s ease", whiteSpace: "nowrap",
              }}
            >
              {EMOJI_LIST.map(emoji => (
                <button
                  key={emoji}
                  className="emoji-btn-react"
                  onClick={() => handleReact(msg._id, emoji)}
                  style={{
                    background: "none", border: "none", fontSize: isMobile ? 18 : 20,
                    cursor: "pointer", padding: "2px", transition: "transform 0.12s",
                    borderRadius: 6, opacity: myEmoji === emoji ? 1 : 0.75,
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes bubbleIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        .contact-row { transition: background 0.13s; }
        .contact-row:hover { background: ${t.rowHover} !important; }
        .send-btn:hover:not(:disabled) { background: #4338CA !important; transform: scale(1.06); }
        .send-btn:active:not(:disabled) { transform: scale(0.96) !important; }
        .send-btn:disabled { opacity: 0.38; cursor: not-allowed; }
        .chat-input:focus { outline: none; border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.12); }
        .search-box { outline: none; }
        .icon-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: background 0.13s; }
        .icon-btn:hover { background: ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"}; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: ${isDark ? "#2D3748" : "#D1D5DB"}; border-radius: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        .typing-dot { animation: bounce 1.3s infinite; display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: ${t.accent}; margin: 0 2px; }
        .typing-dot:nth-child(2){animation-delay:.15s}
        .typing-dot:nth-child(3){animation-delay:.3s}
        .msg-bubble { position: relative; }
        .msg-bubble:hover .msg-actions { opacity: 1 !important; }
        .emoji-btn-react:hover { transform: scale(1.25); }
        .ctx-item:hover { background: ${isDark ? "rgba(255,255,255,0.06)" : "#F5F7FF"}; }
        .reaction-chip:hover { transform: scale(1.08); }
        .tab-btn { flex: 1; padding: 8px 0; background: none; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 500; transition: all 0.15s; position: relative; }
        @media (max-width: 640px) { .chat-input { font-size: 16px !important; } }
      `}</style>

      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <button onClick={() => setLightboxUrl(null)} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
            <X size={26} />
          </button>
          <img
            src={lightboxUrl}
            alt=""
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: "92vw", maxHeight: "88vh", borderRadius: 10, objectFit: "contain" }}
          />
        </div>
      )}

      {showCreateGroup && (
        <CreateGroupModal t={t} isDark={isDark} onClose={() => setShowCreateGroup(false)} onCreate={handleGroupCreated} />
      )}

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div
        style={{
          marginLeft: `${sidebarWidth}px`, flex: 1, transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
          display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", minWidth: 0,
        }}
      >
        <div
          style={{
            height: isMobile ? 56 : 64, backgroundColor: t.topbar, borderBottom: `1px solid ${t.border}`,
            display: "flex", alignItems: "center", padding: isMobile ? "0 14px" : "0 20px", gap: 10,
            flexShrink: 0, zIndex: 100, boxShadow: isDark ? "0 1px 4px rgba(0,0,0,0.3)" : "0 1px 4px rgba(15,23,42,0.04)",
          }}
        >
          <div style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <MessageSquare size={17} color={t.accent} />
          </div>
          <span style={{ fontWeight: 600, fontSize: isMobile ? "0.95rem" : "1rem", color: t.textPrimary }}>Messages</span>
          {(totalUnread + totalGroupUnread) > 0 && (
            <span style={{ background: "#EF4444", color: "#fff", borderRadius: 20, fontSize: 11, fontWeight: 700, padding: "2px 8px", lineHeight: 1.4 }}>
              {totalUnread + totalGroupUnread}
            </span>
          )}
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px" }}>
            <NotificationPermission />
            <span style={{
              fontSize: "0.7rem",
              color: socket ? "#22C55E" : "#EF4444",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              <span style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: socket ? "#22C55E" : "#EF4444",
                animation: socket ? "pulse 2s infinite" : "none"
              }} />
              {socket ? "Connected" : "Connecting…"}
            </span>
          </span>
        </div>

        <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0, position: "relative" }}>
          {showContactList && (
            <div
              style={{
                width: contactListWidth, minWidth: isMobile ? "100%" : isTablet ? 220 : 260,
                borderRight: isMobile ? "none" : `1px solid ${t.border}`,
                backgroundColor: t.sidebarPanel, display: "flex", flexDirection: "column",
                overflow: "hidden", flexShrink: 0,
                position: isMobile ? "absolute" : "relative", top: 0, left: 0, bottom: 0,
                zIndex: isMobile ? 10 : "auto",
              }}
            >
              <div style={{ padding: isMobile ? "12px 12px 8px" : "14px 14px 10px", borderBottom: `1px solid ${t.border}`, flexShrink: 0 }}>
                <div style={{ position: "relative" }}>
                  <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: t.textMuted, pointerEvents: "none" }} />
                  <input
                    className="search-box"
                    placeholder="Search..."
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px 9px 34px", border: "none", borderRadius: 10, fontSize: "0.83rem", color: t.textPrimary, backgroundColor: t.searchBg, fontFamily: "'DM Sans', sans-serif" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", borderBottom: `1px solid ${t.border}`, flexShrink: 0 }}>
                <button className="tab-btn" onClick={() => setActiveTab("dms")} style={{ color: activeTab === "dms" ? t.accent : t.textMuted, borderBottom: activeTab === "dms" ? `2px solid ${t.accent}` : "2px solid transparent" }}>
                  Chats {totalUnread > 0 && <span style={{ background: "#EF4444", color: "#fff", borderRadius: 20, fontSize: 10, fontWeight: 700, padding: "1px 6px", marginLeft: 4 }}>{totalUnread}</span>}
                </button>
                <button className="tab-btn" onClick={() => setActiveTab("groups")} style={{ color: activeTab === "groups" ? t.accent : t.textMuted, borderBottom: activeTab === "groups" ? `2px solid ${t.accent}` : "2px solid transparent" }}>
                  Groups {totalGroupUnread > 0 && <span style={{ background: "#EF4444", color: "#fff", borderRadius: 20, fontSize: 10, fontWeight: 700, padding: "1px 6px", marginLeft: 4 }}>{totalGroupUnread}</span>}
                </button>
              </div>

              <div style={{ flex: 1, overflowY: "auto" }}>
                {activeTab === "dms" ? (
                  loadingContacts ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 46, height: 46, borderRadius: "50%", background: t.skeletonBg, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ height: 12, width: "55%", background: t.skeletonBg, borderRadius: 4, marginBottom: 7 }} />
                          <div style={{ height: 10, width: "38%", background: t.skeletonBg, borderRadius: 4 }} />
                        </div>
                      </div>
                    ))
                  ) : filteredContacts.length === 0 ? (
                    <div style={{ padding: "52px 20px", textAlign: "center", color: t.textMuted, fontSize: "0.85rem" }}>
                      <MessageSquare size={34} style={{ marginBottom: 10, opacity: 0.22 }} />
                      <p style={{ margin: 0 }}>No contacts found</p>
                    </div>
                  ) : filteredContacts.map(c => {
                    const uid = c.user_id?.toString();
                    const isActive = activeContact?.user_id?.toString() === uid;
                    const isOnline = onlineUsers.has(uid);
                    const unread = unreadMap[uid] ?? 0;
                    return (
                      <div
                        key={uid}
                        className="contact-row"
                        onClick={() => selectContact(c)}
                        style={{
                          padding: isMobile ? "10px 14px" : "10px 16px", display: "flex", alignItems: "center",
                          gap: 12, cursor: "pointer",
                          backgroundColor: isActive ? t.activeRow : "transparent",
                          borderLeft: isActive ? `3px solid ${t.accent}` : "3px solid transparent",
                        }}
                      >
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          <Avatar name={c.name} size={isMobile ? 42 : 46} />
                          {isOnline && <span style={{ position: "absolute", bottom: 1, right: 1, width: 11, height: 11, borderRadius: "50%", background: "#22C55E", border: `2.5px solid ${t.sidebarPanel}` }} />}
                        </div>
                        <div style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 6, marginBottom: 3 }}>
                            <span style={{ fontWeight: 600, fontSize: "0.875rem", color: t.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
                            {c.last_message_time && (
                              <span style={{ fontSize: "0.7rem", color: unread > 0 ? t.accent : t.textMuted, flexShrink: 0, fontWeight: unread > 0 ? 600 : 400 }}>
                                {formatTime(c.last_message_time)}
                              </span>
                            )}
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "0.78rem", color: isOnline ? "#22C55E" : t.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {isOnline ? "Online" : c.last_message || c.role}
                            </span>
                            {unread > 0 && (
                              <span style={{ background: t.accent, color: "#fff", borderRadius: 20, fontSize: 10, fontWeight: 700, padding: "2px 7px", minWidth: 20, textAlign: "center", flexShrink: 0, lineHeight: 1.5 }}>
                                {unread > 9 ? "9+" : unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <div className="contact-row" onClick={() => setShowCreateGroup(true)} style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", borderBottom: `1px solid ${t.border}` }}>
                      <div style={{ width: 46, height: 46, borderRadius: 10, background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Plus size={20} color={t.accent} />
                      </div>
                      <span style={{ fontWeight: 600, fontSize: "0.875rem", color: t.accent }}>New group</span>
                    </div>

                    {loadingGroups ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 46, height: 46, borderRadius: 10, background: t.skeletonBg, flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ height: 12, width: "55%", background: t.skeletonBg, borderRadius: 4, marginBottom: 7 }} />
                            <div style={{ height: 10, width: "38%", background: t.skeletonBg, borderRadius: 4 }} />
                          </div>
                        </div>
                      ))
                    ) : filteredGroups.length === 0 ? (
                      <div style={{ padding: "40px 20px", textAlign: "center", color: t.textMuted, fontSize: "0.85rem" }}>
                        <Users size={34} style={{ marginBottom: 10, opacity: 0.22 }} />
                        <p style={{ margin: 0 }}>No groups yet</p>
                      </div>
                    ) : filteredGroups.map(g => {
                      const gid = String(g._id);
                      const isActive = String(activeGroup?._id) === gid;
                      const unread = groupUnreadMap[gid] ?? 0;
                      return (
                        <div key={gid} className="contact-row" onClick={() => selectGroup(g)} style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", backgroundColor: isActive ? t.activeRow : "transparent", borderLeft: isActive ? `3px solid ${t.accent}` : "3px solid transparent" }}>
                          <GroupAvatar name={g.name} src={g.avatar_url} size={isMobile ? 42 : 46} />
                          <div style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 6, marginBottom: 3 }}>
                              <span style={{ fontWeight: 600, fontSize: "0.875rem", color: t.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.name}</span>
                              {g.last_message_time && (
                                <span style={{ fontSize: "0.7rem", color: unread > 0 ? t.accent : t.textMuted, flexShrink: 0, fontWeight: unread > 0 ? 600 : 400 }}>
                                  {formatTime(g.last_message_time)}
                                </span>
                              )}
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: "0.78rem", color: t.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {g.last_message_sender ? `${g.last_message_sender.split(" ")[0]}: ` : ""}
                                {g.last_message_preview || `${g.members?.length} members`}
                              </span>
                              {unread > 0 && (
                                <span style={{ background: t.accent, color: "#fff", borderRadius: 20, fontSize: 10, fontWeight: 700, padding: "2px 7px", minWidth: 20, textAlign: "center", flexShrink: 0, lineHeight: 1.5 }}>
                                  {unread > 9 ? "9+" : unread}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          )}

          {showChatPanel && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0, width: isMobile ? "100%" : "auto", position: "relative" }}>
              {contextMenu && (
                <div
                  ref={contextMenuRef}
                  style={{
                    position: "absolute", top: contextMenu.y, left: contextMenu.x,
                    background: t.contextBg, border: `1px solid ${t.contextBorder}`,
                    borderRadius: 10, padding: "4px 0", zIndex: 8000, minWidth: 180,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.18)", animation: "scaleIn 0.12s ease",
                  }}
                >
                  <button className="ctx-item" onClick={() => { setReplyTo(contextMenu.msg); setContextMenu(null); textareaRef.current?.focus(); }} style={{ width: "100%", background: "none", border: "none", padding: "9px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, fontSize: "0.85rem", color: t.textPrimary }}>
                    <Reply size={15} /> Reply
                  </button>
                  <button className="ctx-item" onClick={() => handleDelete(contextMenu.msg, "me")} style={{ width: "100%", background: "none", border: "none", padding: "9px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, fontSize: "0.85rem", color: t.textPrimary }}>
                    <Trash2 size={15} /> Delete for me
                  </button>
                  {contextMenu.isMine && (
                    <button className="ctx-item" onClick={() => handleDelete(contextMenu.msg, "everyone")} style={{ width: "100%", background: "none", border: "none", padding: "9px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, fontSize: "0.85rem", color: "#EF4444" }}>
                      <Trash2 size={15} /> Delete for everyone
                    </button>
                  )}
                </div>
              )}

              {(activeContact || activeGroup) ? (
                <>
                  <div style={{ padding: isMobile ? "8px 12px" : "10px 16px", backgroundColor: t.topbar, borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0, boxShadow: isDark ? "0 1px 4px rgba(0,0,0,0.2)" : "0 1px 4px rgba(15,23,42,0.04)" }}>
                    {(isMobile || isTablet) && (
                      <button className="icon-btn" onClick={() => setShowChat(false)} style={{ color: t.accent, padding: 6 }}>
                        <ArrowLeft size={20} />
                      </button>
                    )}
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      {isGroupChat
                        ? <GroupAvatar name={activeGroup.name} src={activeGroup.avatar_url} size={isMobile ? 36 : 40} />
                        : <Avatar name={activeContact?.name || "Contact"} size={isMobile ? 36 : 40} />}
                      {!isGroupChat && isContactOnline && (
                        <span style={{ position: "absolute", bottom: 1, right: 1, width: 10, height: 10, borderRadius: "50%", background: "#22C55E", border: `2px solid ${t.topbar}` }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: isMobile ? "0.88rem" : "0.95rem", color: t.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {currentChatName || "Chat"}
                      </div>
                      <div style={{ fontSize: "0.72rem", marginTop: 1, display: "flex", alignItems: "center", gap: 4, color: t.textMuted }}>
                        {isGroupChat ? (
                          typingUsers.size > 0
                            ? <span style={{ color: t.accent }}>{getGroupTypingText()}</span>
                            : `${activeGroup.members?.length || 0} members`
                        ) : isTyping ? (
                          <span style={{ color: t.accent }}>typing...</span>
                        ) : isContactOnline ? (
                          <><Circle size={7} fill="#22C55E" color="#22C55E" />Online</>
                        ) : (
                          activeContact?.role || "Offline"
                        )}
                      </div>
                    </div>
                    {isGroupChat && (
                      <button className="icon-btn" onClick={() => setShowGroupSettings(!showGroupSettings)} style={{ color: showGroupSettings ? t.accent : t.textMuted, padding: 6, flexShrink: 0 }}>
                        <Info size={18} />
                      </button>
                    )}
                    <button className="icon-btn" style={{ color: t.textMuted, padding: 6, flexShrink: 0 }}>
                      <MoreVertical size={18} />
                    </button>
                  </div>

                  <div style={{ flex: 1, display: "flex", position: "relative", overflow: "hidden" }}>
                    <div
                      ref={chatContainerRef}
                      style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: isMobile ? "8px 6px 6px" : "12px 10px 8px", display: "flex", flexDirection: "column", backgroundColor: t.chatBg, minHeight: 0 }}
                      onScroll={handleScroll}
                      onClick={() => { setContextMenu(null); setEmojiPickerMsgId(null); }}
                    >
                      {loadingOldMsgs && (
                        <div style={{ display: "flex", justifyContent: "center", padding: "12px", gap: 6 }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.accent, animation: "bounce 1.3s infinite" }} />
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.accent, animation: "bounce 1.3s infinite 0.15s" }} />
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.accent, animation: "bounce 1.3s infinite 0.3s" }} />
                        </div>
                      )}

                      {loadingMsgs ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "8px 4px" }}>
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: i % 2 === 0 ? "flex-start" : "flex-end" }}>
                              <div style={{ height: 40, width: `${90 + (i % 4) * 44}px`, background: t.skeletonBg, borderRadius: 16 }} />
                            </div>
                          ))}
                        </div>
                      ) : messages.length === 0 ? (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: t.textMuted, gap: 12, animation: "fadeIn 0.3s ease", padding: "20px" }}>
                          <div style={{ width: 68, height: 68, borderRadius: "50%", backgroundColor: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {isGroupChat ? <Users size={28} color={t.accent} /> : <MessageSquare size={28} color={t.accent} />}
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <p style={{ margin: "0 0 5px", fontWeight: 600, fontSize: "0.95rem", color: t.textPrimary }}>
                              {isGroupChat ? `Welcome to ${activeGroup?.name || "Group"}!` : "Say hello 👋"}
                            </p>
                            <p style={{ margin: 0, fontSize: "0.82rem" }}>
                              {isGroupChat ? `${activeGroup?.members?.length || 0} members · Start the conversation` : `Start a conversation with ${activeContact?.name || "this person"}`}
                            </p>
                          </div>
                        </div>
                      ) : (
                        Object.entries(groupedMessages).map(([day, dayMsgs]) => (
                          <div key={day}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "10px 0 8px" }}>
                              <span style={{ fontSize: "0.72rem", fontWeight: 500, color: t.dividerText, backgroundColor: t.dividerBg, padding: "4px 14px", borderRadius: 20 }}>
                                {formatDateDivider(dayMsgs[0]?.createdAt)}
                              </span>
                            </div>
                            {dayMsgs.map((msg, idx) => {
                              const uniqueKey = msg._id || `${msg.createdAt}-${idx}-${msg.sender_id || idx}`;
                              return renderMessage(msg, idx, dayMsgs, uniqueKey);
                            })}
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {isGroupChat && showGroupSettings && (
                      <GroupSettingsPanel
                        group={activeGroup}
                        currentUserId={currentUserId}
                        t={t}
                        isDark={isDark}
                        onClose={() => setShowGroupSettings(false)}
                        onUpdate={handleGroupUpdated}
                        onLeave={handleGroupLeft}
                        onDelete={handleGroupLeft}
                      />
                    )}
                  </div>

                  {replyTo && (
                    <div style={{ padding: "8px 14px", backgroundColor: t.replyBg, borderTop: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      <CornerUpLeft size={14} color={t.accent} style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.72rem", fontWeight: 600, color: t.accent, marginBottom: 1 }}>
                          Replying to {replyTo.sender_id?.name || (isGroupChat ? "Unknown" : activeContact?.name) || "Someone"}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: t.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {replyTo.file_type ? `📎 ${replyTo.file_name || "File"}` : replyTo.content}
                        </div>
                      </div>
                      <button className="icon-btn" onClick={() => setReplyTo(null)} style={{ color: t.textMuted, padding: 4 }}>
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {uploadPreview && (
                    <div style={{ padding: "8px 14px", backgroundColor: t.topbar, borderTop: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      {uploadPreview.file_type === "image" ? (
                        <img src={`${BASE_URL}${uploadPreview.file_url}`} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <FileText size={18} color={t.accent} />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.82rem", fontWeight: 500, color: t.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{uploadPreview.file_name}</div>
                        <div style={{ fontSize: "0.72rem", color: t.textMuted }}>{formatFileSize(uploadPreview.file_size)}</div>
                      </div>
                      <button className="icon-btn" onClick={() => setUploadPreview(null)} style={{ color: t.textMuted, padding: 4 }}>
                        <X size={15} />
                      </button>
                    </div>
                  )}

                  <div style={{ padding: isMobile ? "6px 10px 8px" : "8px 12px 10px", backgroundColor: t.topbar, borderTop: `1px solid ${t.border}`, display: "flex", gap: isMobile ? 6 : 8, alignItems: "flex-end", flexShrink: 0 }}>
                    <input ref={fileInputRef} type="file" style={{ display: "none" }} accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" onChange={handleFileSelect} />
                    <button
                      className="icon-btn"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      style={{ color: uploading ? t.accent : t.textMuted, padding: 6, flexShrink: 0, width: isMobile ? 36 : 38, height: isMobile ? 36 : 38 }}
                    >
                      {uploading
                        ? <div style={{ width: 18, height: 18, border: `2px solid ${t.accent}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                        : <Paperclip size={isMobile ? 18 : 20} />}
                    </button>
                    <textarea
                      ref={textareaRef}
                      className="chat-input"
                      rows={1}
                      value={input}
                      onChange={handleTyping}
                      onKeyDown={handleKeyDown}
                      placeholder={socket ? "Type a message" : "Connecting…"}
                      disabled={!socket}
                      style={{
                        flex: 1, padding: isMobile ? "9px 12px" : "10px 14px", borderRadius: 24,
                        border: `1.5px solid ${t.inputBorder}`, fontSize: "0.875rem",
                        fontFamily: "'DM Sans', sans-serif", color: t.textPrimary, backgroundColor: t.inputBg,
                        resize: "none", lineHeight: 1.5, maxHeight: 120, overflowY: "auto",
                        transition: "border-color 0.15s, box-shadow 0.15s", minWidth: 0, display: "block",
                        opacity: socket ? 1 : 0.5,
                      }}
                    />
                    <button
                      className="send-btn"
                      onClick={sendMessage}
                      disabled={!socket || (!input.trim() && !uploadPreview)}
                      style={{
                        width: isMobile ? 38 : 42, height: isMobile ? 38 : 42, borderRadius: "50%",
                        border: "none", background: t.accent, color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", flexShrink: 0, transition: "background 0.15s, transform 0.12s",
                      }}
                    >
                      <Send size={isMobile ? 15 : 17} />
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: t.textMuted, backgroundColor: t.chatBg, animation: "fadeIn 0.3s ease", padding: "20px" }}>
                  <div style={{ width: 80, height: 80, borderRadius: "50%", background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <MessageSquare size={34} color={t.accent} />
                  </div>
                  <div style={{ textAlign: "center", maxWidth: 260 }}>
                    <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: "1rem", color: t.textPrimary }}>Select a conversation</p>
                    <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: 1.6, color: t.textMuted }}>Choose a contact or group from the list to start chatting</p>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 4 }}>
                    {["🔒 Encrypted", "⚡ Real-time", "📎 File sharing", "👥 Groups", "😊 Reactions"].map(tag => (
                      <span key={tag} style={{ fontSize: "0.72rem", fontWeight: 500, padding: "4px 12px", borderRadius: 20, backgroundColor: t.accentLight, color: t.accent }}>{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}