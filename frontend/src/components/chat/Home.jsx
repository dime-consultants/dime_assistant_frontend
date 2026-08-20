import React, { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import "../styles/home.css";
import Login from "./login";
import DemoModal from "./Demomodal";

/* ════════════════════════════════════════════════════
   HOOKS
════════════════════════════════════════════════════ */
function useScrollReveal(selector, opts = {}) {
  const ref = useRef(null);
  const optsRef = useRef(opts);
  optsRef.current = opts;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll(selector);
    if (!targets.length) return;

    const prefersReducedMotion = () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const o = optsRef.current;
            if (prefersReducedMotion()) {
              gsap.set(targets, { opacity: 1, y: 0, scale: 1 });
            } else {
              gsap.fromTo(
                targets,
                { opacity: 0, y: o.y ?? 30, scale: o.scale ?? 1 },
                {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  duration: o.duration ?? 0.7,
                  ease: o.ease ?? "power2.out",
                  stagger: o.stagger ?? 0.08,
                  clearProps: "transform",
                }
              );
            }
            observer.disconnect();
          }
        });
      },
      { threshold: opts.threshold ?? 0.15, rootMargin: opts.rootMargin ?? "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [selector]);

  return ref;
}

/* ════════════════════════════════════════════════════
   DATA
════════════════════════════════════════════════════ */

const CAPABILITIES = [
  {
    title: "Task Management",
    desc: "Create, update, and track tasks conversationally. No forms, just intent.",
    tags: ["Create", "Update", "Track"],
    icon: (
      <svg viewBox="0 0 24 24">
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
    tags: ["Schedule", "Invites", "Reminders"],
    icon: (
      <svg viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    title: "Smart Email",
    desc: "Draft, review, and send emails that sound exactly like you, with full context.",
    tags: ["Draft", "Send", "Thread"],
    icon: (
      <svg viewBox="0 0 24 24">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <polyline points="2 7 12 13 22 7" />
      </svg>
    ),
  },
  {
    title: "Document Intelligence",
    desc: "Upload PDFs, Excel, and Word files. Ask anything and get instant answers.",
    tags: ["PDF", "Excel", "DOCX"],
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
      </svg>
    ),
  },
  {
    title: "Live Integrations",
    desc: "Connect any API — LMS, CRM, ERP — and query real data with natural language.",
    tags: ["REST", "OAuth2", "Webhooks"],
    icon: (
      <svg viewBox="0 0 24 24">
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
    desc: "Map endpoints once. Dime discovers and executes the right one automatically.",
    tags: ["Discovery", "Execute", "Secure"],
    icon: (
      <svg viewBox="0 0 24 24">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
];

const HOW_STEPS = [
  {
    num: "01",
    title: "You speak naturally",
    body: "Type your request exactly as you'd say it to a human assistant. No commands, no forms.",
  },
  {
    num: "02",
    title: "Dime detects intent",
    body: "The AI parses your request into structured intent — task, meeting, email, document, or API call.",
  },
  {
    num: "03",
    title: "Action is executed",
    body: "Dime executes the action against your live systems — safely, confirmably, with a full audit trail.",
  },
  {
    num: "04",
    title: "You get a clear answer",
    body: "Results are translated back into natural language. No JSON, no dashboards — just the answer.",
  },
];

const INTEGRATIONS = [
  {
    emoji: "🏦",
    name: "Banking APIs",
    type: "REST / OAuth2 -  banks, fintech companies, insurance companies and investment firms",

    bg: "rgba(59,210,240,.1)",
  },
  {
    emoji: "📊",
    name: "ERPs Systems",
    type: "REST / API Key -  Odoo, SAP, Oracle, Microsoft Dynamics, NetSuite",
    bg: "rgba(34,197,94,.1)",
  },
  {
    emoji: "📧",
    name: "Email for calendars",
    type: "SMTP / OAuth2",
    bg: "rgba(245,158,11,.1)",
  },
  // {
  //   emoji: "📅",
  //   name: "Calendars",
  //   type: "CalDAV / REST",
  //   bg: "rgba(168,85,247,.1)",
  // },
  {
    emoji: "📁",
    name: "Document Stores",
    type: "S3 / REST",
    bg: "rgba(239,68,68,.1)",
  },
  {
    emoji: "⚡",
    name: "Custom APIs",
    type: "Any REST endpoint",
    bg: "rgba(59,130,246,.1)",
  },
];

const PLANS = [
  {
    name: "Starter",
    tagline: "For individuals getting started",
    price: "KES 990",
    period: "14 Days Free Trial",
    featured: false,
    features: [
      "100 AI requests / month",
      "Tasks & meetings",
      "Email drafting",
      " Connections",
      "Community support",
    ],
  },
  {
    name: "Executive",
    tagline: "For power users & small teams",
    price: "KES 5,900",
    period: "14 Days Free Trial",
    featured: true,
    features: [
      "Unlimited AI requests",
      "Full document intelligence",
      "Unlimited integrations",
      "Endpoint registry",
      "Priority support",
      "Audit logs & history",
    ],
  },
  {
    name: "Enterprise",
    tagline: "For large organizations",
    price: "Custom",
    period: "14 Days Free Trial",
    featured: false,
    features: [
      "Everything in Executive",
      "SSO / SAML",
      "On-premise deployment",
      "Custom model fine-tuning",
      "Dedicated SLA",
      "White-label options",
    ],
  },
];

/* ════════════════════════════════════════════════════
   NAV
════════════════════════════════════════════════════ */
function Nav({ onLogin, onSignup }) {
  return (
    <nav className="land-nav">
      <a className="land-nav-logo" href="#">
        <div className="land-nav-mark">D</div>
        <div>
          <div className="land-nav-name">Dime Executive</div>
          <div className="land-nav-sub">AI Assistant</div>
        </div>
      </a>

      <div className="land-nav-links">
        {["Capabilities", "How it works", "Integrations", "Pricing"].map(
          (l) => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`}>
              {l}
            </a>
          ),
        )}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          className="land-nav-cta"
          style={{
            background: "transparent",
            border: "1px solid var(--border-hi)",
            color: "var(--text)",
          }}
          onClick={onLogin}
        >
          Log in
        </button>
        <button className="land-nav-cta" onClick={onSignup}>
          Get started free
        </button>
      </div>
    </nav>
  );
}

/* ════════════════════════════════════════════════════
   HERO
════════════════════════════════════════════════════ */
function Hero({ onSignup, onDemo }) {
  return (
    <section className="land-hero">
      <div className="land-hero-badge dime-fade-0">
        <div className="land-hero-badge-dot" />
        Powered by Grok-4 · Enterprise Ready
      </div>
      <div className="grid-face-bg"></div>
      <h1 className="land-hero-title dime-fade-1">
        Your Executive
        <br />
        <span className="land-hero-title-accent">AI Command</span>
        <br />
        Center
      </h1>

      <p className="land-hero-sub dime-fade-2">
        Dime handles your tasks, meetings, emails, documents, and external
        integrations — so you can focus on decisions that matter.
      </p>

      <div className="land-hero-actions dime-fade-3">
        <button className="land-btn-primary" onClick={onSignup}>
          <PlayIcon />
          Start for free
        </button>
        <button className="land-btn-secondary" onClick={onDemo}>
          Watch demo
        </button>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   STATS BAR
════════════════════════════════════════════════════ */
function StatsBar() {
  const [active, setActive] = useState(false);
  const [counts, setCounts] = useState({ a: 0, b: 0, c: 0, d: 0 });
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setActive(true);
          obs.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    const targets = { a: 98, b: 12, c: 3, d: 50 };
    const duration = 1500;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      setCounts({
        a: Math.floor(p * targets.a),
        b: Math.floor(p * targets.b),
        c: Math.floor(p * targets.c),
        d: Math.floor(p * targets.d),
      });
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active]);

  const stats = [
    { val: `${counts.a}%`, label: "Accuracy rate" },
    { val: `${counts.b}k+`, label: "Executives onboarded" },
    { val: `${counts.c}x`, label: "Faster decisions" },
    { val: `${counts.d}+`, label: "Integrations" },
  ];

  return (
    <div className="land-stats" ref={ref}>
      {stats.map((s, i) => (
        <div key={i} className="land-stat">
          <span className="land-stat-num">{s.val}</span>
          <span className="land-stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   CAPABILITIES
════════════════════════════════════════════════════ */
function Capabilities() {
  const sectionRef = useScrollReveal(".land-cap-card", { stagger: 0.06 });

  return (
    <section id="capabilities" className="land-section" ref={sectionRef}>
      <div className="land-section-tag">Capabilities</div>
      <h2 className="land-section-title">
        Everything you need,
        <br />
        nothing you don't
      </h2>
      <p className="land-section-sub">
        Seven core action types, one intelligent interface. Dime understands
        intent and executes.
      </p>

      <div className="land-cap-grid">
        {CAPABILITIES.map((cap) => (
          <div key={cap.title} className="land-cap-card">
            <div className="land-cap-icon">{cap.icon}</div>
            <div className="land-cap-title">{cap.title}</div>
            <div className="land-cap-desc">{cap.desc}</div>
            <div className="land-cap-tags">
              {cap.tags.map((t) => (
                <span key={t} className="land-cap-tag">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   HOW IT WORKS
════════════════════════════════════════════════════ */
const HOW_VISUALS = [
  <div className="land-vc-wrap" key={0}>
    <div className="land-vc-msg user">
      <div className="land-vc-av usr">EX</div>
      <div className="land-vc-bubble">
        Schedule board meeting Friday 2PM with finance team
      </div>
    </div>
  </div>,
  <div className="land-vc-wrap" key={1}>
    <div className="land-vc-msg ai">
      <div className="land-vc-av ai">D</div>
      <div className="land-vc-bubble">
        Detected:{" "}
        <strong style={{ color: "var(--brand)" }}>schedule_meeting</strong> · 6
        participants · Friday Apr 11 · 14:00 EAT
      </div>
    </div>
  </div>,
  <div className="land-vc-wrap" key={2}>
    <div className="land-vc-action">
      ⚡ execute: schedule_meeting → saved · invites dispatched ✓
    </div>
  </div>,
  <div className="land-vc-wrap" key={3}>
    <div className="land-vc-msg ai">
      <div className="land-vc-av ai">D</div>
      <div className="land-vc-bubble">
        <strong>Done!</strong> "Board Meeting · Finance" on the calendar for
        Friday Apr 11 at 14:00. All 6 notified.
      </div>
    </div>
  </div>,
];

function HowItWorks() {
  const [active, setActive] = useState(0);
  return (
    <section id="how-it-works" className="land-section land-section-alt">
      <div className="land-section-tag">How it works</div>
      <h2 className="land-section-title">
        Intent to action
        <br />
        in seconds
      </h2>

      <div className="land-how-grid">
        <div className="land-how-steps">
          {HOW_STEPS.map((s, i) => (
            <div
              key={i}
              className={`land-how-step${active === i ? " active" : ""}`}
              onClick={() => setActive(i)}
            >
              <div className="land-step-num">{s.num}</div>
              <div>
                <div className="land-step-title">{s.title}</div>
                <div className="land-step-body">{s.body}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="land-how-visual">{HOW_VISUALS[active]}</div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   INTEGRATIONS
════════════════════════════════════════════════════ */
function Integrations() {
  return (
    <section id="integrations" className="land-section">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 24,
        }}
      >
        <div>
          <div className="land-section-tag">Integrations</div>
          <h2 className="land-section-title">
            Connects to your
            <br />
            entire stack
          </h2>
        </div>
        <p className="land-section-sub" style={{ maxWidth: 360 }}>
          OAuth2, API key, bearer token — Dime supports any auth pattern your
          systems use.
        </p>
      </div>

      <div className="land-int-grid">
        {INTEGRATIONS.map(({ emoji, name, type, bg }) => (
          <div key={name} className="land-int-card">
            <div className="land-int-logo" style={{ background: bg }}>
              {emoji}
            </div>
            <div className="land-int-name">{name}</div>
            <div className="land-int-type">{type}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   PRICING
════════════════════════════════════════════════════ */
function Pricing({ onSignup }) {
  const sectionRef = useScrollReveal(".land-price-card", { stagger: 0.1, y: 40 });

  return (
    <section id="pricing" className="land-section land-section-alt" ref={sectionRef}>
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <div className="land-section-tag" style={{ justifyContent: "center" }}>
          Pricing
        </div>
        <h2 className="land-section-title">Simple, transparent pricing</h2>
        <p className="land-section-sub" style={{ margin: "0 auto" }}>
          No seats, no per-message charges. Flat plans that scale with your
          team.
        </p>
      </div>

      <div className="land-pricing-grid">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className={`land-price-card${p.featured ? " featured" : ""}`}
          >
            {p.featured && <div className="land-price-badge">Most Popular</div>}
            <div className="land-price-name">{p.name}</div>
            <div className="land-price-tagline">{p.tagline}</div>
            <div className="land-price-amount">
              {p.price}
              <span>{p.price !== "Custom" ? "/mo" : ""}</span>
            </div>
            <div className="land-price-period">{p.period}</div>
            <div className="land-price-divider" />
            <ul className="land-price-features">
              {p.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <button
              className={`land-price-btn ${p.featured ? "solid" : "outline"}`}
              onClick={p.price !== "Custom" ? onSignup : undefined}
            >
              {p.price === "Custom"
                ? "Contact sales"
                : p.featured
                  ? "Start free trial"
                  : "Get started free"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════
   CTA + FOOTER
════════════════════════════════════════════════════ */
function CtaAndFooter({ onSignup }) {
  return (
    <>
      <section className="land-cta-section">
        <div className="land-cta-card">
          <h2 className="land-cta-title">
            Ready to reclaim
            <br />
            your executive time?
          </h2>
          <p className="land-cta-sub">
            Join 12,000+ executives who've automated the busywork.
          </p>
          <div className="land-cta-actions">
            <button className="land-btn-primary" onClick={onSignup}>
              Start for free — no card required
            </button>
            <button className="land-btn-secondary">Talk to sales</button>
          </div>
        </div>
      </section>

      <footer className="land-footer">
        <div className="land-footer-brand">
          <div className="land-footer-mark">D</div>
          <span className="land-footer-copy">
            © 2026 Dime Executive. All rights reserved.
          </span>
        </div>
        <div className="land-footer-links">
          {["Privacy", "Terms", "Docs", "Status"].map((l) => (
            <a key={l} href="#">
              {l}
            </a>
          ))}
        </div>
      </footer>
    </>
  );
}

/* ── Icon ── */
function PlayIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

/* ════════════════════════════════════════════════════
   ROOT EXPORT
════════════════════════════════════════════════════ */
export default function DimeLanding({ onSignup, onLoginSuccess }) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <>
      <div className="land-root">
        <div className="land-grid-bg" />
        <div className="land-orb land-orb-1" />
        <div className="land-orb land-orb-2" />
        <div className="land-orb land-orb-3" />

        <div className="land-scroll">
          <Nav onLogin={() => setLoginOpen(true)} onSignup={onSignup} />
          <Hero onSignup={onSignup} onDemo={() => setDemoOpen(true)} />
          <StatsBar />
          <Capabilities />
          <HowItWorks />
          <Integrations />
          <Pricing onSignup={onSignup} />
          <CtaAndFooter onSignup={onSignup} />
        </div>
      </div>

      <Login
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSignup={() => {
          setLoginOpen(false);
          onSignup?.();
        }}
        onSuccess={(user) => {
          setLoginOpen(false);
          onLoginSuccess?.(user);
        }}
      />

      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </>
  );
}
