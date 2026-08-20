
import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { gsap } from "gsap";
import "../styles/demo.css";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/* ════════════════════════════════════════════════════
   DEMO SCENES
   Each scene shows a UI mockup + animated cursor pointing
   at the relevant feature with a callout label
════════════════════════════════════════════════════ */
const SCENES = [
  {
    id: "tasks",
    service: "Task Management",
    tag: "01",
    title: "Create tasks by just talking",
    desc: 'Type "Remind me to call the board on Friday at 3PM" and Dime creates, assigns, and schedules it instantly — no forms.',
    accent: "#3bd2f0",
    duration: 5000,
    render: (cursorPos) => <TaskScene cursorPos={cursorPos} />,
    cursorPath: [
      { x: 52, y: 62, label: "Type your request here", delay: 0 },
      { x: 52, y: 62, label: "Dime detects the intent…", delay: 1400 },
      { x: 72, y: 38, label: "Task created instantly", delay: 2600 },
      { x: 72, y: 50, label: "Due date auto-set", delay: 3600 },
    ],
  },
  {
    id: "meetings",
    service: "Meeting Scheduling",
    tag: "02",
    title: "Schedule meetings in plain English",
    desc: '"Set up a board meeting next Tuesday at 2PM with the finance team" — Dime blocks the calendar and sends all invites.',
    accent: "#22c55e",
    duration: 5000,
    render: (cursorPos) => <MeetingScene cursorPos={cursorPos} />,
    cursorPath: [
      { x: 52, y: 62, label: "Natural language input", delay: 0 },
      { x: 52, y: 62, label: "Parsing 6 participants…", delay: 1200 },
      { x: 68, y: 30, label: "Calendar blocked", delay: 2400 },
      { x: 68, y: 48, label: "Invites dispatched", delay: 3500 },
    ],
  },
  {
    id: "email",
    service: "Smart Email",
    tag: "03",
    title: "Draft and send emails instantly",
    desc: '"Send a follow-up to the Nairobi partners about the Q3 report" — Dime drafts it in your voice, you approve and send.',
    accent: "#f59e0b",
    duration: 5000,
    render: (cursorPos) => <EmailScene cursorPos={cursorPos} />,
    cursorPath: [
      { x: 52, y: 62, label: "Describe what to send", delay: 0 },
      { x: 52, y: 62, label: "Drafting in your voice…", delay: 1300 },
      { x: 68, y: 32, label: "Email ready to send", delay: 2500 },
      { x: 75, y: 55, label: "One-click send", delay: 3600 },
    ],
  },
  {
    id: "documents",
    service: "Document Intelligence",
    tag: "04",
    title: "Ask questions about any document",
    desc: 'Upload a PDF or Excel file and ask "What was our Q3 revenue?" — Dime reads it and answers in seconds.',
    accent: "#a78bfa",
    duration: 5000,
    render: (cursorPos) => <DocumentScene cursorPos={cursorPos} />,
    cursorPath: [
      { x: 30, y: 45, label: "Upload any document", delay: 0 },
      { x: 52, y: 62, label: "Ask a question about it", delay: 1400 },
      { x: 52, y: 62, label: "Reading the document…", delay: 2400 },
      { x: 68, y: 38, label: "Instant answer extracted", delay: 3500 },
    ],
  },
  {
    id: "integrations",
    service: "Live Integrations",
    tag: "05",
    title: "Query any connected system",
    desc: '"Check the loan balance for +254791305299" — Dime calls your LMS API and returns a clean answer in seconds.',
    accent: "#3bd2f0",
    duration: 5000,
    render: (cursorPos) => <IntegrationScene cursorPos={cursorPos} />,
    cursorPath: [
      { x: 52, y: 62, label: "Ask about live data", delay: 0 },
      { x: 52, y: 62, label: "Calling your API…", delay: 1200 },
      { x: 30, y: 35, label: "HTTP 200 — data received", delay: 2400 },
      { x: 68, y: 38, label: "Clean answer returned", delay: 3500 },
    ],
  },
];

/* ════════════════════════════════════════════════════
   SCENE MOCKUPS
════════════════════════════════════════════════════ */
function MockupShell({ children }) {
  return (
    <div className="demo-mockup-shell">
      <div className="demo-mockup-bar">
        <span className="demo-dot" style={{ background: "#f85149" }} />
        <span className="demo-dot" style={{ background: "#e3b341" }} />
        <span className="demo-dot" style={{ background: "#3fb950" }} />
        <span className="demo-mockup-title">DIME</span>
      </div>
      <div className="demo-mockup-body">{children}</div>
    </div>
  );
}

function ChatInput({ text, typing }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    if (!typing) {
      setShown(text);
      return;
    }
    setShown("");
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(iv);
    }, 38);
    return () => clearInterval(iv);
  }, [text, typing]);

  return (
    <div className="demo-chat-input-row">
      <div className="demo-chat-input">
        <span className="demo-chat-input-text">{shown}</span>
        {typing && shown.length < text.length && (
          <span className="demo-cursor-blink" />
        )}
      </div>
      <div className="demo-send-btn">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0d1117"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </div>
    </div>
  );
}

function AiBubble({ text, visible, delay = 0 }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setShow(true), delay);
      return () => clearTimeout(t);
    }
    setShow(false);
  }, [visible, delay]);
  return show ? (
    <div className="demo-ai-bubble" style={{ animationDelay: `${delay}ms` }}>
      <div className="demo-ai-av">D</div>
      <div className="demo-ai-text">{text}</div>
    </div>
  ) : null;
}

function TaskScene({ cursorPos }) {
  return (
    <MockupShell>
      <div className="demo-split">
        <div className="demo-split-chat">
          <div className="demo-user-bubble">
            Remind me to review the Horizon contract on Friday at 3PM
          </div>
          <AiBubble
            visible
            text="Creating task: Review Horizon Contract — due Friday 3:00 PM."
            delay={200}
          />
          <ChatInput
            text="Create a task for Q4 budget review next Monday"
            typing
          />
        </div>
        <div className="demo-split-panel">
          <div className="demo-panel-title">Tasks</div>
          <div className="demo-task-item demo-task-done">
            <div className="demo-task-check done" />
            <div>
              <div className="demo-task-name">Board presentation prep</div>
              <div className="demo-task-meta">Completed · Yesterday</div>
            </div>
          </div>
          <div className="demo-task-item demo-task-active">
            <div className="demo-task-check" />
            <div>
              <div className="demo-task-name demo-task-highlight">
                Review Horizon Contract
              </div>
              <div className="demo-task-meta" style={{ color: "#3bd2f0" }}>
                Friday · 3:00 PM ← just added
              </div>
            </div>
          </div>
          <div className="demo-task-item">
            <div className="demo-task-check" />
            <div>
              <div className="demo-task-name">Q4 budget review</div>
              <div className="demo-task-meta">Monday · Pending</div>
            </div>
          </div>
        </div>
      </div>
    </MockupShell>
  );
}

function MeetingScene({ cursorPos }) {
  return (
    <MockupShell>
      <div className="demo-split">
        <div className="demo-split-chat">
          <div className="demo-user-bubble">
            Set up a board meeting next Tuesday at 2PM with the finance team
          </div>
          <AiBubble
            visible
            text="Scheduling: Board Meeting · Finance — Tuesday Apr 15 at 14:00 EAT. Inviting 6 participants."
            delay={200}
          />
          <ChatInput text="Any conflicts on Tuesday afternoon?" typing />
        </div>
        <div className="demo-split-panel">
          <div className="demo-panel-title">Calendar · April</div>
          <div className="demo-cal-row">
            {["Mon 14", "Tue 15", "Wed 16", "Thu 17"].map((d, i) => (
              <div
                key={d}
                className={`demo-cal-cell${i === 1 ? " demo-cal-active" : ""}`}
              >
                <div className="demo-cal-day">{d}</div>
                {i === 1 && (
                  <div className="demo-cal-event">
                    Board Mtg
                    <br />
                    14:00 EAT
                  </div>
                )}
                {i === 0 && (
                  <div className="demo-cal-event demo-cal-faded">
                    1:1 CEO
                    <br />
                    10:00
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="demo-invite-row">
            <div className="demo-invite-label">Invites sent</div>
            <div className="demo-invite-chips">
              {["JM", "AK", "PO", "SK", "+2"].map((i) => (
                <div key={i} className="demo-invite-av">
                  {i}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MockupShell>
  );
}

function EmailScene({ cursorPos }) {
  return (
    <MockupShell>
      <div className="demo-split">
        <div className="demo-split-chat">
          <div className="demo-user-bubble">
            Send a follow-up to the Nairobi partners about the Q3 report
          </div>
          <AiBubble
            visible
            text="Draft ready. Subject: Q3 Report Follow-Up — Nairobi Partners. Shall I send it?"
            delay={200}
          />
          <ChatInput text="Yes, send it" typing />
        </div>
        <div className="demo-split-panel">
          <div className="demo-panel-title">Email draft</div>
          <div className="demo-email-card">
            <div className="demo-email-row">
              <span className="demo-email-lbl">To</span>
              <span className="demo-email-val">
                nairobi-partners@horizonlms.co.ke
              </span>
            </div>
            <div className="demo-email-row">
              <span className="demo-email-lbl">Subject</span>
              <span className="demo-email-val" style={{ color: "#e2eaf3" }}>
                Q3 Report Follow-Up — Nairobi Partners
              </span>
            </div>
            <div className="demo-email-body">
              Dear team,
              <br />
              <br />
              Following our recent discussion, I'm sharing the Q3 performance
              report for your review. Key highlights include a 14% revenue
              increase and successful rollout of…
            </div>
            <div className="demo-email-actions">
              <div className="demo-email-btn demo-email-send">Send now</div>
              <div className="demo-email-btn">Edit</div>
            </div>
          </div>
        </div>
      </div>
    </MockupShell>
  );
}

function DocumentScene({ cursorPos }) {
  return (
    <MockupShell>
      <div className="demo-split">
        <div className="demo-split-chat">
          <div className="demo-user-bubble">
            What was our total Q3 revenue according to the uploaded report?
          </div>
          <AiBubble
            visible
            text="According to Q3_Financial_Report.xlsx: Total revenue was KES 4,820,000 — up 14% vs Q2. Top contributor: Loan disbursements (62%)."
            delay={200}
          />
          <ChatInput text="Which region performed best?" typing />
        </div>
        <div className="demo-split-panel">
          <div className="demo-panel-title">Documents</div>
          <div className="demo-doc-card demo-doc-active">
            <div
              className="demo-doc-icon"
              style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}
            >
              XLS
            </div>
            <div>
              <div className="demo-doc-name">Q3_Financial_Report.xlsx</div>
              <div className="demo-doc-meta">
                3 sheets · 847 rows · Reading…
              </div>
            </div>
          </div>
          <div className="demo-doc-card">
            <div
              className="demo-doc-icon"
              style={{ background: "rgba(248,81,73,0.15)", color: "#f85149" }}
            >
              PDF
            </div>
            <div>
              <div className="demo-doc-name">Board_Presentation_Oct.pdf</div>
              <div className="demo-doc-meta">12 pages · Uploaded yesterday</div>
            </div>
          </div>
          <div className="demo-doc-answer">
            <div className="demo-doc-answer-label">Extracted answer</div>
            <div className="demo-doc-answer-val">
              KES 4,820,000{" "}
              <span style={{ color: "#22c55e", fontSize: 11 }}>▲14%</span>
            </div>
          </div>
        </div>
      </div>
    </MockupShell>
  );
}

function IntegrationScene({ cursorPos }) {
  return (
    <MockupShell>
      <div className="demo-split">
        <div className="demo-split-chat">
          <div className="demo-user-bubble">
            Check the current loan balance for +254791305299
          </div>
          <AiBubble
            visible
            text="John Kamau has KES 42,500 outstanding across 2 active loans. Next payment: May 15 (KES 8,500)."
            delay={200}
          />
          <ChatInput text="What's his repayment history?" typing />
        </div>
        <div className="demo-split-panel">
          <div className="demo-panel-title">Connections</div>
          <div className="demo-conn-card demo-conn-active">
            <div className="demo-conn-dot" style={{ background: "#22c55e" }} />
            <div>
              <div className="demo-conn-name">Loan Management System</div>
              <div className="demo-conn-meta">
                REST · OAuth2 · <span style={{ color: "#22c55e" }}>Live</span>
              </div>
            </div>
          </div>
          <div className="demo-api-log">
            <div className="demo-api-line">
              <span className="demo-api-method">GET</span>{" "}
              /api/partner/customer-loans/
            </div>
            <div className="demo-api-line">
              <span className="demo-api-param">phone</span> +254791305299
            </div>
            <div className="demo-api-line demo-api-ok">
              <span className="demo-api-status">200 OK</span> · 2 records ·
              124ms
            </div>
          </div>
        </div>
      </div>
    </MockupShell>
  );
}

/* ════════════════════════════════════════════════════
   ANIMATED CURSOR
════════════════════════════════════════════════════ */
function DemoCursor({ x, y, label, visible }) {
  return (
    <div
      className={`demo-cursor-wrap${visible ? " demo-cursor-visible" : ""}`}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <svg
        className="demo-cursor-svg"
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
      >
        <path
          d="M4 2L18 11L11 13L8 20L4 2Z"
          fill="#3bd2f0"
          stroke="#0d1117"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      {label && <div className="demo-cursor-label">{label}</div>}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   DEMO MODAL
   Props:
     open    — boolean
     onClose — dismiss
════════════════════════════════════════════════════ */
export default function DemoModal({ open, onClose }) {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [cursor, setCursor] = useState({
    x: 50,
    y: 50,
    label: "",
    visible: false,
  });
  const [playing, setPlaying] = useState(true);
  const timerRef = useRef(null);
  const pathTimers = useRef([]);

  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const infoRef = useRef(null);
  const mockupRef = useRef(null);

  // Keep mounted a beat longer than `open` so the exit animation
  // has something to animate before it disappears.
  const [mounted, setMounted] = useState(open);

  const scene = SCENES[sceneIdx];

  /* Run cursor path for current scene */
  const runCursorPath = useCallback((path) => {
    pathTimers.current.forEach(clearTimeout);
    pathTimers.current = [];
    setCursor({
      x: path[0].x,
      y: path[0].y,
      label: path[0].label,
      visible: true,
    });
    path.forEach((pt, i) => {
      if (i === 0) return;
      const t = setTimeout(() => {
        setCursor({ x: pt.x, y: pt.y, label: pt.label, visible: true });
      }, pt.delay);
      pathTimers.current.push(t);
    });
  }, []);

  /* Auto-advance scenes */
  useEffect(() => {
    if (!open || !playing) return;
    runCursorPath(scene.cursorPath);
    timerRef.current = setTimeout(() => {
      setSceneIdx((i) => (i + 1) % SCENES.length);
    }, scene.duration);
    return () => {
      clearTimeout(timerRef.current);
      pathTimers.current.forEach(clearTimeout);
    };
  }, [open, sceneIdx, playing, scene, runCursorPath]);

  /* Reset on open */
  useEffect(() => {
    if (open) {
      setSceneIdx(0);
      setPlaying(true);
    } else {
      setCursor((c) => ({ ...c, visible: false }));
    }
  }, [open]);

  /* Escape key */
  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  /* Body scroll lock */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /* Mount / animate in / animate out */
  useEffect(() => {
    if (open) {
      setMounted(true);
    } else if (mounted) {
      if (prefersReducedMotion() || !overlayRef.current || !modalRef.current) {
        setMounted(false);
        return;
      }
      const tl = gsap.timeline({ onComplete: () => setMounted(false) });
      tl.to(modalRef.current, {
        opacity: 0,
        y: 14,
        scale: 0.97,
        duration: 0.22,
        ease: "power2.in",
      }).to(overlayRef.current, { opacity: 0, duration: 0.18, ease: "power1.in" }, "<");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* Entrance is already handled by CSS
     (.demo-overlay { animation: demoOverlayIn } / .demo-modal { animation: demoModalIn }) —
     no JS entrance animation needed here. */

  /* Crossfade the info panel + mockup whenever the scene changes */
  useLayoutEffect(() => {
    if (!open || prefersReducedMotion()) return;
    if (!infoRef.current || !mockupRef.current) return;
    gsap.fromTo(
      infoRef.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
    );
    gsap.fromTo(
      mockupRef.current,
      { opacity: 0, scale: 0.985 },
      { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out" }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneIdx, open]);

  if (!mounted) return null;

  const goTo = (i) => {
    setSceneIdx(i);
    setPlaying(false);
    runCursorPath(SCENES[i].cursorPath);
    clearTimeout(timerRef.current);
  };

  const prev = () => goTo((sceneIdx - 1 + SCENES.length) % SCENES.length);
  const next = () => goTo((sceneIdx + 1) % SCENES.length);
  const togglePlay = () => {
    setPlaying((p) => !p);
  };

  return (
    <div
      className="demo-overlay"
      ref={overlayRef}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="demo-modal" ref={modalRef}>
        {/* ── Header ── */}
        <div className="demo-header">
          <div className="demo-header-left">
            <div className="demo-logo-mark">D</div>
            <div>
              <div className="demo-logo-name">Dime Executive</div>
              <div className="demo-logo-sub">Product walkthrough</div>
            </div>
          </div>
          <button
            className="demo-close"
            onClick={onClose}
            aria-label="Close demo"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Scene tabs ── */}
        <div className="demo-tabs">
          {SCENES.map((s, i) => (
            <button
              key={s.id}
              className={`demo-tab${i === sceneIdx ? " active" : ""}`}
              onClick={() => goTo(i)}
              style={{ "--tab-accent": s.accent }}
            >
              <span className="demo-tab-tag">{s.tag}</span>
              <span className="demo-tab-label">{s.service}</span>
            </button>
          ))}
        </div>

        {/* ── Scene content ── */}
        <div className="demo-scene">
          {/* Info panel */}
          <div className="demo-scene-info" ref={infoRef}>
            <div
              className="demo-scene-tag"
              style={{ color: scene.accent, borderColor: scene.accent }}
            >
              {scene.service}
            </div>
            <h2 className="demo-scene-title">{scene.title}</h2>
            <p className="demo-scene-desc">{scene.desc}</p>

            {/* Progress dots */}
            <div className="demo-progress">
              {SCENES.map((s, i) => (
                <button
                  key={s.id}
                  className={`demo-progress-dot${i === sceneIdx ? " active" : ""}`}
                  style={{ "--dot-accent": s.accent }}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="demo-controls">
              <button className="demo-ctrl-btn" onClick={prev} title="Previous">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                className="demo-ctrl-btn demo-ctrl-play"
                onClick={togglePlay}
                title={playing ? "Pause" : "Play"}
              >
                {playing ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <line x1="6" y1="4" x2="6" y2="20" />
                    <line x1="18" y1="4" x2="18" y2="20" />
                  </svg>
                ) : (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
              </button>
              <button className="demo-ctrl-btn" onClick={next} title="Next">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mockup area with cursor */}
          <div className="demo-scene-mockup">
            <div className="demo-mockup-wrap" ref={mockupRef}>
              {scene.render(cursor)}
              <DemoCursor
                x={cursor.x}
                y={cursor.y}
                label={cursor.label}
                visible={cursor.visible}
              />
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="demo-footer">
          <span className="demo-footer-text">
            Scene {sceneIdx + 1} of {SCENES.length} ·{" "}
            {playing ? "Auto-advancing" : "Paused"}
          </span>
          {/* Scene progress bar */}
          <div className="demo-progress-bar-wrap">
            <div
              className="demo-progress-bar-fill"
              key={`${sceneIdx}-${playing}`}
              style={{
                animationDuration: `${scene.duration}ms`,
                animationPlayState: playing ? "running" : "paused",
                background: scene.accent,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// import { useState, useEffect, useRef, useCallback } from "react";
// import "../styles/demo.css";

// /* ════════════════════════════════════════════════════
//    DEMO SCENES
//    Each scene shows a UI mockup + animated cursor pointing
//    at the relevant feature with a callout label
// ════════════════════════════════════════════════════ */
// const SCENES = [
//   {
//     id: "tasks",
//     service: "Task Management",
//     tag: "01",
//     title: "Create tasks by just talking",
//     desc: 'Type "Remind me to call the board on Friday at 3PM" and Dime creates, assigns, and schedules it instantly — no forms.',
//     accent: "#3bd2f0",
//     duration: 5000,
//     render: (cursorPos) => <TaskScene cursorPos={cursorPos} />,
//     cursorPath: [
//       { x: 52, y: 62, label: "Type your request here", delay: 0 },
//       { x: 52, y: 62, label: "Dime detects the intent…", delay: 1400 },
//       { x: 72, y: 38, label: "Task created instantly", delay: 2600 },
//       { x: 72, y: 50, label: "Due date auto-set", delay: 3600 },
//     ],
//   },
//   {
//     id: "meetings",
//     service: "Meeting Scheduling",
//     tag: "02",
//     title: "Schedule meetings in plain English",
//     desc: '"Set up a board meeting next Tuesday at 2PM with the finance team" — Dime blocks the calendar and sends all invites.',
//     accent: "#22c55e",
//     duration: 5000,
//     render: (cursorPos) => <MeetingScene cursorPos={cursorPos} />,
//     cursorPath: [
//       { x: 52, y: 62, label: "Natural language input", delay: 0 },
//       { x: 52, y: 62, label: "Parsing 6 participants…", delay: 1200 },
//       { x: 68, y: 30, label: "Calendar blocked", delay: 2400 },
//       { x: 68, y: 48, label: "Invites dispatched", delay: 3500 },
//     ],
//   },
//   {
//     id: "email",
//     service: "Smart Email",
//     tag: "03",
//     title: "Draft and send emails instantly",
//     desc: '"Send a follow-up to the Nairobi partners about the Q3 report" — Dime drafts it in your voice, you approve and send.',
//     accent: "#f59e0b",
//     duration: 5000,
//     render: (cursorPos) => <EmailScene cursorPos={cursorPos} />,
//     cursorPath: [
//       { x: 52, y: 62, label: "Describe what to send", delay: 0 },
//       { x: 52, y: 62, label: "Drafting in your voice…", delay: 1300 },
//       { x: 68, y: 32, label: "Email ready to send", delay: 2500 },
//       { x: 75, y: 55, label: "One-click send", delay: 3600 },
//     ],
//   },
//   {
//     id: "documents",
//     service: "Document Intelligence",
//     tag: "04",
//     title: "Ask questions about any document",
//     desc: 'Upload a PDF or Excel file and ask "What was our Q3 revenue?" — Dime reads it and answers in seconds.',
//     accent: "#a78bfa",
//     duration: 5000,
//     render: (cursorPos) => <DocumentScene cursorPos={cursorPos} />,
//     cursorPath: [
//       { x: 30, y: 45, label: "Upload any document", delay: 0 },
//       { x: 52, y: 62, label: "Ask a question about it", delay: 1400 },
//       { x: 52, y: 62, label: "Reading the document…", delay: 2400 },
//       { x: 68, y: 38, label: "Instant answer extracted", delay: 3500 },
//     ],
//   },
//   {
//     id: "integrations",
//     service: "Live Integrations",
//     tag: "05",
//     title: "Query any connected system",
//     desc: '"Check the loan balance for +254791305299" — Dime calls your LMS API and returns a clean answer in seconds.',
//     accent: "#3bd2f0",
//     duration: 5000,
//     render: (cursorPos) => <IntegrationScene cursorPos={cursorPos} />,
//     cursorPath: [
//       { x: 52, y: 62, label: "Ask about live data", delay: 0 },
//       { x: 52, y: 62, label: "Calling your API…", delay: 1200 },
//       { x: 30, y: 35, label: "HTTP 200 — data received", delay: 2400 },
//       { x: 68, y: 38, label: "Clean answer returned", delay: 3500 },
//     ],
//   },
// ];

// /* ════════════════════════════════════════════════════
//    SCENE MOCKUPS
// ════════════════════════════════════════════════════ */
// function MockupShell({ children }) {
//   return (
//     <div className="demo-mockup-shell">
//       <div className="demo-mockup-bar">
//         <span className="demo-dot" style={{ background: "#f85149" }} />
//         <span className="demo-dot" style={{ background: "#e3b341" }} />
//         <span className="demo-dot" style={{ background: "#3fb950" }} />
//         <span className="demo-mockup-title">DIME</span>
//       </div>
//       <div className="demo-mockup-body">{children}</div>
//     </div>
//   );
// }

// function ChatInput({ text, typing }) {
//   const [shown, setShown] = useState("");
//   useEffect(() => {
//     if (!typing) {
//       setShown(text);
//       return;
//     }
//     setShown("");
//     let i = 0;
//     const iv = setInterval(() => {
//       i++;
//       setShown(text.slice(0, i));
//       if (i >= text.length) clearInterval(iv);
//     }, 38);
//     return () => clearInterval(iv);
//   }, [text, typing]);

//   return (
//     <div className="demo-chat-input-row">
//       <div className="demo-chat-input">
//         <span className="demo-chat-input-text">{shown}</span>
//         {typing && shown.length < text.length && (
//           <span className="demo-cursor-blink" />
//         )}
//       </div>
//       <div className="demo-send-btn">
//         <svg
//           width="14"
//           height="14"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="#0d1117"
//           strokeWidth="2.5"
//           strokeLinecap="round"
//         >
//           <line x1="22" y1="2" x2="11" y2="13" />
//           <polygon points="22 2 15 22 11 13 2 9 22 2" />
//         </svg>
//       </div>
//     </div>
//   );
// }

// function AiBubble({ text, visible, delay = 0 }) {
//   const [show, setShow] = useState(false);
//   useEffect(() => {
//     if (visible) {
//       const t = setTimeout(() => setShow(true), delay);
//       return () => clearTimeout(t);
//     }
//     setShow(false);
//   }, [visible, delay]);
//   return show ? (
//     <div className="demo-ai-bubble" style={{ animationDelay: `${delay}ms` }}>
//       <div className="demo-ai-av">D</div>
//       <div className="demo-ai-text">{text}</div>
//     </div>
//   ) : null;
// }

// function TaskScene({ cursorPos }) {
//   return (
//     <MockupShell>
//       <div className="demo-split">
//         <div className="demo-split-chat">
//           <div className="demo-user-bubble">
//             Remind me to review the Horizon contract on Friday at 3PM
//           </div>
//           <AiBubble
//             visible
//             text="Creating task: Review Horizon Contract — due Friday 3:00 PM."
//             delay={200}
//           />
//           <ChatInput
//             text="Create a task for Q4 budget review next Monday"
//             typing
//           />
//         </div>
//         <div className="demo-split-panel">
//           <div className="demo-panel-title">Tasks</div>
//           <div className="demo-task-item demo-task-done">
//             <div className="demo-task-check done" />
//             <div>
//               <div className="demo-task-name">Board presentation prep</div>
//               <div className="demo-task-meta">Completed · Yesterday</div>
//             </div>
//           </div>
//           <div className="demo-task-item demo-task-active">
//             <div className="demo-task-check" />
//             <div>
//               <div className="demo-task-name demo-task-highlight">
//                 Review Horizon Contract
//               </div>
//               <div className="demo-task-meta" style={{ color: "#3bd2f0" }}>
//                 Friday · 3:00 PM ← just added
//               </div>
//             </div>
//           </div>
//           <div className="demo-task-item">
//             <div className="demo-task-check" />
//             <div>
//               <div className="demo-task-name">Q4 budget review</div>
//               <div className="demo-task-meta">Monday · Pending</div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </MockupShell>
//   );
// }

// function MeetingScene({ cursorPos }) {
//   return (
//     <MockupShell>
//       <div className="demo-split">
//         <div className="demo-split-chat">
//           <div className="demo-user-bubble">
//             Set up a board meeting next Tuesday at 2PM with the finance team
//           </div>
//           <AiBubble
//             visible
//             text="Scheduling: Board Meeting · Finance — Tuesday Apr 15 at 14:00 EAT. Inviting 6 participants."
//             delay={200}
//           />
//           <ChatInput text="Any conflicts on Tuesday afternoon?" typing />
//         </div>
//         <div className="demo-split-panel">
//           <div className="demo-panel-title">Calendar · April</div>
//           <div className="demo-cal-row">
//             {["Mon 14", "Tue 15", "Wed 16", "Thu 17"].map((d, i) => (
//               <div
//                 key={d}
//                 className={`demo-cal-cell${i === 1 ? " demo-cal-active" : ""}`}
//               >
//                 <div className="demo-cal-day">{d}</div>
//                 {i === 1 && (
//                   <div className="demo-cal-event">
//                     Board Mtg
//                     <br />
//                     14:00 EAT
//                   </div>
//                 )}
//                 {i === 0 && (
//                   <div className="demo-cal-event demo-cal-faded">
//                     1:1 CEO
//                     <br />
//                     10:00
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//           <div className="demo-invite-row">
//             <div className="demo-invite-label">Invites sent</div>
//             <div className="demo-invite-chips">
//               {["JM", "AK", "PO", "SK", "+2"].map((i) => (
//                 <div key={i} className="demo-invite-av">
//                   {i}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </MockupShell>
//   );
// }

// function EmailScene({ cursorPos }) {
//   return (
//     <MockupShell>
//       <div className="demo-split">
//         <div className="demo-split-chat">
//           <div className="demo-user-bubble">
//             Send a follow-up to the Nairobi partners about the Q3 report
//           </div>
//           <AiBubble
//             visible
//             text="Draft ready. Subject: Q3 Report Follow-Up — Nairobi Partners. Shall I send it?"
//             delay={200}
//           />
//           <ChatInput text="Yes, send it" typing />
//         </div>
//         <div className="demo-split-panel">
//           <div className="demo-panel-title">Email draft</div>
//           <div className="demo-email-card">
//             <div className="demo-email-row">
//               <span className="demo-email-lbl">To</span>
//               <span className="demo-email-val">
//                 nairobi-partners@horizonlms.co.ke
//               </span>
//             </div>
//             <div className="demo-email-row">
//               <span className="demo-email-lbl">Subject</span>
//               <span className="demo-email-val" style={{ color: "#e2eaf3" }}>
//                 Q3 Report Follow-Up — Nairobi Partners
//               </span>
//             </div>
//             <div className="demo-email-body">
//               Dear team,
//               <br />
//               <br />
//               Following our recent discussion, I'm sharing the Q3 performance
//               report for your review. Key highlights include a 14% revenue
//               increase and successful rollout of…
//             </div>
//             <div className="demo-email-actions">
//               <div className="demo-email-btn demo-email-send">Send now</div>
//               <div className="demo-email-btn">Edit</div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </MockupShell>
//   );
// }

// function DocumentScene({ cursorPos }) {
//   return (
//     <MockupShell>
//       <div className="demo-split">
//         <div className="demo-split-chat">
//           <div className="demo-user-bubble">
//             What was our total Q3 revenue according to the uploaded report?
//           </div>
//           <AiBubble
//             visible
//             text="According to Q3_Financial_Report.xlsx: Total revenue was KES 4,820,000 — up 14% vs Q2. Top contributor: Loan disbursements (62%)."
//             delay={200}
//           />
//           <ChatInput text="Which region performed best?" typing />
//         </div>
//         <div className="demo-split-panel">
//           <div className="demo-panel-title">Documents</div>
//           <div className="demo-doc-card demo-doc-active">
//             <div
//               className="demo-doc-icon"
//               style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}
//             >
//               XLS
//             </div>
//             <div>
//               <div className="demo-doc-name">Q3_Financial_Report.xlsx</div>
//               <div className="demo-doc-meta">
//                 3 sheets · 847 rows · Reading…
//               </div>
//             </div>
//           </div>
//           <div className="demo-doc-card">
//             <div
//               className="demo-doc-icon"
//               style={{ background: "rgba(248,81,73,0.15)", color: "#f85149" }}
//             >
//               PDF
//             </div>
//             <div>
//               <div className="demo-doc-name">Board_Presentation_Oct.pdf</div>
//               <div className="demo-doc-meta">12 pages · Uploaded yesterday</div>
//             </div>
//           </div>
//           <div className="demo-doc-answer">
//             <div className="demo-doc-answer-label">Extracted answer</div>
//             <div className="demo-doc-answer-val">
//               KES 4,820,000{" "}
//               <span style={{ color: "#22c55e", fontSize: 11 }}>▲14%</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </MockupShell>
//   );
// }

// function IntegrationScene({ cursorPos }) {
//   return (
//     <MockupShell>
//       <div className="demo-split">
//         <div className="demo-split-chat">
//           <div className="demo-user-bubble">
//             Check the current loan balance for +254791305299
//           </div>
//           <AiBubble
//             visible
//             text="John Kamau has KES 42,500 outstanding across 2 active loans. Next payment: May 15 (KES 8,500)."
//             delay={200}
//           />
//           <ChatInput text="What's his repayment history?" typing />
//         </div>
//         <div className="demo-split-panel">
//           <div className="demo-panel-title">Connections</div>
//           <div className="demo-conn-card demo-conn-active">
//             <div className="demo-conn-dot" style={{ background: "#22c55e" }} />
//             <div>
//               <div className="demo-conn-name">Loan Management System</div>
//               <div className="demo-conn-meta">
//                 REST · OAuth2 · <span style={{ color: "#22c55e" }}>Live</span>
//               </div>
//             </div>
//           </div>
//           <div className="demo-api-log">
//             <div className="demo-api-line">
//               <span className="demo-api-method">GET</span>{" "}
//               /api/partner/customer-loans/
//             </div>
//             <div className="demo-api-line">
//               <span className="demo-api-param">phone</span> +254791305299
//             </div>
//             <div className="demo-api-line demo-api-ok">
//               <span className="demo-api-status">200 OK</span> · 2 records ·
//               124ms
//             </div>
//           </div>
//         </div>
//       </div>
//     </MockupShell>
//   );
// }

// /* ════════════════════════════════════════════════════
//    ANIMATED CURSOR
// ════════════════════════════════════════════════════ */
// function DemoCursor({ x, y, label, visible }) {
//   return (
//     <div
//       className={`demo-cursor-wrap${visible ? " demo-cursor-visible" : ""}`}
//       style={{ left: `${x}%`, top: `${y}%` }}
//     >
//       <svg
//         className="demo-cursor-svg"
//         width="22"
//         height="22"
//         viewBox="0 0 22 22"
//         fill="none"
//       >
//         <path
//           d="M4 2L18 11L11 13L8 20L4 2Z"
//           fill="#3bd2f0"
//           stroke="#0d1117"
//           strokeWidth="1.5"
//           strokeLinejoin="round"
//         />
//       </svg>
//       {label && <div className="demo-cursor-label">{label}</div>}
//     </div>
//   );
// }

// /* ════════════════════════════════════════════════════
//    DEMO MODAL
//    Props:
//      open    — boolean
//      onClose — dismiss
// ════════════════════════════════════════════════════ */
// export default function DemoModal({ open, onClose }) {
//   const [sceneIdx, setSceneIdx] = useState(0);
//   const [cursor, setCursor] = useState({
//     x: 50,
//     y: 50,
//     label: "",
//     visible: false,
//   });
//   const [playing, setPlaying] = useState(true);
//   const timerRef = useRef(null);
//   const pathTimers = useRef([]);

//   const scene = SCENES[sceneIdx];

//   /* Run cursor path for current scene */
//   const runCursorPath = useCallback((path) => {
//     pathTimers.current.forEach(clearTimeout);
//     pathTimers.current = [];
//     setCursor({
//       x: path[0].x,
//       y: path[0].y,
//       label: path[0].label,
//       visible: true,
//     });
//     path.forEach((pt, i) => {
//       if (i === 0) return;
//       const t = setTimeout(() => {
//         setCursor({ x: pt.x, y: pt.y, label: pt.label, visible: true });
//       }, pt.delay);
//       pathTimers.current.push(t);
//     });
//   }, []);

//   /* Auto-advance scenes */
//   useEffect(() => {
//     if (!open || !playing) return;
//     runCursorPath(scene.cursorPath);
//     timerRef.current = setTimeout(() => {
//       setSceneIdx((i) => (i + 1) % SCENES.length);
//     }, scene.duration);
//     return () => {
//       clearTimeout(timerRef.current);
//       pathTimers.current.forEach(clearTimeout);
//     };
//   }, [open, sceneIdx, playing, scene, runCursorPath]);

//   /* Reset on open */
//   useEffect(() => {
//     if (open) {
//       setSceneIdx(0);
//       setPlaying(true);
//     } else {
//       setCursor((c) => ({ ...c, visible: false }));
//     }
//   }, [open]);

//   /* Escape key */
//   useEffect(() => {
//     if (!open) return;
//     const h = (e) => {
//       if (e.key === "Escape") onClose?.();
//     };
//     window.addEventListener("keydown", h);
//     return () => window.removeEventListener("keydown", h);
//   }, [open, onClose]);

//   /* Body scroll lock */
//   useEffect(() => {
//     document.body.style.overflow = open ? "hidden" : "";
//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [open]);

//   if (!open) return null;

//   const goTo = (i) => {
//     setSceneIdx(i);
//     setPlaying(false);
//     runCursorPath(SCENES[i].cursorPath);
//     clearTimeout(timerRef.current);
//   };

//   const prev = () => goTo((sceneIdx - 1 + SCENES.length) % SCENES.length);
//   const next = () => goTo((sceneIdx + 1) % SCENES.length);
//   const togglePlay = () => {
//     setPlaying((p) => !p);
//   };

//   return (
//     <div
//       className="demo-overlay"
//       onClick={(e) => e.target === e.currentTarget && onClose?.()}
//     >
//       <div className="demo-modal">
//         {/* ── Header ── */}
//         <div className="demo-header">
//           <div className="demo-header-left">
//             <div className="demo-logo-mark">D</div>
//             <div>
//               <div className="demo-logo-name">Dime Executive</div>
//               <div className="demo-logo-sub">Product walkthrough</div>
//             </div>
//           </div>
//           <button
//             className="demo-close"
//             onClick={onClose}
//             aria-label="Close demo"
//           >
//             <svg
//               width="14"
//               height="14"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//             >
//               <line x1="18" y1="6" x2="6" y2="18" />
//               <line x1="6" y1="6" x2="18" y2="18" />
//             </svg>
//           </button>
//         </div>

//         {/* ── Scene tabs ── */}
//         <div className="demo-tabs">
//           {SCENES.map((s, i) => (
//             <button
//               key={s.id}
//               className={`demo-tab${i === sceneIdx ? " active" : ""}`}
//               onClick={() => goTo(i)}
//               style={{ "--tab-accent": s.accent }}
//             >
//               <span className="demo-tab-tag">{s.tag}</span>
//               <span className="demo-tab-label">{s.service}</span>
//             </button>
//           ))}
//         </div>

//         {/* ── Scene content ── */}
//         <div className="demo-scene">
//           {/* Info panel */}
//           <div className="demo-scene-info">
//             <div
//               className="demo-scene-tag"
//               style={{ color: scene.accent, borderColor: scene.accent }}
//             >
//               {scene.service}
//             </div>
//             <h2 className="demo-scene-title">{scene.title}</h2>
//             <p className="demo-scene-desc">{scene.desc}</p>

//             {/* Progress dots */}
//             <div className="demo-progress">
//               {SCENES.map((s, i) => (
//                 <button
//                   key={s.id}
//                   className={`demo-progress-dot${i === sceneIdx ? " active" : ""}`}
//                   style={{ "--dot-accent": s.accent }}
//                   onClick={() => goTo(i)}
//                 />
//               ))}
//             </div>

//             {/* Controls */}
//             <div className="demo-controls">
//               <button className="demo-ctrl-btn" onClick={prev} title="Previous">
//                 <svg
//                   width="14"
//                   height="14"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                 >
//                   <polyline points="15 18 9 12 15 6" />
//                 </svg>
//               </button>
//               <button
//                 className="demo-ctrl-btn demo-ctrl-play"
//                 onClick={togglePlay}
//                 title={playing ? "Pause" : "Play"}
//               >
//                 {playing ? (
//                   <svg
//                     width="14"
//                     height="14"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                   >
//                     <line x1="6" y1="4" x2="6" y2="20" />
//                     <line x1="18" y1="4" x2="18" y2="20" />
//                   </svg>
//                 ) : (
//                   <svg
//                     width="14"
//                     height="14"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                   >
//                     <polygon points="5 3 19 12 5 21 5 3" />
//                   </svg>
//                 )}
//               </button>
//               <button className="demo-ctrl-btn" onClick={next} title="Next">
//                 <svg
//                   width="14"
//                   height="14"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                 >
//                   <polyline points="9 18 15 12 9 6" />
//                 </svg>
//               </button>
//             </div>
//           </div>

//           {/* Mockup area with cursor */}
//           <div className="demo-scene-mockup">
//             <div className="demo-mockup-wrap">
//               {scene.render(cursor)}
//               <DemoCursor
//                 x={cursor.x}
//                 y={cursor.y}
//                 label={cursor.label}
//                 visible={cursor.visible}
//               />
//             </div>
//           </div>
//         </div>

//         {/* ── Footer ── */}
//         <div className="demo-footer">
//           <span className="demo-footer-text">
//             Scene {sceneIdx + 1} of {SCENES.length} ·{" "}
//             {playing ? "Auto-advancing" : "Paused"}
//           </span>
//           {/* Scene progress bar */}
//           <div className="demo-progress-bar-wrap">
//             <div
//               className="demo-progress-bar-fill"
//               key={`${sceneIdx}-${playing}`}
//               style={{
//                 animationDuration: `${scene.duration}ms`,
//                 animationPlayState: playing ? "running" : "paused",
//                 background: scene.accent,
//               }}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
