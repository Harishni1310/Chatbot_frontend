import { useState } from "react";

const ContactForm = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: "", email: "", message: "" });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="contact-form-card fade-in-up">
      <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem" }}>
        Send us a Message
      </h3>
      {sent && (
        <div style={{
          background: "rgba(74, 222, 128, 0.1)",
          border: "1px solid rgba(74, 222, 128, 0.3)",
          borderRadius: "12px",
          padding: "0.8rem 1rem",
          marginBottom: "1rem",
          color: "#4ade80",
          fontSize: "0.9rem"
        }}>
          ✅ Message sent successfully!
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            className="form-input"
            type="text"
            name="name"
            placeholder="Your name"
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
            placeholder="your@email.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Message</label>
          <textarea
            className="form-textarea"
            name="message"
            placeholder="Write your message..."
            value={form.message}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
          Send Message ✉️
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
