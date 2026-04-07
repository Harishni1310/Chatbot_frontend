import { useState } from "react";
import Chatbot from "../components/Chatbot";
import AdminDashboard from "./AdminDashboard";
import { loginUser } from "../services/api";

const LoginPage = ({ onViewHome, onGoSignup }) => {
  const [user, setUser] = useState(null);
  const [guestMode, setGuestMode] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const data = await loginUser(form.email, form.password);
      setUser(data.data); // { id, name, email, role }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setGuestMode(false);
    setForm({ email: "", password: "" });
  };

  // Route based on role
  if (guestMode) return <Chatbot onLogout={handleLogout} isGuest={true} />;
  if (user?.role === "ADMIN") return <AdminDashboard user={user} onLogout={handleLogout} />;
  if (user?.role === "USER") return <Chatbot onLogout={handleLogout} isGuest={false} userId={user.id} />;

  return (
    <div className="login-page">
      <div className="login-bg-orb login-bg-orb-1" />
      <div className="login-bg-orb login-bg-orb-2" />

      <button onClick={onViewHome} className="login-home-link">
        🏠 View Website
      </button>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🤖</div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to your AI Student Assistant</p>
        </div>

        {error && <div className="login-error">⚠️ {error}</div>}

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="student@dte.edu.in"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? "Signing in..." : "🚀 Sign In"}
          </button>
        </form>

        <div className="login-signup-prompt">
          <span>New to the platform?</span>
          <button className="login-signup-link" onClick={onGoSignup}>
            Create an account →
          </button>
        </div>

        <div className="login-divider">
          <span className="login-divider-line" />
          <span className="login-divider-text">or</span>
          <span className="login-divider-line" />
        </div>

        <button className="guest-btn" onClick={() => setGuestMode(true)}>
          <span className="guest-btn-icon">👤</span>
          <div className="guest-btn-text">
            <span className="guest-btn-title">Continue as Guest</span>
            <span className="guest-btn-sub">No account needed · Limited access</span>
          </div>
          <span className="guest-btn-arrow">→</span>
        </button>

        <p className="login-footer-text">
          © {new Date().getFullYear()} Department of Technical Education
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
