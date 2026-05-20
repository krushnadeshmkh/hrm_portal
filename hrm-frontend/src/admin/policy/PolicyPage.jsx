import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  ShieldCheck, Upload, Trash2, Eye, Search, Bell,
  Clock, FileText, X, CheckCircle2, Inbox,
  AlertTriangle, Download, RefreshCw, FileWarning,
  FolderOpen, Filter,
} from "lucide-react";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const API = `${BASE_URL}/api/policies`;
import Sidebar from "../../layouts/sidebar";

const token = localStorage.getItem("token");

const cfg = {
  headers: {
    "x-auth-token": token, 
  },
};

const SHARED = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
  @keyframes fadeUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
  @keyframes slideIn { from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)} }
  @keyframes toastIn { from{opacity:0;transform:translateY(-10px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  .form-input{width:100%;padding:10px 14px;border:1.5px solid #E5E7EB;border-radius:10px;font-size:0.875rem;color:#374151;background:#F9FAFB;font-family:'DM Sans',sans-serif;transition:border-color .18s,box-shadow .18s,background .18s;outline:none}
  .form-input:focus{border-color:#4F46E5;box-shadow:0 0 0 3px rgba(79,70,229,.10);background:#fff}
  .form-input.err{border-color:#EF4444;box-shadow:0 0 0 3px rgba(239,68,68,.08)}
  .btn-blue{display:flex;align-items:center;justify-content:center;gap:7px;padding:11px 18px;border-radius:10px;font-size:0.875rem;font-weight:600;cursor:pointer;border:none;background:linear-gradient(135deg,#4F46E5,#6366F1);color:#fff;font-family:'DM Sans',sans-serif;transition:all .18s;width:100%}
  .btn-blue:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 6px 16px rgba(79,70,229,.28)}
  .btn-blue:disabled{opacity:.55;cursor:not-allowed}
  .pol-row{transition:background .12s;border-bottom:1px solid #F9FAFB}
  .pol-row:hover{background:#F5F7FF!important}
  .drop-zone{border:2px dashed #E5E7EB;border-radius:12px;padding:28px 20px;text-align:center;transition:all .2s;cursor:pointer;background:#FAFBFF}
  .drop-zone.active{border-color:#4F46E5;background:#EEF2FF}
  .drop-zone:hover{border-color:#C7D2FE;background:#F5F7FF}
  .topbar-btn:hover{background:#F3F4F6!important}
  .search-inp:focus{outline:none;border-color:#4F46E5!important;box-shadow:0 0 0 3px rgba(79,70,229,.10)}
  .del-btn:hover{background:#FEF2F2!important;color:#EF4444!important;border-color:#FECACA!important}
  *{box-sizing:border-box}
`;

export default function PolicyPage() {
  const name = localStorage.getItem("name") || "Admin";
  const token = localStorage.getItem("token");
  console.log(token)
  const cfg = { headers: { "x-auth-token": token } };
  const [isOpen, setIsOpen] = useState(true);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");
  const [filterExt, setFilterExt] = useState("all");
  const [deleteModal, setDeleteModal] = useState(null);
  const [toast, setToast] = useState(null);
  const fileRef = useRef();

    const sidebarWidth = isOpen ? 255 : 68;

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const r = await axios.get(API, cfg);
      setPolicies(r.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPolicies(); }, []);

  const getExt = (filename="") => filename.split(".").pop().toLowerCase();
  const extIcon = (ext) => {
    if (ext === "pdf") return { color:"#EF4444", bg:"#FEF2F2", label:"PDF" };
    if (["doc","docx"].includes(ext)) return { color:"#4F46E5", bg:"#EEF2FF", label:"DOC" };
    return { color:"#6B7280", bg:"#F3F4F6", label:ext.toUpperCase() };
  };

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = "Title is required";
    if (!file) e.file = "Please select a file";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleUpload = async () => {
  if (!validate()) return;
  try {
    setUploading(true);
    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("file", file);

await axios.post(`${API}/upload`, fd, {
  headers: {
    "x-auth-token": token,
    "Content-Type": "multipart/form-data",
  },
});

    showToast("Policy uploaded successfully!");
    setTitle("");
    setFile(null);
    setErrors({});
    if (fileRef.current) fileRef.current.value = "";
    fetchPolicies();
  } catch (err) {
    showToast(err?.response?.data?.message || "Upload failed", false);
  } finally {
    setUploading(false);
  }
};
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/${id}`, cfg);
      showToast("Policy deleted");
      setDeleteModal(null);
      fetchPolicies();
    } catch (err) {
      showToast(err?.response?.data?.message || "Delete failed", false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) { setFile(dropped); setErrors(er => ({ ...er, file:"" })); }
  };

  const filtered = policies.filter(p => {
    const q = search.toLowerCase();
    const matchQ = !q || p.title?.toLowerCase().includes(q) || p.file?.toLowerCase().includes(q);
    const ext = getExt(p.file);
    const matchE = filterExt === "all" || (filterExt === "pdf" ? ext==="pdf" : ["doc","docx"].includes(ext));
    return matchQ && matchE;
  });

  return (
    <div style={{ minHeight:"100vh", background:"#F9FAFB", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{SHARED}</style>
      {toast && (
        <div style={{
          position:"fixed", top:"20px", right:"24px", zIndex:9999,
          background: toast.ok ? "#059669" : "#EF4444",
          color:"#fff", borderRadius:"12px", padding:"12px 18px",
          fontSize:"0.875rem", fontWeight:"500",
          boxShadow:"0 8px 24px rgba(0,0,0,.15)",
          display:"flex", alignItems:"center", gap:"8px",
          animation:"toastIn .25s ease",
        }}>
          {toast.ok ? <CheckCircle2 size={16}/> : <AlertTriangle size={16}/>}
          {toast.msg}
        </div>
      )}
      {deleteModal && (
        <div onClick={() => setDeleteModal(null)} style={{
          position:"fixed", inset:0, background:"rgba(15,23,42,.5)",
          zIndex:8000, display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background:"#fff", borderRadius:"16px", padding:"28px 32px", maxWidth:"380px", width:"90%",
            boxShadow:"0 24px 64px rgba(15,23,42,.25)", textAlign:"center",
          }}>
            <div style={{ width:"52px", height:"52px", borderRadius:"14px", background:"#FEF2F2", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", color:"#EF4444" }}>
              <Trash2 size={24}/>
            </div>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", fontWeight:"700", color:"#111827", margin:"0 0 8px" }}>Delete Policy?</h3>
            <p style={{ fontSize:"0.855rem", color:"#6B7280", margin:"0 0 24px", lineHeight:1.6 }}>
              "<strong>{deleteModal.title}</strong>" will be permanently deleted along with its file.
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
              <button onClick={() => setDeleteModal(null)} style={{
                padding:"10px", borderRadius:"10px", border:"1.5px solid #E5E7EB",
                background:"#fff", color:"#374151", fontFamily:"'DM Sans',sans-serif",
                fontSize:"0.875rem", fontWeight:"600", cursor:"pointer",
              }}>Cancel</button>
              <button onClick={() => handleDelete(deleteModal._id)} style={{
                padding:"10px", borderRadius:"10px", border:"none",
                background:"#EF4444", color:"#fff", fontFamily:"'DM Sans',sans-serif",
                fontSize:"0.875rem", fontWeight:"600", cursor:"pointer",
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}

  <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        <div style={{
        marginLeft: `${sidebarWidth}px`, flex: 1,
        transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column", minHeight: "100vh",
      }}>
      <div style={{
        height:"64px", background:"#fff", borderBottom:"1px solid #F1F3F9",
        display:"flex", alignItems:"center", padding:"0 28px", gap:"16px",
        position:"sticky", top:0, zIndex:100,
        boxShadow:"0 1px 4px rgba(15,23,42,.04)",
      }}>
        <div style={{ position:"relative", flex:1, maxWidth:"380px" }}>
          <Search size={15} style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", color:"#9CA3AF" }}/>
          <input className="search-inp" placeholder="Search anything…" style={{
            width:"100%", padding:"8px 12px 8px 36px", border:"1.5px solid #E5E7EB",
            borderRadius:"10px", fontSize:"0.875rem", color:"#374151", background:"#F9FAFB",
            fontFamily:"'DM Sans',sans-serif", outline:"none",
          }}/>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:"8px" }}>
          <button className="topbar-btn" style={{
            width:"38px", height:"38px", borderRadius:"10px", border:"1.5px solid #E5E7EB",
            background:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"pointer", color:"#6B7280", position:"relative",
          }}>
            <Bell size={17}/>
            <span style={{ position:"absolute", top:"8px", right:"8px", width:"7px", height:"7px", borderRadius:"50%", background:"#EF4444", border:"1.5px solid #fff" }}/>
          </button>
          <div style={{
            display:"flex", alignItems:"center", gap:"9px", padding:"5px 12px 5px 6px",
            border:"1.5px solid #E5E7EB", borderRadius:"10px", background:"#fff", cursor:"pointer",
          }}>
            <div style={{
              width:"28px", height:"28px", borderRadius:"50%",
              background:"linear-gradient(135deg,#4F46E5,#7C3AED)",
              display:"flex", alignItems:"center", justifyContent:"center",
              color:"#fff", fontSize:"0.72rem", fontWeight:"600",
            }}>{name.slice(0,2).toUpperCase()}</div>
            <span style={{ fontSize:"0.83rem", fontWeight:"500", color:"#374151" }}>{name}</span>
          </div>
        </div>
      </div>
      <div style={{ padding:"28px 28px 48px" }}>
        <div style={{ marginBottom:"24px", animation:"fadeUp .4s ease both .05s" }}>
          <p style={{ color:"#6B7280", fontSize:"0.875rem", margin:"0 0 4px" }}>Upload and manage company policies</p>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.85rem", fontWeight:"700", color:"#111827", margin:0, lineHeight:1.2 }}>
            Policy Management
          </h1>
          <p style={{ color:"#9CA3AF", fontSize:"0.85rem", margin:"5px 0 0" }}>
            {new Date().toLocaleDateString("en-IN",{ weekday:"long", year:"numeric", month:"long", day:"numeric" })}
          </p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:"14px", marginBottom:"24px" }}>
          {[
            { label:"Total Policies",  count:policies.length,                                     icon:ShieldCheck, color:"#4F46E5", bg:"#EEF2FF" },
            { label:"PDF Files",       count:policies.filter(p=>getExt(p.file)==="pdf").length,   icon:FileText,    color:"#EF4444", bg:"#FEF2F2" },
            { label:"Word Docs",       count:policies.filter(p=>["doc","docx"].includes(getExt(p.file))).length, icon:FileWarning, color:"#059669", bg:"#ECFDF5" },
          ].map((s,i) => {
            const Icon = s.icon;
            return (
              <div key={i} style={{
                background:"#fff", borderRadius:"14px", padding:"18px 20px",
                border:"1px solid #F1F3F9", boxShadow:"0 2px 8px rgba(15,23,42,.05)",
                display:"flex", alignItems:"center", gap:"14px",
                animation:`fadeUp .4s ease both ${.1+i*.06}s`,
                transition:"transform .15s,box-shadow .15s", cursor:"default",
              }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 20px rgba(15,23,42,.08)"}}
              onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 2px 8px rgba(15,23,42,.05)"}}>
                <div style={{ width:"42px", height:"42px", borderRadius:"11px", background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", color:s.color, flexShrink:0 }}>
                  <Icon size={20}/>
                </div>
                <div>
                  <div style={{ fontSize:"1.6rem", fontWeight:"700", color:"#111827", lineHeight:1, fontFamily:"'Playfair Display',serif" }}>
                    {loading ? <span style={{ display:"inline-block", width:"40px", height:"26px", background:"#F3F4F6", borderRadius:"5px" }}/> : s.count}
                  </div>
                  <div style={{ fontSize:"0.75rem", color:"#9CA3AF", fontWeight:"500", marginTop:"3px", textTransform:"uppercase", letterSpacing:"0.4px" }}>{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"340px 1fr", gap:"20px", alignItems:"start" }}>
          <div style={{
            background:"#fff", borderRadius:"16px", border:"1px solid #F1F3F9",
            boxShadow:"0 2px 8px rgba(15,23,42,.05)", overflow:"hidden",
            animation:"fadeUp .4s ease both .22s",
          }}>
            <div style={{ padding:"20px 22px 16px", borderBottom:"1px solid #F1F3F9", background:"linear-gradient(135deg,#FAFBFF 0%,#fff 100%)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{ width:"38px", height:"38px", borderRadius:"10px", background:"#EEF2FF", display:"flex", alignItems:"center", justifyContent:"center", color:"#4F46E5" }}>
                  <Upload size={20}/>
                </div>
                <div>
                  <h2 style={{ fontSize:"1rem", fontWeight:"600", color:"#111827", margin:0 }}>Upload Policy</h2>
                  <p style={{ fontSize:"0.75rem", color:"#9CA3AF", margin:"2px 0 0" }}>PDF, DOC, DOCX · Max 5MB</p>
                </div>
              </div>
            </div>

            <div style={{ padding:"20px 22px", display:"flex", flexDirection:"column", gap:"14px" }}>
              <div>
                <input type="text" placeholder="Policy Title" value={title}
                  onChange={e => { setTitle(e.target.value); setErrors(er=>({...er,title:""})); }}
                  className={`form-input${errors.title?" err":""}`}/>
                {errors.title && <p style={{ color:"#EF4444", fontSize:"0.72rem", margin:"4px 0 0 2px" }}>{errors.title}</p>}
              </div>
              <div>
                <div
                  className={`drop-zone${dragOver?" active":""}`}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e=>{e.preventDefault();setDragOver(true)}}
                  onDragLeave={()=>setDragOver(false)}
                  onDrop={handleDrop}
                >
                  {file ? (
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"8px" }}>
                      <div style={{ width:"44px", height:"44px", borderRadius:"12px", background: extIcon(getExt(file.name)).bg, display:"flex", alignItems:"center", justifyContent:"center", color: extIcon(getExt(file.name)).color, fontSize:"0.72rem", fontWeight:"700" }}>
                        {extIcon(getExt(file.name)).label}
                      </div>
                      <p style={{ fontSize:"0.855rem", fontWeight:"500", color:"#374151", margin:0, maxWidth:"220px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{file.name}</p>
                      <p style={{ fontSize:"0.72rem", color:"#9CA3AF", margin:0 }}>{(file.size/1024/1024).toFixed(2)} MB</p>
                      <button
                        onClick={e=>{e.stopPropagation();setFile(null);if(fileRef.current)fileRef.current.value="";}}
                        style={{ fontSize:"0.72rem", color:"#EF4444", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:"4px" }}>
                        <X size={12}/> Remove
                      </button>
                    </div>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"8px" }}>
                      <div style={{ width:"44px", height:"44px", borderRadius:"12px", background:"#EEF2FF", display:"flex", alignItems:"center", justifyContent:"center", color:"#4F46E5" }}>
                        <FolderOpen size={22}/>
                      </div>
                      <p style={{ fontSize:"0.875rem", fontWeight:"500", color:"#374151", margin:0 }}>Drop file here or <span style={{ color:"#4F46E5" }}>browse</span></p>
                      <p style={{ fontSize:"0.75rem", color:"#9CA3AF", margin:0 }}>Supported: PDF, DOC, DOCX</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display:"none" }}
                  onChange={e=>{const f=e.target.files[0];if(f){setFile(f);setErrors(er=>({...er,file:""}));}}}/>
                {errors.file && <p style={{ color:"#EF4444", fontSize:"0.72rem", margin:"4px 0 0 2px" }}>{errors.file}</p>}
              </div>
              <button className="btn-blue" onClick={handleUpload} disabled={uploading}>
                {uploading ? (
                  <>
                    <span style={{ width:"14px", height:"14px", border:"2px solid rgba(255,255,255,.4)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite", display:"inline-block" }}/>
                    Uploading…
                  </>
                ) : (
                  <><Upload size={15}/> Upload Policy</>
                )}
              </button>
              <div style={{ padding:"10px 14px", borderRadius:"10px", background:"#F0FDF4", border:"1px solid #BBF7D0", fontSize:"0.78rem", color:"#059669", display:"flex", alignItems:"flex-start", gap:"8px" }}>
                <CheckCircle2 size={14} style={{ flexShrink:0, marginTop:"1px" }}/>
                <span>Uploaded policies will be <strong>notified</strong> to all employees and company admins automatically.</span>
              </div>
            </div>
          </div>
          <div style={{
            background:"#fff", borderRadius:"16px", border:"1px solid #F1F3F9",
            boxShadow:"0 2px 8px rgba(15,23,42,.05)", overflow:"hidden",
            animation:"fadeUp .4s ease both .28s",
          }}>
            <div style={{
              padding:"18px 22px", borderBottom:"1px solid #F1F3F9",
              display:"flex", alignItems:"center", justifyContent:"space-between",
              gap:"12px", flexWrap:"wrap",
            }}>
              <div>
                <h2 style={{ fontSize:"1rem", fontWeight:"600", color:"#111827", margin:"0 0 2px" }}>Policy Documents</h2>
                <p style={{ fontSize:"0.78rem", color:"#9CA3AF", margin:0, display:"flex", alignItems:"center", gap:"5px" }}>
                  <Clock size={12}/>{filtered.length} document{filtered.length!==1?"s":""} found
                </p>
              </div>
              <div style={{ display:"flex", gap:"8px", alignItems:"center", flexWrap:"wrap" }}>
                <div style={{ position:"relative" }}>
                  <Filter size={12} style={{ position:"absolute", left:"9px", top:"50%", transform:"translateY(-50%)", color:"#9CA3AF", pointerEvents:"none" }}/>
                  <select value={filterExt} onChange={e=>setFilterExt(e.target.value)} style={{
                    padding:"7px 12px 7px 26px", border:"1.5px solid #E5E7EB", borderRadius:"9px",
                    fontSize:"0.78rem", color:"#374151", background:"#F9FAFB",
                    fontFamily:"'DM Sans',sans-serif", outline:"none", cursor:"pointer", appearance:"none",
                  }}>
                    <option value="all">All Types</option>
                    <option value="pdf">PDF Only</option>
                    <option value="doc">Word Only</option>
                  </select>
                </div>
                <div style={{ position:"relative" }}>
                  <Search size={13} style={{ position:"absolute", left:"9px", top:"50%", transform:"translateY(-50%)", color:"#9CA3AF" }}/>
                  <input className="search-inp" placeholder="Search policies…" value={search} onChange={e=>setSearch(e.target.value)} style={{
                    padding:"7px 12px 7px 28px", border:"1.5px solid #E5E7EB", borderRadius:"9px",
                    fontSize:"0.78rem", color:"#374151", background:"#F9FAFB",
                    fontFamily:"'DM Sans',sans-serif", width:"180px", outline:"none",
                  }}/>
                </div>
                <button onClick={fetchPolicies} title="Refresh" style={{
                  width:"34px", height:"34px", border:"1.5px solid #E5E7EB", borderRadius:"9px",
                  background:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
                  color:"#6B7280", cursor:"pointer",
                }}>
                  <RefreshCw size={14}/>
                </button>
              </div>
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:"#FAFBFF" }}>
                    {["#","Policy","File","Date","Actions"].map((h,i) => (
                      <th key={i} style={{
                        padding:"11px 22px", textAlign:"left",
                        fontSize:"0.72rem", fontWeight:"600", color:"#9CA3AF",
                        textTransform:"uppercase", letterSpacing:"0.5px",
                        borderBottom:"1px solid #F1F3F9",
                        ...(i===4 ? {textAlign:"right"} : {}),
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({length:5}).map((_,i) => (
                      <tr key={i}>
                        {[30,180,120,100,80].map((w,j) => (
                          <td key={j} style={{ padding:"14px 22px" }}>
                            <div style={{ height:"13px", width:`${w}px`, background:"#F3F4F6", borderRadius:"4px" }}/>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding:"60px", textAlign:"center" }}>
                        <div style={{ width:"52px", height:"52px", borderRadius:"14px", background:"#F3F4F6", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", color:"#D1D5DB" }}>
                          <Inbox size={24}/>
                        </div>
                        <p style={{ color:"#9CA3AF", fontSize:"0.875rem", margin:0, fontWeight:"500" }}>No policies found</p>
                        <p style={{ color:"#D1D5DB", fontSize:"0.78rem", margin:"4px 0 0" }}>Upload your first company policy!</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((pol, i) => {
                      const ext = getExt(pol.file);
                      const ei = extIcon(ext);
                      return (
                        <tr key={pol._id || i} className="pol-row" style={{ animation:`slideIn .3s ease both ${i*.03}s` }}>
                          <td style={{ padding:"13px 22px", fontSize:"0.82rem", color:"#9CA3AF", fontWeight:"500" }}>
                            {String(i+1).padStart(2,"0")}
                          </td>
                          <td style={{ padding:"13px 22px" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                              <div style={{
                                width:"36px", height:"36px", borderRadius:"9px", background:ei.bg,
                                display:"flex", alignItems:"center", justifyContent:"center",
                                color:ei.color, fontSize:"0.65rem", fontWeight:"700", flexShrink:0,
                              }}>{ei.label}</div>
                              <span style={{ fontSize:"0.875rem", fontWeight:"500", color:"#111827" }}>{pol.title}</span>
                            </div>
                          </td>
                          <td style={{ padding:"13px 22px" }}>
                            <span style={{ fontSize:"0.78rem", color:"#6B7280", fontFamily:"'Courier New',monospace", background:"#F9FAFB", padding:"3px 8px", borderRadius:"6px", border:"1px solid #F1F3F9" }}>
                              {pol.file?.length > 24 ? `…${pol.file.slice(-20)}` : pol.file}
                            </span>
                          </td>
                          <td style={{ padding:"13px 22px" }}>
                            <div style={{ fontSize:"0.78rem", color:"#6B7280", display:"flex", alignItems:"center", gap:"4px" }}>
                              <Clock size={11} style={{ color:"#9CA3AF" }}/>
                              {new Date(pol.createdAt).toLocaleDateString("en-IN",{ day:"2-digit", month:"short", year:"numeric" })}
                            </div>
                          </td>
                          <td style={{ padding:"13px 22px" }}>
                            <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", gap:"6px" }}>
                              <a
                                href={`${API}/view/${pol.file}`}
                                target="_blank" rel="noreferrer"
                                title="View"
                                style={{
                                  width:"32px", height:"32px", borderRadius:"8px",
                                  border:"1.5px solid #E5E7EB", background:"#fff",
                                  display:"flex", alignItems:"center", justifyContent:"center",
                                  color:"#4F46E5", textDecoration:"none", transition:"all .15s",
                                }}
                                onMouseEnter={e=>{e.currentTarget.style.background="#EEF2FF";e.currentTarget.style.borderColor="#C7D2FE"}}
                                onMouseLeave={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.borderColor="#E5E7EB"}}
                              >
                                <Eye size={14}/>
                              </a>
                              <a
                                href={`${API}/view/${pol.file}`}
                                download title="Download"
                                style={{
                                  width:"32px", height:"32px", borderRadius:"8px",
                                  border:"1.5px solid #E5E7EB", background:"#fff",
                                  display:"flex", alignItems:"center", justifyContent:"center",
                                  color:"#059669", textDecoration:"none", transition:"all .15s",
                                }}
                                onMouseEnter={e=>{e.currentTarget.style.background="#ECFDF5";e.currentTarget.style.borderColor="#A7F3D0"}}
                                onMouseLeave={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.borderColor="#E5E7EB"}}
                              >
                                <Download size={14}/>
                              </a>
                              <button
                                className="del-btn"
                                onClick={() => setDeleteModal(pol)}
                                title="Delete"
                                style={{
                                  width:"32px", height:"32px", borderRadius:"8px",
                                  border:"1.5px solid #E5E7EB", background:"#fff",
                                  display:"flex", alignItems:"center", justifyContent:"center",
                                  color:"#9CA3AF", cursor:"pointer", transition:"all .15s",
                                }}>
                                <Trash2 size={14}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {!loading && filtered.length > 0 && (
              <div style={{ padding:"11px 22px", borderTop:"1px solid #F1F3F9", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:"0.75rem", color:"#9CA3AF" }}>Showing {filtered.length} of {policies.length} policies</span>
                <div style={{ display:"flex", alignItems:"center", gap:"5px", color:"#9CA3AF", fontSize:"0.72rem" }}>
                  <CheckCircle2 size={11}/> Up to date
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}