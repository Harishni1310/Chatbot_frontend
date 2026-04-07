const Footer = ({ onLoginClick }) => {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="nav-logo" style={{ marginBottom: "0.5rem" }}>
              <div className="nav-logo-icon">🤖</div>
              <span className="nav-logo-text">AI Student Assistant</span>
            </div>
            <p>
              An intelligent AI-powered chatbot for the Department of Technical Education,
              helping students access academic information instantly.
            </p>
          </div>

          <div>
            <p className="footer-title">Navigation</p>
            <ul className="footer-links">
              {["home", "about", "features", "contact"].map((id) => (
                <li key={id}>
                  <a href={`#${id}`} onClick={(e) => { e.preventDefault(); scrollTo(id); }}>
                    {id.charAt(0).toUpperCase() + id.slice(1)}
                  </a>
                </li>
              ))}
              <li>
                <a href="/login" onClick={(e) => { e.preventDefault(); onLoginClick(); }}>
                  Login
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="footer-title">Contact</p>
            <div className="footer-contact-item">📧 info@dte.edu.in</div>
            <div className="footer-contact-item">📞 +91 98765 43210</div>
            <div className="footer-contact-item">📍 Department of Technical Education</div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} AI Student Assistant — Department of Technical Education. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#home" onClick={(e) => { e.preventDefault(); scrollTo("home"); }}>Privacy</a>
            <a href="#home" onClick={(e) => { e.preventDefault(); scrollTo("home"); }}>Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
