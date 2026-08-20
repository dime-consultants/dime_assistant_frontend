// AboutPage.jsx - Full Page Version with Consistent Styling
import React from "react";
import "../styles/about.css";

const FEATURES = [
  {
    title: "Task Management",
    desc: "Create, update, and track tasks conversationally. No forms, just intent.",
    color: "rgba(59,210,240,0.1)",
    tc: "#3bd2f0",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="5" width="6" height="6" rx="1" />
        <polyline points="9.5 11 11 12.5 14.5 9" />
        <rect x="3" y="13" width="6" height="6" rx="1" />
        <polyline points="9.5 19 11 20.5 14.5 17" />
        <line x1="17" y1="7" x2="21" y2="7" />
        <line x1="17" y1="15" x2="21" y2="15" />
      </svg>
    ),
  },
  {
    title: "Meeting Scheduling",
    desc: "Natural language scheduling with automatic invites and time zone handling.",
    color: "rgba(34,197,94,0.1)",
    tc: "#22c55e",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    title: "Smart Email",
    desc: "Draft, review, and send emails in your voice with full context awareness.",
    color: "rgba(245,158,11,0.1)",
    tc: "#f59e0b",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <polyline points="2 7 12 13 22 7" />
      </svg>
    ),
  },
  {
    title: "Document Intelligence",
    desc: "Upload PDFs, Excel, Word files. Ask anything and get instant answers.",
    color: "rgba(167,139,250,0.1)",
    tc: "#a78bfa",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
      </svg>
    ),
  },
  {
    title: "Live Integrations",
    desc: "Connect any REST API — LMS, CRM, ERP — and query real data instantly.",
    color: "rgba(59,210,240,0.1)",
    tc: "#3bd2f0",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="9" cy="12" r="3" />
        <circle cx="19" cy="5" r="2" />
        <circle cx="19" cy="19" r="2" />
        <line x1="12" y1="12" x2="17" y2="6" />
        <line x1="12" y1="12" x2="17" y2="18" />
      </svg>
    ),
  },
  {
    title: "Endpoint Registry",
    desc: "Map API endpoints once. Dime discovers and executes the right one automatically.",
    color: "rgba(34,197,94,0.1)",
    tc: "#22c55e",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
];

const TEAM = [
  {
    initials: "JM",
    name: "James Muriuki",
    role: "CEO & Co-founder",
    color: "#3bd2f0",
  },
  {
    initials: "AK",
    name: "Amina Kariuki",
    role: "CTO & Co-founder",
    color: "#22c55e",
  },
  {
    initials: "PO",
    name: "Peter Otieno",
    role: "Head of Product",
    color: "#f59e0b",
  },
  {
    initials: "SK",
    name: "Sarah Kamau",
    role: "Head of Engineering",
    color: "#a78bfa",
  },
];

const TIMELINE = [
  { year: "2022", label: "Founded in Nairobi, Kenya" },
  { year: "2023", label: "First 500 executive users onboarded" },
  { year: "2024", label: "Live integrations launched — 50+ APIs" },
  { year: "2025", label: "Grok-4 model integration & Series A" },
  { year: "2026", label: "12,000+ executives across Africa & beyond" },
];

const TECH_STACK = [
  "Django",
  "React",
  "Grok-4",
  "PostgreSQL",
  "Redis",
  "Celery",
  "REST APIs",
  "OAuth2",
  "WebSockets",
  "Docker",
];

export default function AboutPage({ onBack }) {
  return (
    <div className="about-page-container">
      {/* Header */}
      <div className="about-page-header">
        <div className="header-left">
          <button className="back-button" onClick={onBack}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Chat
          </button>
          <div className="page-title">
            <h1>About Dime Executive</h1>
            <p>Platform information & team</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="about-main-content">
        {/* Hero Section */}
        <div className="about-hero">
          <div className="about-logo">D</div>
          <h1 className="about-hero-title">Dime Executive</h1>
          <div className="about-version">v2.4.1 · Powered by Grok-4</div>
          <p className="about-tagline">
            An AI-powered executive assistant that handles tasks, meetings,
            emails, documents, and live system integrations — so you can focus
            on what matters.
          </p>
        </div>

        {/* Stats Section */}
        <div className="stats-grid">
          {[
            ["12k+", "Executives"],
            ["98%", "Accuracy"],
            ["50+", "Integrations"],
            ["3x", "Faster decisions"],
            ["<2s", "Response time"],
          ].map(([value, label]) => (
            <div key={label} className="stat-card">
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>

        {/* Mission Section */}
        <div className="mission-card">
          <div className="card-header">
            <span className="card-icon">🎯</span>
            <h3>Our mission</h3>
          </div>
          <p className="mission-text">
            Dime was built for one reason: executive time is the most valuable
            resource in any organisation. Every minute spent on admin,
            scheduling, or digging through documents is a minute not spent on
            strategy, leadership, and growth.
            <br />
            <br />
            We built an AI agent that speaks your language, connects to your
            real systems, and executes — not just advises. Whether you're
            checking a live loan balance, scheduling a board meeting, or
            interrogating a 200-page report, Dime gets it done in seconds.
          </p>
        </div>

        {/* Features Section */}
        <div className="features-section">
          <div className="section-header">
            <span className="section-icon">⚡</span>
            <h3>Core capabilities</h3>
          </div>
          <div className="features-grid">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="feature-card">
                <div
                  className="feature-icon"
                  style={{ background: feature.color, color: feature.tc }}
                >
                  {feature.icon}
                </div>
                <div className="feature-title">{feature.title}</div>
                <div className="feature-desc">{feature.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Two Column Layout for Timeline and Team */}
        <div className="two-column-layout">
          {/* Timeline Section */}
          <div className="timeline-card">
            <div className="card-header">
              <span className="card-icon">📅</span>
              <h3>Our journey</h3>
            </div>
            <div className="timeline">
              {TIMELINE.map((item, index) => (
                <div key={item.year} className="timeline-item">
                  <div className="timeline-year">{item.year}</div>
                  <div className="timeline-content">
                    <div className="timeline-dot" />
                    <div className="timeline-label">{item.label}</div>
                  </div>
                  {index < TIMELINE.length - 1 && (
                    <div className="timeline-line" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div className="team-card">
            <div className="card-header">
              <span className="card-icon">👥</span>
              <h3>The team</h3>
            </div>
            <div className="team-grid">
              {TEAM.map((member) => (
                <div key={member.name} className="team-member">
                  <div
                    className="member-avatar"
                    style={{ background: member.color }}
                  >
                    {member.initials}
                  </div>
                  <div>
                    <div className="member-name">{member.name}</div>
                    <div className="member-role">{member.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tech Stack Section */}
        <div className="tech-card">
          <div className="card-header">
            <span className="card-icon">🛠️</span>
            <h3>Technology stack</h3>
          </div>
          <p className="tech-subtitle">
            Built on enterprise-grade, battle-tested infrastructure.
          </p>
          <div className="tech-tags">
            {TECH_STACK.map((tech) => (
              <span key={tech} className="tech-tag">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Footer / Legal */}
        <div className="about-footer">
          <p>
            © 2026 Dime Executive Ltd. All rights reserved. · Nairobi, Kenya
            <br />
            <span className="footer-link">Privacy Policy</span>
            {" · "}
            <span className="footer-link">Terms of Service</span>
            {" · "}
            <span className="footer-link">support@dimeexecutive.ai</span>
          </p>
        </div>
      </div>
    </div>
  );
}
