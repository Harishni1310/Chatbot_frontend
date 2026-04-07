import { useState } from "react";
import Chatbot from "../components/Chatbot";
import { registerUser } from "../services/api";

const SignupPage = ({ onGoLogin, onViewHome }) => {
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await registerUser(form.name, form.email, form.password);
      setDone(true);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) return <Chatbot onLogout={onGoLogin} isGuest={false} />;

  return (
    <div className="login-page">
      <div className="login-bg-orb login-bg-orb-1" />
      <div className="login-bg-orb login-bg-orb-2" />

      <button onClick={onViewHome} className="login-home-link">
        🏠 View Website
      </button>

      <div className="login-card signup-card">
        {/* Header */}
        <div className="login-header">
          <div className="login-logo">🎓</div>
          <h1 className="login-title">Create Account</h1>
          <p className="login-subtitle">Join the AI Student Assistant platform</p>
        </div>

        {/* Error */}
        {error && <div className="login-error">⚠️ {error}</div>}

        {/* Signup Form */}
        <form className="login-form" onSubmit={handleSignup}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              type="text"
              name="name"
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
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
          <div className="signup-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                name="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                className="form-input"
                type="password"
                name="confirm"
                placeholder="Re-enter password"
                value={form.confirm}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password strength indicator */}
          {form.password && (
            <div className="password-strength">
              <div className="strength-bars">
                <span className={`strength-bar ${form.password.length >= 1 ? "active weak" : ""}`} />
                <span className={`strength-bar ${form.password.length >= 6 ? "active medium" : ""}`} />
                <span className={`strength-bar ${form.password.length >= 10 ? "active strong" : ""}`} />
              </div>
              <span className="strength-label">
                {form.password.length < 6 ? "Weak" : form.password.length < 10 ? "Medium" : "Strong"}
              </span>
            </div>
          )}

          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? "Creating account..." : "✨ Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="login-divider">
          <span className="login-divider-line" />
          <span className="login-divider-text">already have an account?</span>
          <span className="login-divider-line" />
        </div>

        {/* Back to Login */}
        <button className="switch-auth-btn" onClick={onGoLogin}>
          🔑 Sign In Instead
        </button>

        <p className="login-footer-text">
          © {new Date().getFullYear()} Department of Technical Education
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
