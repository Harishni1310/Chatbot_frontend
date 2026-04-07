import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  adminGetFAQs, adminAddFAQ, adminUpdateFAQ, adminDeleteFAQ,
  adminGetChatLogs, adminGetUsers, adminGetQueries,
  adminGetAnalytics, adminCreateNotification, adminDeleteNotification,
  adminGetSuggestedFAQs, adminAddFAQFromSuggestion, adminDismissSuggestion
} from "../services/api";

const TABS = [
  { id: "dashboard",     label: "Dashboard",         icon: "📊" },
  { id: "analytics",     label: "Analytics",          icon: "📈" },
  { id: "faqs",          label: "FAQ Management",     icon: "📚" },
  { id: "suggested",     label: "Suggested FAQs",     icon: "🧠" },
  { id: "chatlogs",      label: "Chat Logs",          icon: "💬" },
  { id: "queries",       label: "Student Queries",    icon: "❓" },
  { id: "users",         label: "Users",              icon: "👥" },
  { id: "notifications", label: "Notifications",      icon: "🔔" },
];

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [faqs, setFaqs]           = useState([]);
  const [chatLogs, setChatLogs]   = useState([]);
  const [queries, setQueries]     = useState([]);
  const [users, setUsers]         = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [suggestedFAQs, setSuggestedFAQs] = useState([]);
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);
  const [suggestionAnswer, setSuggestionAnswer] = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");

  const [faqForm, setFaqForm]         = useState({ question: "", answer: "" });
  const [editingFaq, setEditingFaq]   = useState(null);
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [notifForm, setNotifForm]     = useState({ title: "", message: "" });

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 30000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line

  const loadAll = async () => {
    setLoading(true);
    try {
      const [f, c, q, u, a] = await Promise.all([
        adminGetFAQs(user.id),
        adminGetChatLogs(user.id),
        adminGetQueries(user.id),
        adminGetUsers(user.id),
        adminGetAnalytics(user.id),
      ]);
      setFaqs(f.data || []);
      setChatLogs(c.data || []);
      setQueries(q.data || []);
      setUsers(u.data || []);
      setAnalytics(a.data || null);
      // Load notifications and suggested FAQs
      const nr = await fetch("http://localhost:8080/api/notifications");
      const nd = await nr.json();
      setNotifications(nd.data || []);
      const sf = await adminGetSuggestedFAQs(user.id);
      setSuggestedFAQs(sf.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(""), 3000); };

  const handleFaqSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFaq) {
        await adminUpdateFAQ(user.id, editingFaq.id, faqForm.question, faqForm.answer);
        showMsg("FAQ updated!");
      } else {
        await adminAddFAQ(user.id, faqForm.question, faqForm.answer);
        showMsg("FAQ added!");
      }
      setFaqForm({ question: "", answer: "" });
      setEditingFaq(null);
      setShowFaqForm(false);
      const f = await adminGetFAQs(user.id);
      setFaqs(f.data || []);
    } catch (e) { setError(e.message); }
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm("Delete this FAQ?")) return;
    try {
      await adminDeleteFAQ(user.id, id);
      setFaqs(faqs.filter(f => f.id !== id));
      showMsg("FAQ deleted!");
    } catch (e) { setError(e.message); }
  };

  const handleCreateNotif = async (e) => {
    e.preventDefault();
    try {
      await adminCreateNotification(user.id, notifForm.title, notifForm.message);
      setNotifForm({ title: "", message: "" });
      showMsg("Notification sent!");
      const nr = await fetch("http://localhost:8080/api/notifications");
      const nd = await nr.json();
      setNotifications(nd.data || []);
    } catch (e) { setError(e.message); }
  };

  const handleDeleteNotif = async (id) => {
    try {
      await adminDeleteNotification(user.id, id);
      setNotifications(notifications.filter(n => n.id !== id));
      showMsg("Notification deleted!");
    } catch (e) { setError(e.message); }
  };

  const formatDate = (ts) => ts ? new Date(ts).toLocaleString() : "—";

  const GOLD = "#c9a84c";
  const GOLD2 = "#f0c040";

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: "#111", border: "1px solid #c9a84c33", borderRadius: 10, padding: "8px 14px" }}>
        <p style={{ color: "#f0c040", fontSize: 12, marginBottom: 4 }}>{label}</p>
        <p style={{ color: "#f5e6c8", fontSize: 13, fontWeight: 700 }}>{payload[0].value}</p>
      </div>
    );
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-logo-icon">🛡️</div>
          <div>
            <div className="admin-logo-text">Admin Panel</div>
            <div className="admin-logo-sub">DTE Chatbot</div>
          </div>
        </div>

        <div className="admin-user-card">
          <div className="admin-user-avatar">👤</div>
          <div>
            <div className="admin-user-name">{user.name}</div>
            <div className="admin-user-role">Administrator</div>
          </div>
        </div>

        <nav className="admin-nav">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`admin-nav-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="admin-nav-icon">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === "notifications" && notifications.length > 0 && (
                <span className="admin-nav-badge">{notifications.length}</span>
              )}
              {tab.id === "suggested" && suggestedFAQs.length > 0 && (
                <span className="admin-nav-badge" style={{ background: "#ef4444", color: "#fff" }}>{suggestedFAQs.length}</span>
              )}
            </button>
          ))}
        </nav>

        <button className="admin-logout-btn" onClick={onLogout}>
          <span>🚪</span><span>Logout</span>
        </button>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <h1 className="admin-topbar-title">
            {TABS.find(t => t.id === activeTab)?.icon} {TABS.find(t => t.id === activeTab)?.label}
          </h1>
          <button className="admin-refresh-btn" onClick={loadAll}>🔄 Refresh</button>
        </div>

        {error && (
          <div className="admin-alert error">⚠️ {error}
            <button onClick={() => setError("")}>✕</button>
          </div>
        )}
        {success && <div className="admin-alert success">✅ {success}</div>}
        {loading && <div className="admin-loading">Loading...</div>}

        {/* ── DASHBOARD ── */}
        {activeTab === "dashboard" && (
          <div className="admin-content">
            <div className="admin-stats-grid">
              {[
                { icon: "📚", label: "Total FAQs",    value: faqs.length,      color: GOLD },
                { icon: "💬", label: "Chat Logs",     value: chatLogs.length,  color: GOLD2 },
                { icon: "❓", label: "Queries",       value: queries.length,   color: "#a67c2e" },
                { icon: "👥", label: "Users",         value: users.length,     color: GOLD },
              ].map((s, i) => (
                <div className="admin-stat-card" key={i}>
                  <div className="admin-stat-icon" style={{ color: s.color }}>{s.icon}</div>
                  <div className="admin-stat-value" style={{ color: s.color }}>{s.value}</div>
                  <div className="admin-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="admin-recent-section">
              <h3 className="admin-section-title">Recent Chat Logs</h3>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>#</th><th>Question</th><th>Answer</th><th>Time</th></tr></thead>
                  <tbody>
                    {[...chatLogs].reverse().slice(0, 5).map((log, i) => (
                      <tr key={log.id}>
                        <td>{i + 1}</td>
                        <td>{log.question}</td>
                        <td>{log.answer?.slice(0, 60)}...</td>
                        <td>{formatDate(log.timestamp)}</td>
                      </tr>
                    ))}
                    {chatLogs.length === 0 && <tr><td colSpan="4" className="admin-empty">No logs yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {activeTab === "analytics" && (
          <div className="admin-content">
            {analytics ? (
              <>
                <div className="admin-stats-grid" style={{ marginBottom: "2rem" }}>
                  {[
                    { icon: "👥", label: "Total Users",   value: analytics.totalUsers,   color: GOLD },
                    { icon: "💬", label: "Total Chats",   value: analytics.totalChats,   color: GOLD2 },
                    { icon: "❓", label: "Total Queries", value: analytics.totalQueries, color: "#a67c2e" },
                  ].map((s, i) => (
                    <div className="admin-stat-card" key={i}>
                      <div className="admin-stat-icon" style={{ color: s.color }}>{s.icon}</div>
                      <div className="admin-stat-value" style={{ color: s.color }}>{s.value}</div>
                      <div className="admin-stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="analytics-charts-grid">
                  {/* Bar Chart — Top Questions */}
                  <div className="analytics-chart-card">
                    <h3 className="admin-section-title">📊 Most Asked Questions</h3>
                    {analytics.topQuestions?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={analytics.topQuestions} margin={{ top: 10, right: 10, left: -10, bottom: 60 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.1)" />
                          <XAxis dataKey="question" tick={{ fill: "#a89060", fontSize: 10 }}
                            angle={-30} textAnchor="end" interval={0} />
                          <YAxis tick={{ fill: "#a89060", fontSize: 11 }} allowDecimals={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="count" fill={GOLD} radius={[6, 6, 0, 0]}
                            style={{ filter: "drop-shadow(0 0 6px rgba(201,168,76,0.5))" }} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : <p className="admin-empty">No data yet</p>}
                  </div>

                  {/* Line Chart — Daily Usage */}
                  <div className="analytics-chart-card">
                    <h3 className="admin-section-title">📈 Daily Chat Activity (Last 7 Days)</h3>
                    {analytics.dailyChats?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={analytics.dailyChats} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.1)" />
                          <XAxis dataKey="date" tick={{ fill: "#a89060", fontSize: 11 }} />
                          <YAxis tick={{ fill: "#a89060", fontSize: 11 }} allowDecimals={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line type="monotone" dataKey="count" stroke={GOLD2} strokeWidth={2.5}
                            dot={{ fill: GOLD, r: 5, strokeWidth: 2 }}
                            activeDot={{ r: 7, fill: GOLD2, stroke: "#0a0a0a" }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : <p className="admin-empty">No data yet</p>}
                  </div>
                </div>
              </>
            ) : <p className="admin-empty">Loading analytics...</p>}
          </div>
        )}

        {/* ── FAQs ── */}
        {activeTab === "faqs" && (
          <div className="admin-content">
            <div className="admin-action-bar">
              <span className="admin-count">{faqs.length} FAQs total</span>
              <button className="admin-add-btn" onClick={() => {
                setEditingFaq(null);
                setFaqForm({ question: "", answer: "" });
                setShowFaqForm(!showFaqForm);
              }}>{showFaqForm ? "✕ Cancel" : "➕ Add FAQ"}</button>
            </div>
            {showFaqForm && (
              <form className="admin-form" onSubmit={handleFaqSubmit}>
                <h3>{editingFaq ? "✏️ Edit FAQ" : "➕ Add New FAQ"}</h3>
                <div className="form-group">
                  <label className="form-label">Question</label>
                  <input className="form-input" placeholder="Enter question..."
                    value={faqForm.question}
                    onChange={e => setFaqForm({ ...faqForm, question: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Answer</label>
                  <textarea className="form-textarea" placeholder="Enter answer..."
                    value={faqForm.answer}
                    onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })} required />
                </div>
                <button type="submit" className="admin-submit-btn">
                  {editingFaq ? "✅ Update FAQ" : "✅ Save FAQ"}
                </button>
              </form>
            )}
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>#</th><th>Question</th><th>Answer</th><th>Actions</th></tr></thead>
                <tbody>
                  {faqs.map((faq, i) => (
                    <tr key={faq.id}>
                      <td>{i + 1}</td><td>{faq.question}</td><td>{faq.answer}</td>
                      <td>
                        <div className="admin-action-btns">
                          <button className="admin-edit-btn" onClick={() => {
                            setEditingFaq(faq);
                            setFaqForm({ question: faq.question, answer: faq.answer });
                            setShowFaqForm(true);
                          }}>✏️ Edit</button>
                          <button className="admin-delete-btn" onClick={() => handleDeleteFaq(faq.id)}>🗑️ Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {faqs.length === 0 && <tr><td colSpan="4" className="admin-empty">No FAQs found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SUGGESTED FAQs ── */}
        {activeTab === "suggested" && (
          <div className="admin-content">
            <div className="admin-action-bar">
              <span className="admin-count">{suggestedFAQs.length} unanswered questions detected</span>
            </div>
            {suggestedFAQs.length === 0 && (
              <p className="admin-empty" style={{ padding: "3rem" }}>No suggested FAQs yet. They appear when users ask questions not in the FAQ database.</p>
            )}
            <div className="suggested-faq-list">
              {suggestedFAQs.map(s => (
                <div key={s.id} className={`suggested-faq-card ${s.frequency >= 5 ? "high-freq" : ""}`}>
                  <div className="suggested-faq-top">
                    <div className="suggested-faq-question">{s.question}</div>
                    <div className="suggested-faq-meta">
                      <span className={`freq-badge ${s.frequency >= 5 ? "high" : s.frequency >= 3 ? "med" : "low"}`}>
                        🔥 {s.frequency} times asked
                      </span>
                      <div className="suggested-faq-actions">
                        <button className="admin-edit-btn" onClick={() => {
                          setExpandedSuggestion(expandedSuggestion === s.id ? null : s.id);
                          setSuggestionAnswer("");
                        }}>
                          {expandedSuggestion === s.id ? "✕ Cancel" : "✅ Add to FAQ"}
                        </button>
                        <button className="admin-delete-btn" onClick={async () => {
                          await adminDismissSuggestion(user.id, s.id);
                          setSuggestedFAQs(suggestedFAQs.filter(x => x.id !== s.id));
                          showMsg("Suggestion dismissed");
                        }}>🗑️ Dismiss</button>
                      </div>
                    </div>
                  </div>
                  {expandedSuggestion === s.id && (
                    <div className="suggested-faq-answer-form">
                      <label className="form-label">Write the answer for this question:</label>
                      <textarea
                        className="form-textarea"
                        placeholder="Enter answer..."
                        value={suggestionAnswer}
                        onChange={e => setSuggestionAnswer(e.target.value)}
                        rows={3}
                      />
                      <button className="admin-submit-btn" style={{ marginTop: "0.6rem" }} onClick={async () => {
                        if (!suggestionAnswer.trim()) return;
                        try {
                          await adminAddFAQFromSuggestion(user.id, s.id, s.question, suggestionAnswer);
                          setSuggestedFAQs(suggestedFAQs.filter(x => x.id !== s.id));
                          setExpandedSuggestion(null);
                          setSuggestionAnswer("");
                          showMsg("FAQ added successfully!");
                          const f = await adminGetFAQs(user.id);
                          setFaqs(f.data || []);
                        } catch (e) { setError(e.message); }
                      }}>✅ Save to FAQ</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CHAT LOGS ── */}}
        {activeTab === "chatlogs" && (
          <div className="admin-content">
            <div className="admin-action-bar">
              <span className="admin-count">{chatLogs.length} total logs</span>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>#</th><th>User ID</th><th>Question</th><th>Answer</th><th>Timestamp</th></tr></thead>
                <tbody>
                  {chatLogs.map((log, i) => (
                    <tr key={log.id}>
                      <td>{i + 1}</td>
                      <td>{log.userId || "Guest"}</td>
                      <td>{log.question}</td>
                      <td>{log.answer}</td>
                      <td>{formatDate(log.timestamp)}</td>
                    </tr>
                  ))}
                  {chatLogs.length === 0 && <tr><td colSpan="5" className="admin-empty">No logs yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── QUERIES ── */}
        {activeTab === "queries" && (
          <div className="admin-content">
            <div className="admin-action-bar">
              <span className="admin-count">{queries.length} total queries</span>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>#</th><th>User ID</th><th>Question</th><th>Timestamp</th></tr></thead>
                <tbody>
                  {queries.map((q, i) => (
                    <tr key={q.id}>
                      <td>{i + 1}</td>
                      <td>{q.userId || "Guest"}</td>
                      <td>{q.question}</td>
                      <td>{formatDate(q.timestamp)}</td>
                    </tr>
                  ))}
                  {queries.length === 0 && <tr><td colSpan="4" className="admin-empty">No queries yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {activeTab === "users" && (
          <div className="admin-content">
            <div className="admin-action-bar">
              <span className="admin-count">{users.length} registered users</span>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Role</th></tr></thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id}>
                      <td>{i + 1}</td><td>{u.name}</td><td>{u.email}</td>
                      <td>
                        <span className={`admin-role-badge ${u.role?.toLowerCase()}`}>{u.role}</span>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && <tr><td colSpan="4" className="admin-empty">No users found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS ── */}
        {activeTab === "notifications" && (
          <div className="admin-content">
            <form className="admin-form" onSubmit={handleCreateNotif} style={{ marginBottom: "1.5rem" }}>
              <h3>📢 Send New Notification</h3>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" placeholder="e.g. Exam Schedule Released"
                  value={notifForm.title}
                  onChange={e => setNotifForm({ ...notifForm, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-textarea" placeholder="Enter notification message..."
                  value={notifForm.message}
                  onChange={e => setNotifForm({ ...notifForm, message: e.target.value })} required />
              </div>
              <button type="submit" className="admin-submit-btn">📢 Send Notification</button>
            </form>

            <h3 className="admin-section-title">Sent Notifications ({notifications.length})</h3>
            <div className="notif-list">
              {notifications.map(n => (
                <div key={n.id} className="notif-admin-card">
                  <div className="notif-admin-info">
                    <div className="notif-admin-title">{n.title}</div>
                    <div className="notif-admin-msg">{n.message}</div>
                    <div className="notif-admin-time">{formatDate(n.createdAt)}</div>
                  </div>
                  <button className="admin-delete-btn" onClick={() => handleDeleteNotif(n.id)}>🗑️</button>
                </div>
              ))}
              {notifications.length === 0 && <p className="admin-empty">No notifications sent yet</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
