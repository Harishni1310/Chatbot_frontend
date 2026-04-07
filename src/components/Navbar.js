import { useState, useEffect } from "react";

const Navbar = ({ onLoginClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      const sections = ["home", "about", "features", "contact"];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActive(id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <a href="#home" className="nav-logo" onClick={(e) => { e.preventDefault(); scrollTo("home"); }}>
        <div className="nav-logo-icon">🤖</div>
        <span className="nav-logo-text">AI Student Assistant</span>
      </a>

      <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
        {["home", "about", "features", "contact"].map((id) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={active === id ? "active" : ""}
              onClick={(e) => { e.preventDefault(); scrollTo(id); }}
            >
              {id.charAt(0).toUpperCase() + id.slice(1)}
            </a>
          </li>
        ))}
        <li>
          <a href="/login" className="nav-login-btn" onClick={(e) => { e.preventDefault(); onLoginClick(); }}>
            Login
          </a>
        </li>
      </ul>

      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        <span /><span /><span />
      </div>
    </nav>
  );
};

export default Navbar;
