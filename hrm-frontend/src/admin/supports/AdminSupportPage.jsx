import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Sidebar from "../../layouts/sidebar";
import {
  Paperclip, Download, FileText, Image, X, Trash2,
  MessageSquare, Loader2, ChevronDown, Bell, Search,
  Clock, CheckCircle2, AlertCircle,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";
const EMOJI_LIST = ["👍", "👎", "❤️", "😂", "😮", "😢", "🔥", "✅"];

const fmtSz = (b) => {
  if (!b) return "";
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
  return (b / 1048576).toFixed(1) + " MB";
};
const isImg = (ft) => ft && ft.startsWith("image/");
const pArr = (d) => { if (!d) return []; if (Array.isArray(d)) return d; try { return JSON.parse(d); } catch { return []; } };
const pObj = (d) => { if (!d) return {}; if (typeof d === "object" && !Array.isArray(d)) return d; try { return JSON.parse(d); } catch { return {}; } };
const fmtT = (ts) => { if (!ts) return ""; return new Date(ts).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }); };
const renderC = (c) => String(c || "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>");
const tid = (ticket) => ticket?._id;
const userName = (ticket) => ticket?.user_id?.name || ticket?.user_name || "Unknown";
const userEmail = (ticket) => ticket?.user_id?.email || ticket?.user_email || "";

const statusConfig = {
  open:       { color: "#DC2626", bg: "#FFF1F2", label: "Open" },
  inprogress: { color: "#D97706", bg: "#FFFBEB", label: "In Progress" },
  closed:     { color: "#059669", bg: "#ECFDF5", label: "Closed" },
};

const StatusBadge = ({ status }) => {
  const s = statusConfig[status] || statusConfig.open;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "3px 10px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: "600",
      backgroundColor: s.bg, color: s.color,
    }}>
      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: s.color }} />
      {s.label}
    </span>
  );
};

function EmojiPicker({ onSelect, onClose }) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div style={{
      position: "absolute", zIndex: 9999, bottom: "calc(100% + 6px)",
      background: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px",
      boxShadow: "0 8px 24px rgba(15,23,42,0.12)", padding: "6px 8px",
      display: "flex", gap: "2px",
    }}>
      {EMOJI_LIST.map((e) => (
        <button key={e} onClick={() => { onSelect(e); onClose(); }} style={{
          background: "transparent", border: "none", cursor: "pointer",
          fontSize: "18px", padding: "4px 5px", borderRadius: "8px", lineHeight: 1,
          transition: "background 0.12s",
        }}
          onMouseEnter={(ev) => ev.currentTarget.style.background = "#F3F4F6"}
          onMouseLeave={(ev) => ev.currentTarget.style.background = "transparent"}
        >
          {e}
        </button>
      ))}
    </div>
  );
}

export default function AdminSupportPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reactions, setReactions] = useState({});
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [openCount, setOpenCount] = useState(0);
  const [attachments, setAttachments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [emojiPicker, setEmojiPicker] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [search, setSearch] = useState("");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const convEndRef = useRef(null);
  const fileRef = useRef(null);
  const selectedTicketRef = useRef(null);
  selectedTicketRef.current = selectedTicket;

  const adminName = localStorage.getItem("name") || "Admin";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const sidebarWidth = isOpen ? 255 : 68;

  const token = localStorage.getItem("token");
  const userId = (() => { try { return JSON.parse(atob(token.split(".")[1])).id; } catch { return null; } })();
  const headers = { "x-auth-token": token };

  const showToast = (m, t = "success") => {
    setToast({ message: m, type: t });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTickets = useCallback(async () => {
    try {
      const [tr, cr] = await Promise.all([
        axios.get(`${API}/api/support`, { headers }),
        axios.get(`${API}/api/support/count`, { headers }),
      ]);
      const all = Array.isArray(tr.data.data) ? tr.data.data : [];
      setTickets(all);
      setOpenCount(cr.data.count || 0);
      const current = selectedTicketRef.current;
      if (current) {
        const updated = all.find((t) => t._id === tid(current));
        if (updated) { setSelectedTicket(updated); setReactions(pObj(updated.reactions)); }
      }
    } catch {
      showToast("Failed to load tickets", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
    const iv = setInterval(fetchTickets, 15000);
    return () => clearInterval(iv);
  }, [fetchTickets]);

  useEffect(() => { convEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [selectedTicket]);

  useEffect(() => {
    if (!selectedTicket) { setAttachments([]); return; }
    const ticketId = tid(selectedTicket);
    if (!ticketId) return;
    axios.get(`${API}/api/attachments/${ticketId}`, { headers })
      .then((r) => {
        const raw = r.data.data;
        setAttachments(Array.isArray(raw) ? raw : raw ? [raw] : []);
      })
      .catch(() => setAttachments([]));
  }, [selectedTicket]);

  useEffect(() => {
    const h = () => { setContextMenu(null); setEmojiPicker(null); setStatusDropdownOpen(false);};
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  const selectTicket = (t) => {
    setSelectedTicket(t);
    setReactions(pObj(t.reactions));
    setReplyText("");
    setSelectedFile(null);
    setContextMenu(null);
    setEmojiPicker(null);
  };

  const handleReact = async (msgIdx, emoji) => {
    const ticketId = tid(selectedTicket);
    if (!ticketId || msgIdx == null) return;
    try {
      const res = await axios.post(`${API}/api/support/${ticketId}/react`, { messageIndex: msgIdx, emoji }, { headers });
      setReactions(typeof res.data.reactions === "object" ? res.data.reactions : {});
      setEmojiPicker(null);
    } catch { showToast("React failed", "error"); }
  };

  const handleDeleteMsg = async (msgIdx, scope) => {
    const ticketId = tid(selectedTicket);
    if (!ticketId || msgIdx == null) return;
    setContextMenu(null);
    try {
      await axios.delete(`${API}/api/support/${ticketId}/message`, { headers, data: { messageIndex: msgIdx, scope } });
      showToast(scope === "everyone" ? "Deleted for everyone" : "Deleted for you");
      const res = await axios.get(`${API}/api/support`, { headers });
      const all = Array.isArray(res.data.data) ? res.data.data : [];
      setTickets(all);
      const updated = all.find((t) => t._id === ticketId);
      if (updated) { setSelectedTicket(updated); setReactions(pObj(updated.reactions)); }
    } catch { showToast("Delete failed", "error"); }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    const ticketId = tid(selectedTicket);
    if (!ticketId) return;
    setSubmitting(true);
    try {
      await axios.post(`${API}/api/support/${ticketId}/message`, { content: replyText }, { headers });
      showToast("Reply sent!");
      setReplyText("");
      const res = await axios.get(`${API}/api/support`, { headers });
      const all = Array.isArray(res.data.data) ? res.data.data : [];
      setTickets(all);
      setOpenCount(all.filter((t) => t.status === "open").length);
      const updated = all.find((t) => t._id === ticketId);
      if (updated) { setSelectedTicket(updated); setReactions(pObj(updated.reactions)); }
    } catch (err) { showToast(err.response?.data?.message || "Failed to send", "error"); }
    finally { setSubmitting(false); }
  };

  const handleStatusChange = async (newStatus) => {
    const ticketId = tid(selectedTicket);
    if (!ticketId) return;
    setStatusUpdating(true);
    try {
      await axios.put(`${API}/api/support/${ticketId}/status`, { status: newStatus }, { headers });
      showToast(`Status set to ${newStatus}`);
      fetchTickets();
    } catch { showToast("Status update failed", "error"); }
    finally { setStatusUpdating(false); }
  };

  const handleDeleteTicket = async () => {
    const ticketId = tid(selectedTicket);
    if (!ticketId) return;
    if (!window.confirm("Delete this ticket permanently?")) return;
    try {
      await axios.delete(`${API}/api/support/${ticketId}`, { headers });
      showToast("Ticket deleted");
      setSelectedTicket(null);
      fetchTickets();
    } catch { showToast("Delete failed", "error"); }
  };

  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5242880) { showToast("Max 5 MB", "error"); return; }
    setSelectedFile(f);
  };

  const uploadFile = async () => {
    const ticketId = tid(selectedTicket);
    if (!selectedFile || !ticketId) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      await axios.post(`${API}/api/attachments/${ticketId}`, fd, { headers: { ...headers, "Content-Type": "multipart/form-data" } });
      showToast("File uploaded!");
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = "";
      const res = await axios.get(`${API}/api/attachments/${ticketId}`, { headers });
      const raw = res.data.data;
      setAttachments(Array.isArray(raw) ? raw : raw ? [raw] : []);
    } catch (err) { showToast(err.response?.data?.message || "Upload failed", "error"); }
    finally { setUploading(false); }
  };

  const buildThread = (ticket) =>
    pArr(ticket.messages)
      .map((m, i) => ({ ...m, _index: i }))
      .filter((m) => !(m.deletedFor || []).includes(userId))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const rKey = (msgIndex) => `message-${msgIndex}`;
  const thread = selectedTicket ? buildThread(selectedTicket) : [];

  const closedCount = tickets.filter((t) => t.status === "closed").length;
  const inProgressCount = tickets.filter((t) => t.status === "inprogress").length;

  const filteredTickets = tickets.filter((t) =>
    userName(t).toLowerCase().includes(search.toLowerCase()) ||
    (t.subject || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB", fontFamily: "'DM Sans', sans-serif" }}
      onClick={() => { setContextMenu(null); setEmojiPicker(null); }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .stat-card { transition: transform 0.18s, box-shadow 0.18s; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(15,23,42,0.10) !important; }
        .ticket-row { transition: background 0.12s; cursor: pointer; }
        .ticket-row:hover { background: #F5F7FF !important; }
        .ticket-row.selected { background: #EEF2FF !important; border-left: 3px solid #4F46E5; }
        .search-input:focus { outline: none; border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.10); }
        .topbar-btn:hover { background: #F3F4F6 !important; }
        .reply-input:focus { outline: none; border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.10); }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 4px; }
        * { box-sizing: border-box; }
      `}</style>

      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      {toast && (
        <div style={{
          position: "fixed", top: "20px", right: "20px", zIndex: 99999,
          background: toast.type === "error" ? "#DC2626" : "#059669",
          color: "#fff", padding: "12px 22px", borderRadius: "10px",
          fontWeight: "600", boxShadow: "0 4px 20px rgba(15,23,42,0.2)", fontSize: "0.875rem",
        }}>
          {toast.message}
        </div>
      )}

      <div style={{
        marginLeft: `${sidebarWidth}px`, flex: 1,
        transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column", minHeight: "100vh",
      }}>
        <div style={{
          height: "64px", backgroundColor: "#fff", borderBottom: "1px solid #F1F3F9",
          display: "flex", alignItems: "center", padding: "0 28px", gap: "16px",
          position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 4px rgba(15,23,42,0.04)",
        }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input
              className="search-input"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px 8px 36px", border: "1.5px solid #E5E7EB",
                borderRadius: "10px", fontSize: "0.875rem", color: "#374151", backgroundColor: "#F9FAFB",
                transition: "border-color 0.18s, box-shadow 0.18s",
              }}
            />
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <button className="topbar-btn" style={{
              width: "38px", height: "38px", borderRadius: "10px", border: "1.5px solid #E5E7EB",
              background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#6B7280", position: "relative",
            }}>
              <Bell size={17} />
              {openCount > 0 && <span style={{ position: "absolute", top: "8px", right: "8px", width: "7px", height: "7px", borderRadius: "50%", background: "#EF4444", border: "1.5px solid #fff" }} />}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "5px 12px 5px 6px", border: "1.5px solid #E5E7EB", borderRadius: "10px", background: "#fff", cursor: "pointer" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.72rem", fontWeight: "600" }}>
                {adminName.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: "0.83rem", fontWeight: "500", color: "#374151" }}>{adminName}</span>
            </div>
          </div>
        </div>

        <div style={{ padding: "28px 28px 40px", flex: 1 }}>
          <div style={{ marginBottom: "28px", animation: "fadeUp 0.4s ease both 0.05s" }}>
            <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 4px" }}>
              {greeting}, <strong style={{ color: "#4F46E5" }}>{adminName}</strong> 👋
            </p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.85rem", fontWeight: "700", color: "#111827", margin: 0, lineHeight: 1.2 }}>
              Support Tickets
              {openCount > 0 && (
                <span style={{ marginLeft: "10px", fontSize: "0.85rem", fontWeight: "600", color: "#DC2626", backgroundColor: "#FFF1F2", padding: "3px 10px", borderRadius: "20px", verticalAlign: "middle" }}>
                  {openCount} Open
                </span>
              )}
            </h1>
            <p style={{ color: "#9CA3AF", fontSize: "0.85rem", margin: "5px 0 0" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "28px" }}>
            {[
              { title: "Total Tickets", count: tickets.length, icon: <MessageSquare size={20} />, color: "#4F46E5", bg: "#EEF2FF", trend: "All time", trendUp: true },
              { title: "Open", count: openCount, icon: <AlertCircle size={20} />, color: "#DC2626", bg: "#FFF1F2", trend: "Needs attention", trendUp: false },
              { title: "In Progress", count: inProgressCount, icon: <Clock size={20} />, color: "#D97706", bg: "#FFFBEB", trend: "Being handled", trendUp: true },
              { title: "Closed", count: closedCount, icon: <CheckCircle2 size={20} />, color: "#059669", bg: "#ECFDF5", trend: "Resolved", trendUp: true },
            ].map((stat, idx) => (
              <div key={idx} className="stat-card" style={{
                backgroundColor: "#fff", borderRadius: "14px", padding: "20px",
                border: "1px solid #F1F3F9", boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
                animation: `fadeUp 0.4s ease both ${0.1 + idx * 0.07}s`,
              }}>
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "11px", backgroundColor: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color }}>
                    {stat.icon}
                  </div>
                </div>
                <div style={{ marginBottom: "6px" }}>
                  <div style={{ fontSize: "0.78rem", color: "#9CA3AF", fontWeight: "500", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.4px" }}>{stat.title}</div>
                  <div style={{ fontSize: "2rem", fontWeight: "700", color: "#111827", lineHeight: 1, fontFamily: "'Playfair Display', serif" }}>
                    {loading ? <span style={{ display: "inline-block", width: "48px", height: "32px", background: "#F3F4F6", borderRadius: "6px" }} /> : stat.count}
                  </div>
                </div>
                <span style={{ fontSize: "0.75rem", color: stat.trendUp ? "#059669" : "#DC2626", fontWeight: "500" }}>{stat.trend}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "20px", animation: "fadeUp 0.4s ease both 0.35s" }}>
            <div style={{ backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #F1F3F9", boxShadow: "0 2px 8px rgba(15,23,42,0.05)", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F3F9" }}>
                <h2 style={{ fontSize: "0.95rem", fontWeight: "600", color: "#111827", margin: "0 0 2px" }}>All Tickets</h2>
                <p style={{ fontSize: "0.75rem", color: "#9CA3AF", margin: 0 }}>{filteredTickets.length} tickets</p>
              </div>
              <div style={{ maxHeight: "calc(100vh - 380px)", overflowY: "auto" }}>
                {loading && (
                  <div style={{ padding: "40px", textAlign: "center" }}>
                    <Loader2 size={24} style={{ color: "#4F46E5", animation: "spin 1s linear infinite" }} />
                  </div>
                )}
                {!loading && filteredTickets.length === 0 && (
                  <div style={{ padding: "40px", textAlign: "center", color: "#9CA3AF" }}>
                    <MessageSquare size={32} style={{ marginBottom: "8px" }} />
                    <p style={{ fontSize: "0.875rem", margin: 0 }}>No tickets yet</p>
                  </div>
                )}
                {!loading && filteredTickets.map((ticket) => {
                  const isSelected = tid(selectedTicket) === tid(ticket);
                  return (
                    <div
                      key={tid(ticket)}
                      className={`ticket-row${isSelected ? " selected" : ""}`}
                      onClick={() => selectTicket(ticket)}
                      style={{
                        padding: "14px 20px", borderBottom: "1px solid #F9FAFB",
                        borderLeft: isSelected ? "3px solid #4F46E5" : "3px solid transparent",
                        backgroundColor: isSelected ? "#EEF2FF" : "transparent",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                          <div style={{
                            width: "26px", height: "26px", borderRadius: "50%",
                            background: `hsl(${(userName(ticket).charCodeAt(0) || 65) * 5 % 360}, 55%, 55%)`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontSize: "0.65rem", fontWeight: "600", flexShrink: 0,
                          }}>
                            {userName(ticket).slice(0, 2).toUpperCase()}
                          </div>
                          <span style={{ fontSize: "0.83rem", fontWeight: "600", color: "#111827" }}>
                            {userName(ticket)}
                            {ticket.status === "open" && (
                              <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#DC2626", marginLeft: "5px", verticalAlign: "middle" }} />
                            )}
                          </span>
                        </div>
                        <StatusBadge status={ticket.status} />
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "3px" }}>
                        {ticket.subject}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#9CA3AF" }}>
                        {new Date(ticket.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #F1F3F9", boxShadow: "0 2px 8px rgba(15,23,42,0.05)", overflow: "hidden" }}>
              {!selectedTicket ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "500px", flexDirection: "column", gap: "10px", color: "#9CA3AF" }}>
                  <div style={{ fontSize: "3rem" }}>🎫</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: "500", color: "#6B7280" }}>Select a ticket to view and reply</div>
                  <div style={{ fontSize: "0.82rem", color: "#9CA3AF" }}>Employee support requests appear here</div>
                </div>
              ) : (
                <div style={{ padding: "22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid #F1F3F9" }}>
                    <div>
                      <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "#111827", margin: "0 0 4px" }}>{selectedTicket.subject}</h2>
                      <div style={{ fontSize: "0.82rem", color: "#6B7280" }}>
                        From: <strong style={{ color: "#374151" }}>{userName(selectedTicket)}</strong>
                        {userEmail(selectedTicket) && <span> · {userEmail(selectedTicket)}</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ position: "relative" }}>
                        <button
                          style={{
                            display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px",
                            border: "1.5px solid #E5E7EB", borderRadius: "9px", background: "#F9FAFB",
                            cursor: "pointer", fontSize: "0.82rem",
                          }}
                          onClick={(e) => {
  e.stopPropagation();
  setStatusDropdownOpen((prev) => !prev);
}}
                          disabled={statusUpdating}
                        >
                          <StatusBadge status={selectedTicket.status} />
                          <ChevronDown size={12} style={{ color: "#9CA3AF" }} />
                        </button>
                        {statusDropdownOpen && (
                        <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", background: "#fff", border: "1px solid #E5E7EB", borderRadius: "10px", boxShadow: "0 8px 24px rgba(15,23,42,0.10)", zIndex: 50, minWidth: "160px", overflow: "hidden" }}>
                          {["open", "inprogress", "closed"].map((s) => (
<button
  key={s}
  onClick={() => {
    handleStatusChange(s);
    setStatusDropdownOpen(false); 
  }}
  style={{
    width: "100%",
    padding: "9px 14px",
    border: "none",
    background: "transparent",
    textAlign: "left",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    transition: "background 0.1s",
  }}
  onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
>
  <StatusBadge status={s} />
</button>
                          ))}
                        </div>)}
                      </div>
                      <button onClick={handleDeleteTicket} style={{
                        padding: "6px 12px", borderRadius: "9px", border: "1.5px solid #FECDD3",
                        backgroundColor: "#FFF1F2", color: "#DC2626", fontSize: "0.82rem",
                        fontWeight: "500", cursor: "pointer", fontFamily: "inherit",
                      }}>
                        Delete
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: "0.72rem", fontWeight: "600", color: "#9CA3AF", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Conversation · {thread.length} messages
                  </div>

                  <div style={{
                    background: "#F9FAFB", borderRadius: "12px", padding: "14px",
                    maxHeight: "320px", overflowY: "auto",
                    display: "flex", flexDirection: "column", gap: "14px", marginBottom: "16px",
                    border: "1px solid #F1F3F9",
                  }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {thread.length === 0 && (
                      <div style={{ textAlign: "center", color: "#9CA3AF", fontSize: "0.855rem", padding: "28px 0" }}>No messages yet.</div>
                    )}
                    {thread.map((msg, idx) => {
                      const isUser = msg.role === "user";
                      const isAdmin = msg.role === "admin";
                      const msgIdx = msg._index;
                      const reactionKey = rKey(msgIdx);
                      const mr = reactions[reactionKey] || {};

                      const bubbleBg = isUser ? "#4F46E5" : "#fff";
                      const bubbleColor = isUser ? "#fff" : "#374151";
                      const bubbleBorder = isAdmin ? "1px solid #E5E7EB" : "none";
                      const align = isUser ? "flex-end" : "flex-start";

                      return (
                        <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: align }}>
                          <div style={{ fontSize: "0.7rem", color: "#9CA3AF", marginBottom: "3px", paddingLeft: "4px", paddingRight: "4px" }}>
                            {isAdmin ? (msg.sender || "Admin") : userName(selectedTicket)}
                          </div>
                          <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", flexDirection: isUser ? "row-reverse" : "row", position: "relative" }}
                            onMouseEnter={(e) => { const b = e.currentTarget.querySelector(`[data-bar="${idx}"]`); if (b) b.style.opacity = "1"; }}
                            onMouseLeave={(e) => { const b = e.currentTarget.querySelector(`[data-bar="${idx}"]`); if (b && emojiPicker !== idx) b.style.opacity = "0"; }}
                          >
                            <div style={{
                              maxWidth: "75%", padding: "9px 14px",
                              borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                              background: bubbleBg, color: bubbleColor,
                              fontSize: "0.855rem", lineHeight: 1.6,
                              boxShadow: "0 2px 8px rgba(15,23,42,0.06)", border: bubbleBorder,
                            }} dangerouslySetInnerHTML={{ __html: renderC(msg.content) }} />

                            <div data-bar={idx} style={{ display: "flex", gap: "3px", opacity: 0, transition: "opacity 0.15s", flexShrink: 0, position: "relative" }}>
                              <button onClick={(e) => { e.stopPropagation(); setContextMenu(null); setEmojiPicker(emojiPicker === idx ? null : idx); }}
                                style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "2px 6px", cursor: "pointer", fontSize: "14px", lineHeight: 1, boxShadow: "0 1px 4px rgba(15,23,42,0.06)" }}>
                                😊
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setEmojiPicker(null); setContextMenu(contextMenu?.idx === idx ? null : { idx, msgIdx }); }}
                                style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "3px 6px", cursor: "pointer", display: "flex", alignItems: "center", boxShadow: "0 1px 4px rgba(15,23,42,0.06)" }}>
                                <Trash2 size={11} color="#9CA3AF" />
                              </button>
                              {emojiPicker === idx && (
                                <div style={{ position: "absolute", [isUser ? "right" : "left"]: 0, bottom: "calc(100% + 6px)", zIndex: 9999 }} onClick={(e) => e.stopPropagation()}>
                                  <EmojiPicker onSelect={(em) => handleReact(msgIdx, em)} onClose={() => setEmojiPicker(null)} />
                                </div>
                              )}
                              {contextMenu?.idx === idx && (
                                <div style={{ position: "absolute", [isUser ? "right" : "left"]: 0, bottom: "calc(100% + 4px)", background: "#fff", border: "1px solid #E5E7EB", borderRadius: "10px", boxShadow: "0 8px 24px rgba(15,23,42,0.12)", zIndex: 9999, minWidth: "190px", overflow: "hidden" }}
                                  onClick={(e) => e.stopPropagation()}>
                                  <button onClick={() => handleDeleteMsg(contextMenu.msgIdx, "self")} style={{ width: "100%", padding: "10px 14px", border: "none", background: "transparent", textAlign: "left", fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", color: "#374151" }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = "#F9FAFB"}
                                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                                    🙈 Delete for Me
                                  </button>
                                  <div style={{ height: "1px", background: "#F1F3F9" }} />
                                  <button onClick={() => handleDeleteMsg(contextMenu.msgIdx, "everyone")} style={{ width: "100%", padding: "10px 14px", border: "none", background: "transparent", textAlign: "left", fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", color: "#DC2626" }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = "#FFF1F2"}
                                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                                    🗑️ Delete for Everyone
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {Object.keys(mr).length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "5px" }}>
                              {Object.entries(mr).map(([em, uids]) => {
                                if (!Array.isArray(uids) || !uids.length) return null;
                                const mine = uids.includes(userId);
                                return (
                                  <button key={em} onClick={() => handleReact(msgIdx, em)} style={{
                                    background: mine ? "#EEF2FF" : "#F9FAFB", border: mine ? "1px solid #C7D2FE" : "1px solid #E5E7EB",
                                    borderRadius: "20px", padding: "2px 8px", cursor: "pointer", fontSize: "12px",
                                    display: "flex", alignItems: "center", gap: "4px", color: "#374151",
                                  }}>
                                    <span style={{ fontSize: "14px" }}>{em}</span>
                                    <span style={{ color: mine ? "#4F46E5" : "#9CA3AF", fontWeight: mine ? "700" : "400" }}>{uids.length}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                          <div style={{ fontSize: "0.7rem", color: "#9CA3AF", marginTop: "3px" }}>{fmtT(msg.timestamp)}</div>
                        </div>
                      );
                    })}
                    <div ref={convEndRef} />
                  </div>
                  <div style={{ marginBottom: "16px", padding: "14px", background: "#F9FAFB", borderRadius: "10px", border: "1px solid #F1F3F9" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <div style={{ fontSize: "0.78rem", fontWeight: "600", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                        Attachments {attachments.length > 0 && <span style={{ color: "#4F46E5" }}>({attachments.length})</span>}
                      </div>
                      <div>
                        <input ref={fileRef} type="file" style={{ display: "none" }} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" onChange={handleFileSelect} />
                        <button onClick={() => fileRef.current?.click()} style={{
                          display: "flex", alignItems: "center", gap: "5px", padding: "5px 12px",
                          background: "#EEF2FF", color: "#4F46E5", border: "1.5px solid #C7D2FE",
                          borderRadius: "8px", fontSize: "0.78rem", fontWeight: "500", cursor: "pointer",
                        }}>
                          <Paperclip size={13} /> Attach
                        </button>
                      </div>
                    </div>

                    {selectedFile && (
                      <div style={{ background: "#EEF2FF", borderRadius: "8px", padding: "8px 12px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px", border: "1px solid #C7D2FE" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "0.82rem", fontWeight: "500", color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedFile.name}</div>
                          <div style={{ fontSize: "0.7rem", color: "#9CA3AF" }}>{fmtSz(selectedFile.size)}</div>
                        </div>
                        <button onClick={uploadFile} disabled={uploading} style={{ padding: "4px 12px", background: "#4F46E5", color: "#fff", border: "none", fontSize: "0.78rem", borderRadius: "7px", cursor: "pointer" }}>
                          {uploading ? "Uploading…" : "Upload"}
                        </button>
                        <button onClick={() => { setSelectedFile(null); if (fileRef.current) fileRef.current.value = ""; }} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#DC2626", padding: "2px" }}>
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    {attachments.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {attachments.map((att) => (
                          <div key={att._id} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fff", borderRadius: "8px", padding: "8px 12px", border: "1px solid #F1F3F9" }}>
                            {isImg(att.file_type) ? <Image size={16} color="#4F46E5" /> : <FileText size={16} color="#9CA3AF" />}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: "0.82rem", fontWeight: "500", color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.file_name}</div>
                              <div style={{ fontSize: "0.7rem", color: "#9CA3AF" }}>By {att.uploader_name} · {fmtSz(att.file_size)}</div>
                            </div>
                            {isImg(att.file_type) && (
                              <a href={`${API}${att.file_url}`} target="_blank" rel="noreferrer" style={{ padding: "3px 10px", background: "#F9FAFB", color: "#6B7280", border: "1px solid #E5E7EB", fontSize: "0.72rem", borderRadius: "6px", textDecoration: "none" }}>View</a>
                            )}
                            <a href={`${API}${att.file_url}`} target="_blank" rel="noreferrer" download={att.file_name} style={{ display: "flex", alignItems: "center", gap: "3px", padding: "3px 10px", background: "#EEF2FF", color: "#4F46E5", border: "1px solid #C7D2FE", fontSize: "0.72rem", borderRadius: "6px", textDecoration: "none" }}>
                              <Download size={12} /> Download
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: "0.82rem", color: "#9CA3AF" }}>No attachments yet.</div>
                    )}
                  </div>
                  <div style={{ borderTop: "1px solid #F1F3F9", paddingTop: "14px" }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: "600", color: "#9CA3AF", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Send Reply</div>
                    <form onSubmit={handleReply}>
                      <textarea
                        className="reply-input"
                        rows={3}
                        placeholder="Type your reply to the employee…"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        style={{
                          width: "100%", padding: "10px 13px", border: "1.5px solid #E5E7EB",
                          borderRadius: "10px", fontSize: "0.875rem", color: "#374151",
                          backgroundColor: "#F9FAFB", fontFamily: "inherit", resize: "none",
                          marginBottom: "12px", transition: "border-color 0.18s, box-shadow 0.18s",
                        }}
                      />
                      <button type="submit" disabled={submitting || !replyText.trim()} style={{
                        padding: "9px 20px", background: "#4F46E5", color: "#fff",
                        border: "none", borderRadius: "10px", fontSize: "0.875rem", fontWeight: "500",
                        cursor: (submitting || !replyText.trim()) ? "not-allowed" : "pointer",
                        fontFamily: "inherit", opacity: (submitting || !replyText.trim()) ? 0.55 : 1,
                        boxShadow: "0 2px 8px rgba(79,70,229,0.25)",
                      }}>
                        {submitting ? "Sending…" : "Send Reply"}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}