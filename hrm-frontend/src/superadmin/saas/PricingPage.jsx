import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../layouts/sidebar";
import { Tag, Plus, Trash2, X, CheckCircle2 } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

function PricingPage() {
  const [plans, setPlans]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast]           = useState(null);
  const [formError, setFormError]   = useState("");
  const [isOpen, setIsOpen]         = useState(true);
  const [form, setForm]             = useState({
    plan_name: "", price: "", billing_cycle: "monthly", max_employees: "", features: "",
  });

  const token   = localStorage.getItem("token");
  const headers = { "x-auth-token": token };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/plans`);
      setPlans(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch {
      showToast("Failed to load plans", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const resetForm = () => setForm({ plan_name: "", price: "", billing_cycle: "monthly", max_employees: "", features: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.plan_name.trim())         { setFormError("Plan name is required"); return; }
    if (!form.price || isNaN(form.price)) { setFormError("Enter a valid price"); return; }
    setSubmitting(true);
    setFormError("");
    try {
      await axios.post(`${API}/api/plans`, {
        plan_name:     form.plan_name,
        price:         Number(form.price),
        billing_cycle: form.billing_cycle,
        max_employees: form.max_employees ? Number(form.max_employees) : null,
        features:      form.features,
      }, { headers });
      showToast("Plan created successfully");
      setShowModal(false);
      resetForm();
      fetchPlans();
    } catch (err) {
      setFormError(err.response?.data?.error || err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (plan) => {
    try {
      const id = plan._id || plan.plan_id;
      await axios.delete(`${API}/api/plans/${id}`, { headers });
      showToast("Plan deleted");
      setDeleteConfirm(null);
      fetchPlans();
    } catch {
      showToast("Delete failed", "error");
      setDeleteConfirm(null);
    }
  };

  const sidebarWidth = isOpen ? 255 : 68;

  const CYCLE_COLORS = {
    monthly: { bg: "#EEF2FF", text: "#4F46E5" },
    yearly:  { bg: "#ECFDF5", text: "#059669" },
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .plan-row { transition: background 0.12s; }
        .plan-row:hover { background: #F5F7FF !important; }
        .plan-card { transition: transform 0.18s, box-shadow 0.18s; }
        .plan-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(15,23,42,0.10) !important; }
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
            {toast.type === "error" ? <X size={16}/> : <CheckCircle2 size={16}/>}
            {toast.message}
          </div>
        )}
        <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, animation: "fadeUp 0.4s ease both 0.05s" }}>
          <div>
            <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 4px" }}>Super Admin</p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.85rem", fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1.2 }}>
              Pricing Plans
            </h1>
            <p style={{ color: "#9CA3AF", fontSize: "0.85rem", margin: "5px 0 0" }}>
              Manage subscription tiers for companies
            </p>
          </div>
          <button
            onClick={() => { setShowModal(true); setFormError(""); resetForm(); }}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#4F46E5", color: "#fff", border: "none",
              padding: "10px 20px", borderRadius: 10, fontSize: "0.875rem",
              fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 2px 8px rgba(79,70,229,0.25)", alignSelf: "center",
            }}
          >
            <Plus size={15}/> Add Plan
          </button>
        </div>
        {!loading && plans.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 16, marginBottom: 28 }}>
            {plans.slice(0, 4).map((plan, idx) => {
              const cc = CYCLE_COLORS[plan.billing_cycle] || CYCLE_COLORS.monthly;
              return (
                <div key={plan._id || plan.plan_id} className="plan-card" style={{
                  backgroundColor: "#fff", borderRadius: 14, padding: 20,
                  border: "1px solid #F1F3F9", boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
                  animation: `fadeUp 0.4s ease both ${0.1 + idx * 0.07}s`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#4F46E5" }}>
                      <Tag size={17}/>
                    </div>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827" }}>{plan.plan_name}</span>
                  </div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#111827", fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>
                    ₹{Number(plan.price).toLocaleString()}
                  </div>
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ background: cc.bg, color: cc.text, padding: "2px 10px", borderRadius: 20, fontSize: "0.7rem", fontWeight: 600 }}>
                      {plan.billing_cycle}
                    </span>
                    {plan.max_employees && (
                      <span style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>up to {plan.max_employees} users</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div style={{
          backgroundColor: "#fff", borderRadius: 14,
          border: "1px solid #F1F3F9", boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
          overflow: "hidden", animation: "fadeUp 0.4s ease both 0.38s",
        }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid #F1F3F9" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#111827", margin: "0 0 2px" }}>All Plans</h2>
            <p style={{ fontSize: "0.78rem", color: "#9CA3AF", margin: 0 }}>{plans.length} plan{plans.length !== 1 ? "s" : ""} available</p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#FAFBFF" }}>
                  {["#", "Plan Name", "Price", "Billing", "Max Users", "Features", "Actions"].map((h, i) => (
                    <th key={i} style={{
                      padding: "11px 20px", textAlign: i === 6 ? "right" : "left",
                      fontSize: "0.72rem", fontWeight: 600, color: "#9CA3AF",
                      textTransform: "uppercase", letterSpacing: "0.5px",
                      borderBottom: "1px solid #F1F3F9",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      {[30, 120, 80, 80, 70, 150, 60].map((w, j) => (
                        <td key={j} style={{ padding: "14px 20px" }}>
                          <div style={{ height: 14, width: w, background: "#F3F4F6", borderRadius: 4 }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : plans.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: 48, textAlign: "center", color: "#9CA3AF", fontSize: "0.875rem" }}>
                      No plans available. Add your first plan!
                    </td>
                  </tr>
                ) : (
                  plans.map((plan, i) => {
                    const cc = CYCLE_COLORS[plan.billing_cycle] || CYCLE_COLORS.monthly;
                    return (
                      <tr key={plan._id || plan.plan_id} className="plan-row" style={{ borderBottom: "1px solid #F9FAFB" }}>
                        <td style={{ padding: "13px 20px", fontSize: "0.82rem", color: "#9CA3AF", fontWeight: 500 }}>
                          {String(i + 1).padStart(2, "0")}
                        </td>
                        <td style={{ padding: "13px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 8, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#4F46E5", flexShrink: 0 }}>
                              <Tag size={13}/>
                            </div>
                            <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827" }}>{plan.plan_name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "13px 20px", fontWeight: 700, fontSize: "0.95rem", color: "#111827" }}>
                          ₹{Number(plan.price).toLocaleString()}
                        </td>
                        <td style={{ padding: "13px 20px" }}>
                          <span style={{ background: cc.bg, color: cc.text, padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600 }}>
                            {plan.billing_cycle}
                          </span>
                        </td>
                        <td style={{ padding: "13px 20px", fontSize: "0.855rem", color: "#6B7280" }}>
                          {plan.max_employees ? plan.max_employees.toLocaleString() : "Unlimited"}
                        </td>
                        <td style={{ padding: "13px 20px", fontSize: "0.82rem", color: "#6B7280", maxWidth: 200 }}>
                          <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {plan.features || "—"}
                          </span>
                        </td>
                        <td style={{ padding: "13px 20px", textAlign: "right" }}>
                          <button
                            onClick={() => setDeleteConfirm(plan)}
                            style={{
                              background: "#FEF2F2", color: "#EF4444", border: "none",
                              padding: "6px 12px", borderRadius: 8, fontSize: "0.78rem",
                              fontWeight: 600, cursor: "pointer",
                              display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "inherit",
                            }}
                          >
                            <Trash2 size={12}/> Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        {showModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 480, boxShadow: "0 24px 64px rgba(15,23,42,0.20)", animation: "fadeUp 0.25s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 700, color: "#111827", margin: 0 }}>
                  New Pricing Plan
                </h2>
                <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 4 }}>
                  <X size={20}/>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>Plan Name *</label>
                    <input className="form-inp" placeholder="e.g. Enterprise" value={form.plan_name} onChange={(e) => setForm({ ...form, plan_name: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>Price (₹) *</label>
                    <input className="form-inp" type="number" min="0" step="0.01" placeholder="e.g. 4999" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>Billing Cycle</label>
                    <select className="form-inp" value={form.billing_cycle} onChange={(e) => setForm({ ...form, billing_cycle: e.target.value })}>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>Max Employees</label>
                    <input className="form-inp" type="number" min="1" placeholder="e.g. 100" value={form.max_employees} onChange={(e) => setForm({ ...form, max_employees: e.target.value })} />
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>Features</label>
                    <input className="form-inp" placeholder="e.g. Payroll, Attendance, Leave Management" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
                  </div>
                </div>
                {formError && <p style={{ color: "#EF4444", fontSize: "0.82rem", marginBottom: 14 }}>{formError}</p>}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ padding: "9px 20px", border: "1.5px solid #E5E7EB", background: "#fff", borderRadius: 10, fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", color: "#6B7280", fontFamily: "inherit" }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} style={{ padding: "9px 24px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 10, fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? "Saving…" : "Create Plan"}
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
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>Delete Plan</h2>
              <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 24px", lineHeight: 1.6 }}>
                Are you sure you want to delete the <strong>{deleteConfirm.plan_name}</strong> plan? Companies using this plan may be affected.
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

export default PricingPage;