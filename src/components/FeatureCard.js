const FeatureCard = ({ icon, title, desc, delay = 0 }) => (
  <div className="feature-card fade-in-up" style={{ transitionDelay: `${delay}ms` }}>
    <div className="feature-icon">{icon}</div>
    <h3 className="feature-title">{title}</h3>
    <p className="feature-desc">{desc}</p>
  </div>
);

export default FeatureCard;
