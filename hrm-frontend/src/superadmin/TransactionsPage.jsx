import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../layouts/sidebar";
import { CreditCard, CheckCircle2, Clock, XCircle, Plus, Search, Edit2, Trash2, X } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

const STATUS_COLORS = {
  paid:    { bg: "#ECFDF5", text: "#059669", dot: "#059669" },
  pending: { bg: "#FFFBEB", text: "#D97706", dot: "#D97706" },
  failed:  { bg: "#FEF2F2", text: "#DC2626", dot: "#DC2626" },
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [companies, setCompanies]       = useState([]);
  const [stats, setStats]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [toast, setToast]               = useState(null);

  const [modalOpen, setModalOpen]       = useState(false);
  const [editItem, setEditItem]         = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm]                 = useState({ company_id: "", amount: "", payment_date: "", status: "pending" });
  const [formError, setFormError]       = useState("");
  const [submitting, setSubmitting]     = useState(false);

  const [isOpen, setIsOpen]             = useState(true);

  const token   = localStorage.getItem("token");
  const headers = { "x-auth-token": token };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [txRes, statsRes, compRes] = await Promise.all([
        axios.get(`${API}/api/transactions`, { headers }),
        axios.get(`${API}/api/transactions/stats`, { headers }),
        axios.get(`${API}/api/saas/companies`, { headers }),
      ]);
      setTransactions(txRes.data.data || []);
      setStats(statsRes.data.data || null);
      setCompanies(compRes.data.data || []);
    } catch {
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => {
    setEditItem(null);
    setForm({ company_id: "", amount: "", payment_date: "", status: "pending" });
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (tx) => {
    setEditItem(tx);
    setForm({
      company_id:   tx.company_id,
      amount:       tx.amount,
      payment_date: tx.payment_date ? tx.payment_date.split("T")[0] : "",
      status:       tx.status || "pending",
    });
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditItem(null); setFormError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company_id || String(form.company_id).trim() === "") {
      setFormError("Please select a company"); return;
    }
    if (!form.amount || isNaN(form.amount)) {
      setFormError("Enter a valid amount"); return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const payload = {
        company_id:   form.company_id,
        amount:       Number(form.amount),
        payment_date: form.payment_date || null,
        status:       form.status,
      };
      console.log(payload)
      if (editItem) {
        const id = editItem._id || editItem.transaction_id;
        await axios.put(`${API}/api/transactions/${id}`, payload, { headers });
        showToast("Transaction updated");
      } else {
        await axios.post(`${API}/api/transactions`, payload, { headers });
        showToast("Transaction created");
      }
      closeModal();
      fetchAll();
    } catch (err) {
      setFormError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (tx) => {
    try {
      const id = tx._id || tx.transaction_id;
      await axios.delete(`${API}/api/transactions/${id}`, { headers });
      showToast("Transaction deleted");
      setDeleteConfirm(null);
      fetchAll();
    } catch {
      showToast("Delete failed", "error");
      setDeleteConfirm(null);
    }
  };

  const filtered = transactions.filter((tx) => {
    const name   = tx.company_name || tx.company_id?.company_name || "";
    const idStr  = String(tx._id || tx.transaction_id || "");
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) || idStr.includes(search);
    const matchStatus = filterStatus === "all" || (tx.status || "").toLowerCase() === filterStatus;
    return matchSearch && matchStatus;
  });

  const sidebarWidth = isOpen ? 255 : 68;

  const statCards = stats ? [
    { label: "Total",   value: stats.total,   sub: `₹${(stats.totalAmount || 0).toLocaleString()}`,   color: "#4F46E5", bg: "#EEF2FF", icon: <CreditCard size={20} /> },
    { label: "Paid",    value: stats.paid || stats.approved,    sub: `₹${(stats.paidAmount || stats.approvedAmount || 0).toLocaleString()}`,    color: "#059669", bg: "#ECFDF5", icon: <CheckCircle2 size={20} /> },
    { label: "Pending", value: stats.pending, sub: `₹${(stats.pendingAmount || 0).toLocaleString()}`, color: "#D97706", bg: "#FFFBEB", icon: <Clock size={20} /> },
    { label: "Failed / Rejected", value: stats.failed || stats.rejected || 0, sub: "Requires attention", color: "#DC2626", bg: "#FEF2F2", icon: <XCircle size={20} /> },
  ] : [];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .stat-card { transition: transform 0.18s, box-shadow 0.18s; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(15,23,42,0.10) !important; }
        .tx-row { transition: background 0.12s; }
        .tx-row:hover { background: #F5F7FF !important; }
        .filter-btn { border: 1.5px solid #E5E7EB; background: #fff; padding: 6px 14px; border-radius: 8px; font-size: 0.82rem; font-weight: 500; cursor: pointer; color: #6B7280; transition: all 0.15s; }
        .filter-btn.active { background: #4F46E5; color: #fff; border-color: #4F46E5; }
        .filter-btn:hover:not(.active) { border-color: #4F46E5; color: #4F46E5; }
        .form-inp { width:100%; padding:9px 12px; border:1.5px solid #E5E7EB; border-radius:9px; font-size:0.875rem; color:#374151; background:#F9FAFB; outline:none; transition:border-color 0.18s, box-shadow 0.18s; font-family:inherit; }
        .form-inp:focus { border-color:#4F46E5; box-shadow:0 0 0 3px rgba(79,70,229,0.10); }
        * { box-sizing:border-box; }
      `}</style>

      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div style={{ marginLeft: `${sidebarWidth}px`, flex: 1, transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)", padding: "28px 28px 40px" }}>
        {toast && (
          <div style={{
            position: "fixed", top: 20, right: 20, zIndex: 9999,
            background: toast.type === "error" ? "#EF4444" : "#10B981",
            color: "#fff", padding: "12px 20px", borderRadius: 10,
            fontWeight: 500, boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem",
            animation: "fadeUp 0.3s ease",
          }}>
            {toast.type === "error" ? <XCircle size={16}/> : <CheckCircle2 size={16}/>}
            {toast.message}
          </div>
        )}
        <div style={{ marginBottom: 28, animation: "fadeUp 0.4s ease both 0.05s" }}>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 4px" }}>Super Admin</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.85rem", fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1.2 }}>
            Transactions
          </h1>
          <p style={{ color: "#9CA3AF", fontSize: "0.85rem", margin: "5px 0 0" }}>
            Monitor all company subscription payments
          </p>
        </div>
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16, marginBottom: 28 }}>
            {statCards.map((card, idx) => (
              <div key={card.label} className="stat-card" style={{
                backgroundColor: "#fff", borderRadius: 14, padding: 20,
                border: "1px solid #F1F3F9", boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
                animation: `fadeUp 0.4s ease both ${0.1 + idx * 0.07}s`,
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, background: card.bg,
                    display: "flex", alignItems: "center", justifyContent: "center", color: card.color, flexShrink: 0,
                  }}>
                    {card.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: "1.9rem", fontWeight: 700, color: "#111827", lineHeight: 1, fontFamily: "'Playfair Display', serif" }}>
                      {card.value ?? 0}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#9CA3AF", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.4px", margin: "3px 0 2px" }}>
                      {card.label}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: card.color, fontWeight: 600 }}>{card.sub}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center", animation: "fadeUp 0.4s ease both 0.32s" }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input
              className="form-inp"
              style={{ paddingLeft: 32, maxWidth: 260 }}
              placeholder="Search company or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {["all", "paid", "pending", "failed"].map((s) => (
            <button key={s} className={`filter-btn ${filterStatus === s ? "active" : ""}`} onClick={() => setFilterStatus(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <span style={{ marginLeft: "auto", fontSize: "0.78rem", color: "#9CA3AF", background: "#F3F4F6", padding: "5px 12px", borderRadius: 20 }}>
            {filtered.length} results
          </span>
          <button
            onClick={openAdd}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#4F46E5", color: "#fff", border: "none",
              padding: "9px 18px", borderRadius: 10, fontSize: "0.875rem",
              fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 2px 8px rgba(79,70,229,0.25)",
            }}
          >
            <Plus size={15}/> Add Transaction
          </button>
        </div>
        <div style={{
          backgroundColor: "#fff", borderRadius: 14,
          border: "1px solid #F1F3F9", boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
          overflow: "hidden", animation: "fadeUp 0.4s ease both 0.38s",
        }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: "center", color: "#9CA3AF" }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center", color: "#9CA3AF", fontSize: "0.875rem" }}>No transactions found.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#FAFBFF" }}>
                    {["#ID", "Company", "Amount", "Payment Date", "Status", "Actions"].map((h, i) => (
                      <th key={i} style={{
                        padding: "11px 20px", textAlign: i === 5 ? "right" : "left",
                        fontSize: "0.72rem", fontWeight: 600, color: "#9CA3AF",
                        textTransform: "uppercase", letterSpacing: "0.5px",
                        borderBottom: "1px solid #F1F3F9",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tx) => {
                    const statusKey = (tx.status || "pending").toLowerCase();
                    const sc = STATUS_COLORS[statusKey] || STATUS_COLORS.pending;
                    const compName = tx.company_name || tx.company_id?.company_name || "—";
                    const txId = tx._id || tx.transaction_id;
                    return (
                      <tr key={txId} className="tx-row" style={{ borderBottom: "1px solid #F9FAFB" }}>
                        <td style={{ padding: "13px 20px", fontSize: "0.78rem", color: "#9CA3AF", fontWeight: 500 }}>
                          #{String(txId).slice(-6)}
                        </td>
                        <td style={{ padding: "13px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: "50%",
                              background: "#EEF2FF", color: "#4F46E5",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontWeight: 700, fontSize: "0.75rem", flexShrink: 0,
                            }}>
                              {compName.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#111827" }}>{compName}</span>
                          </div>
                        </td>
                        <td style={{ padding: "13px 20px", fontWeight: 700, fontSize: "0.95rem", color: "#111827" }}>
                          ₹{parseFloat(tx.amount || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: "13px 20px", fontSize: "0.855rem", color: "#6B7280" }}>
                          {tx.payment_date
                            ? new Date(tx.payment_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                            : "—"}
                        </td>
                        <td style={{ padding: "13px 20px" }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            background: sc.bg, color: sc.text,
                            padding: "4px 12px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600,
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot }} />
                            {tx.status || "pending"}
                          </span>
                        </td>
                        <td style={{ padding: "13px 20px", textAlign: "right" }}>
                          <button
                            onClick={() => openEdit(tx)}
                            style={{
                              background: "#EEF2FF", color: "#4F46E5", border: "none",
                              padding: "6px 12px", borderRadius: 8, fontSize: "0.78rem",
                              fontWeight: 600, cursor: "pointer", marginRight: 6,
                              display: "inline-flex", alignItems: "center", gap: 4,
                            }}
                          >
                            <Edit2 size={12}/> Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(tx)}
                            style={{
                              background: "#FEF2F2", color: "#EF4444", border: "none",
                              padding: "6px 12px", borderRadius: 8, fontSize: "0.78rem",
                              fontWeight: 600, cursor: "pointer",
                              display: "inline-flex", alignItems: "center", gap: 4,
                            }}
                          >
                            <Trash2 size={12}/> Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {modalOpen && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 460, boxShadow: "0 24px 64px rgba(15,23,42,0.20)", animation: "fadeUp 0.25s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 700, color: "#111827", margin: 0 }}>
                  {editItem ? "Edit Transaction" : "New Transaction"}
                </h2>
                <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 4 }}>
                  <X size={20}/>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>Company *</label>
                  <select className="form-inp" value={form.company_id} onChange={(e) => setForm({ ...form, company_id: e.target.value })}>
                    <option value="">Select company…</option>
                    {companies.map((c) => (
                      <option key={c._id || c.company_id} value={c._id || c.company_id}>{c.company_name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>Amount (₹) *</label>
                  <input className="form-inp" type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="e.g. 4999" />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>Payment Date</label>
                  <input className="form-inp" type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>Status *</label>
                  <select className="form-inp" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="approved">Approved</option>
                    <option value="failed">Failed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                {formError && <p style={{ color: "#EF4444", fontSize: "0.82rem", marginBottom: 14 }}>{formError}</p>}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <button type="button" onClick={closeModal} style={{ padding: "9px 20px", border: "1.5px solid #E5E7EB", background: "#fff", borderRadius: 10, fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", color: "#6B7280", fontFamily: "inherit" }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} style={{ padding: "9px 24px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 10, fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? "Saving…" : editItem ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {deleteConfirm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 420, boxShadow: "0 24px 64px rgba(15,23,42,0.20)", animation: "fadeUp 0.25s ease" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Trash2 size={22} color="#EF4444"/>
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>Delete Transaction</h2>
              <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 24px", lineHeight: 1.6 }}>
                Are you sure you want to delete transaction for <strong>{deleteConfirm.company_name || deleteConfirm.company_id?.company_name}</strong>? This action cannot be undone.
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button onClick={() => setDeleteConfirm(null)} style={{ padding: "9px 20px", border: "1.5px solid #E5E7EB", background: "#fff", borderRadius: 10, fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", color: "#6B7280", fontFamily: "inherit" }}>
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteConfirm)} style={{ padding: "9px 20px", background: "#EF4444", color: "#fff", border: "none", borderRadius: 10, fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}