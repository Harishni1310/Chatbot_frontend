import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FeatureCard from "../components/FeatureCard";
import ContactForm from "../components/ContactForm";
import useScrollAnimation from "../hooks/useScrollAnimation";

const FEATURES = [
  { icon: "🤖", title: "AI Chatbot Assistance", desc: "Students can ask questions and get instant, accurate answers powered by artificial intelligence." },
  { icon: "📚", title: "FAQ Knowledge Base", desc: "Uses a rich stored knowledge base of frequently asked questions for lightning-fast responses." },
  { icon: "🧠", title: "Smart AI Processing", desc: "Intelligently handles unknown queries by understanding context and providing relevant answers." },
  { icon: "🛡️", title: "Admin Dashboard", desc: "Admins can manage chatbot data, update FAQs, and monitor student interactions easily." },
  { icon: "🎓", title: "Student Friendly UI", desc: "Designed with simplicity in mind — clean, intuitive, and accessible for all students." },
];

const ABOUT_CARDS = [
  { icon: "⚡", title: "Instant Responses", text: "Get answers to academic queries in milliseconds, available 24/7 without waiting." },
  { icon: "🎯", title: "Accurate Information", text: "Powered by a curated knowledge base specific to the Department of Technical Education." },
  { icon: "🔒", title: "Secure & Reliable", text: "Built with security best practices to protect student data and ensure uptime." },
];

const HomePage = ({ onLoginClick }) => {
  const aboutRef = useScrollAnimation();
  const featuresRef = useScrollAnimation();
  const contactRef = useScrollAnimation();

  return (
    <>
      <Navbar onLoginClick={onLoginClick} />

      {/* ── HERO ── */}
      <section id="home" className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
        </div>
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Powered by Artificial Intelligence
            </div>
            <h1 className="hero-title">
              <span className="hero-title-gradient">AI Powered</span>
              <br />Student Assistant
              <br />Chatbot
            </h1>
            <p className="hero-subtitle">
              An intelligent assistant that helps students access academic information
              like exams, syllabus, results, and admissions instantly.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={onLoginClick}>
                🚀 Login to Chat
              </button>
              <button
                className="btn-secondary"
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Features →
              </button>
            </div>
            <div className="hero-stats">
              <div>
                <div className="hero-stat-value">24/7</div>
                <div className="hero-stat-label">Always Available</div>
              </div>
              <div>
                <div className="hero-stat-value">100+</div>
                <div className="hero-stat-label">FAQs Covered</div>
              </div>
              <div>
                <div className="hero-stat-value">AI</div>
                <div className="hero-stat-label">Powered Engine</div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-illustration">
              <div className="hero-circle-main">
                <div className="hero-circle-inner">🤖</div>
              </div>
              <div className="hero-floating-card hero-floating-card-1">
                <span>📋</span> Exam Schedules
              </div>
              <div className="hero-floating-card hero-floating-card-2">
                <span>🎓</span> Admission Info
              </div>
              <div className="hero-floating-card hero-floating-card-3">
                <span>📊</span> Results Ready
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="section-full">
        <div className="section-inner" ref={aboutRef}>
          <div className="about-grid">
            <div>
              <span className="section-tag fade-in-up">About the Project</span>
              <h2 className="section-title fade-in-up">
                Simplifying Academic Queries with <span>AI Intelligence</span>
              </h2>
              <p className="section-subtitle fade-in-up" style={{ marginBottom: "2rem" }}>
                The AI Student Assistant simplifies academic queries by providing instant
                responses using artificial intelligence, reducing the burden on staff and
                empowering students with self-service access to information.
              </p>
              <div className="about-cards">
                {ABOUT_CARDS.map((c, i) => (
                  <div className="about-card fade-in-up" key={i} style={{ transitionDelay: `${i * 100}ms` }}>
                    <div className="about-card-icon">{c.icon}</div>
                    <div>
                      <div className="about-card-title">{c.title}</div>
                      <div className="about-card-text">{c.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="about-visual fade-in-up">
              <div className="about-image-wrap">🎓</div>
              <div className="about-badge about-badge-1">🤖 AI Powered</div>
              <div className="about-badge about-badge-2">⚡ Instant Answers</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="section">
        <div ref={featuresRef}>
          <div className="text-center">
            <span className="section-tag fade-in-up">Features</span>
            <h2 className="section-title fade-in-up">
              Everything Students <span>Need</span>
            </h2>
            <p className="section-subtitle fade-in-up">
              Packed with powerful features to make academic information accessible,
              fast, and intelligent.
            </p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="section-full">
        <div className="section-inner" ref={contactRef}>
          <div className="text-center" style={{ marginBottom: "1rem" }}>
            <span className="section-tag fade-in-up">Contact</span>
            <h2 className="section-title fade-in-up">
              Get in <span>Touch</span>
            </h2>
            <p className="section-subtitle fade-in-up">
              Have questions or feedback? We'd love to hear from you.
            </p>
          </div>
          <div className="contact-grid">
            <div className="contact-info">
              {[
                { icon: "📧", label: "Email", value: "info@dte.edu.in" },
                { icon: "📞", label: "Phone", value: "+91 98765 43210" },
                { icon: "📍", label: "Address", value: "Department of Technical Education, State Headquarters" },
                { icon: "🕐", label: "Office Hours", value: "Mon – Fri, 9:00 AM – 5:00 PM" },
              ].map((item, i) => (
                <div className="contact-info-card fade-in-up" key={i} style={{ transitionDelay: `${i * 80}ms` }}>
                  <div className="contact-info-icon">{item.icon}</div>
                  <div>
                    <div className="contact-info-label">{item.label}</div>
                    <div className="contact-info-value">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <ContactForm />
          </div>
        </div>
      </section>

      <Footer onLoginClick={onLoginClick} />
    </>
  );
};

export default HomePage;
