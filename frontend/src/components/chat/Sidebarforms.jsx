// Sidebarforms.jsx - Add this after the existing imports
import React, { createContext, useContext, useState, useEffect } from "react";
import "../styles/forms.css";
// Add this to your existing imports at the top of Sidebarforms.jsx
import api, {
  getTasks,
  updateTask,
  deleteTask,
  getDocuments,
  deleteDocument,
  downloadDocument,
  getConnections,
  createConnection,
  getIntegrations,
  getConnectionEndpoints,
  proxyConnection,
  getMeetings,
  sendEmail,
  getEmails,
} from "../chat/index";

// Create context
const AIDataContext = createContext();

// Provider component
export function AIDataProvider({ children }) {
  const [documents, setDocuments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [emails, setEmails] = useState([]);

  // Load from sessionStorage on mount
  useEffect(() => {
    const savedDocs = sessionStorage.getItem("ai_documents");
    const savedTasks = sessionStorage.getItem("ai_tasks");
    const savedMeetings = sessionStorage.getItem("ai_meetings");
    const savedEmails = sessionStorage.getItem("ai_emails");

    if (savedDocs) setDocuments(JSON.parse(savedDocs));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedMeetings) setMeetings(JSON.parse(savedMeetings));
    if (savedEmails) setEmails(JSON.parse(savedEmails));
  }, []);

  // Save to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("ai_documents", JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    sessionStorage.setItem("ai_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    sessionStorage.setItem("ai_meetings", JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    sessionStorage.setItem("ai_emails", JSON.stringify(emails));
  }, [emails]);

  const addDocument = (doc) => {
    setDocuments((prev) => [doc, ...prev]);
  };

  const addTask = (task) => {
    setTasks((prev) => [task, ...prev]);
  };

  const addMeeting = (meeting) => {
    setMeetings((prev) => [meeting, ...prev]);
  };

  const addEmail = (email) => {
    setEmails((prev) => [email, ...prev]);
  };

  const deleteDocument = (id) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <AIDataContext.Provider
      value={{
        documents,
        tasks,
        meetings,
        emails,
        addDocument,
        addTask,
        addMeeting,
        addEmail,
        deleteDocument,
      }}
    >
      {children}
    </AIDataContext.Provider>
  );
}

// Hook to use the data
export const useAIData = () => {
  const context = useContext(AIDataContext);
  if (!context) {
    throw new Error("useAIData must be used within AIDataProvider");
  }
  return context;
};

// Then all your other components (Modal, AllTasksList, etc.)
// ...
/* ─────────────────────────────────────────────────────────────
   PHILOSOPHY: The AI agent (ai_assistants.py) creates tasks,
   schedules meetings and sends emails autonomously. The sidebar
   is a READ-ONLY dashboard of what the AI has done.

   No create/schedule/send forms here — talk to the AI in chat.
   ───────────────────────────────────────────────────────────── */

/* ════════════ ICONS ════════════ */
const X = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const Search = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const Refresh = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
  </svg>
);
const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const Chat = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);
const AIStar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

/* ════════════ SHARED UTILITIES ════════════ */
function parseError(err) {
  if (!err) return "An error occurred.";
  const d = err.response?.data;
  if (!d) return err.message || "Network error.";
  if (typeof d === "string") return d;
  if (d.detail) return d.detail;
  const first = Object.values(d)[0];
  if (Array.isArray(first)) return `${Object.keys(d)[0]}: ${first[0]}`;
  return JSON.stringify(d);
}

function Alert({ type = "info", children }) {
  const C = {
    error: ["rgba(248,81,73,0.1)", "#f85149"],
    success: ["rgba(34,197,94,0.1)", "#22c55e"],
    info: ["rgba(59,210,240,0.08)", "#3bd2f0"],
    warning: ["rgba(245,158,11,0.1)", "#f59e0b"],
  }[type] || ["rgba(59,210,240,0.08)", "#3bd2f0"];
  return (
    <div
      style={{
        background: C[0],
        border: `1px solid ${C[1]}`,
        borderRadius: 8,
        padding: "10px 14px",
        color: C[1],
        fontSize: 13,
        marginBottom: 14,
        lineHeight: 1.6,
      }}
    >
      {children}
    </div>
  );
}

function Pill({ status }) {
  const M = {
    Done: ["rgba(34,197,94,0.12)", "#22c55e"],
    Pending: ["rgba(245,158,11,0.12)", "#f59e0b"],
    Overdue: ["rgba(248,81,73,0.12)", "#f85149"],
    Upcoming: ["rgba(59,210,240,0.12)", "#3bd2f0"],
    Past: ["rgba(100,116,139,0.12)", "#64748b"],
    Connected: ["rgba(34,197,94,0.12)", "#22c55e"],
    Inactive: ["rgba(100,116,139,0.12)", "#64748b"],
    Active: ["rgba(34,197,94,0.12)", "#22c55e"],
    Sent: ["rgba(34,197,94,0.12)", "#22c55e"],
    Generated: ["rgba(167,139,250,0.12)", "#a78bfa"],
  }[status] || ["rgba(59,210,240,0.1)", "#3bd2f0"];
  return (
    <span
      style={{
        background: M[0],
        color: M[1],
        borderRadius: 6,
        padding: "2px 8px",
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

function AiHint({ action }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        background: "rgba(59,210,240,0.04)",
        border: "1px solid rgba(59,210,240,0.12)",
        borderRadius: 8,
        marginBottom: 16,
        fontSize: 12,
        color: "#64748b",
      }}
    >
      <span style={{ color: "#3bd2f0", flexShrink: 0, width: 16, height: 16 }}>
        <Chat />
      </span>
      <span>
        Ask Dime to <strong style={{ color: "#3bd2f0" }}>{action}</strong> — it
        will appear here automatically.
      </span>
    </div>
  );
}

function Modal({
  title,
  subtitle,
  iconColor = "#e6f1fb",
  iconTc = "#3bd2f0",
  icon,
  onClose,
  children,
  footer,
  wide = false,
}) {
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="sf-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`sf-panel${wide ? " sf-wide" : ""}`}>
        <div className="sf-header">
          <div
            className="sf-header-icon"
            style={{ background: iconColor, color: iconTc }}
          >
            {icon}
          </div>
          <div>
            <div className="sf-header-title">{title}</div>
            {subtitle && <div className="sf-header-sub">{subtitle}</div>}
          </div>
          <button className="sf-close" onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="sf-body">{children}</div>
        {footer && <div className="sf-footer">{footer}</div>}
      </div>
    </div>
  );
}

function Skeleton({ rows = 4 }) {
  return (
    <div className="sf-list">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            padding: "14px 16px",
            background: "#0d1117",
            border: "1px solid rgba(59,210,240,0.06)",
            borderRadius: 11,
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              background: "#111820",
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                width: `${50 + i * 10}%`,
                height: 12,
                background: "#111820",
                borderRadius: 4,
                marginBottom: 6,
              }}
            />
            <div
              style={{
                width: `${30 + i * 8}%`,
                height: 10,
                background: "#0d1117",
                borderRadius: 4,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="sf-toolbar" style={{ padding: "0 0 12px", border: "none" }}>
      <div className="sf-search-wrap">
        <div className="sf-search-icon">
          <Search />
        </div>
        <input
          className="sf-search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   AI RESPONSES DISPLAY - Shows AI confirmations
════════════════════════════════════════════════════ */
/* ════════════════════════════════════════════════════
   AI RESPONSES DISPLAY - Shows AI confirmations
════════════════════════════════════════════════════ */
function AIResponses({ onClose }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load AI responses from localStorage or API
    const savedResponses = localStorage.getItem("dime_ai_responses");
    if (savedResponses) {
      setResponses(JSON.parse(savedResponses));
    }
    setLoading(false);
  }, []);

  const clearResponses = () => {
    localStorage.removeItem("dime_ai_responses");
    setResponses([]);
  };

  const getIntentIcon = (intent) => {
    const icons = {
      schedule_meeting: "📅",
      generate_document: "📄",
      send_email: "✉️",
      create_task: "✅",
      update_task: "🔄",
      read_document: "📖",
    };
    return icons[intent] || "🤖";
  };

  return (
    <Modal
      title="AI Activity Log"
      subtitle={`${responses.length} actions performed`}
      iconColor="rgba(167,139,250,0.1)"
      iconTc="#a78bfa"
      icon={
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      }
      onClose={onClose}
      wide
      footer={
        responses.length > 0 && (
          <button className="sf-btn sf-btn-outline" onClick={clearResponses}>
            Clear History
          </button>
        )
      }
    >
      {loading ? (
        <Skeleton rows={3} />
      ) : responses.length === 0 ? (
        <div className="sf-empty">
          <div className="sf-empty-title">No AI activity yet</div>
          <div className="sf-empty-sub">
            Ask Dime to do something and it will appear here.
          </div>
        </div>
      ) : (
        <div className="sf-list">
          {responses.map((resp, idx) => (
            <div
              key={idx}
              style={{
                padding: "14px",
                background: "rgba(167,139,250,0.03)",
                border: "1px solid rgba(167,139,250,0.1)",
                borderRadius: 11,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 20 }}>
                  {getIntentIcon(resp.intent)}
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: resp.success ? "#22c55e" : "#f85149",
                    }}
                  >
                    {resp.success ? "✓" : "✗"} {resp.message}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>
                    {new Date(resp.timestamp).toLocaleString()}
                  </div>
                </div>
                <Pill status={resp.success ? "Done" : "Pending"} />
              </div>
              {resp.data && (
                <div
                  style={{
                    fontSize: 11,
                    color: "#94a3b8",
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: "1px solid rgba(167,139,250,0.1)",
                  }}
                >
                  {resp.data.meeting_id && (
                    <div>Meeting ID: {resp.data.meeting_id}</div>
                  )}
                  {resp.data.document_id && (
                    <div>Document ID: {resp.data.document_id}</div>
                  )}
                  {resp.data.task_id && <div>Task ID: {resp.data.task_id}</div>}
                  {resp.data.filename && <div>File: {resp.data.filename}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
/* ════════════════════════════════════════════════════
   TASKS — READ-ONLY VIEW with AI response display
════════════════════════════════════════════════════ */
function AllTasksList({ filter = "all", onClose }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState(filter);
  const [expanded, setExpanded] = useState(null);
  const [error, setError] = useState(null);
  const [aiResponse, setAiResponse] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const raw = await getTasks();
      const list = Array.isArray(raw) ? raw : raw?.results || [];
      setTasks(
        list.map((t) => ({
          id: t.id,
          title: t.title || "Untitled",
          description: t.description || "",
          completed: Boolean(t.completed),
          due_date: t.due_date || null,
          ai_response: t.ai_response || null,
        })),
      );
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const intent = e.detail?.intent;
      if (intent === "create_task" || intent === "update_task") load();
    };
    window.addEventListener("dime:intent_executed", handler);
    return () => window.removeEventListener("dime:intent_executed", handler);
  }, []);

  const now = new Date();
  const isOD = (t) => {
    const d = t.due_date ? new Date(t.due_date) : null;
    return !t.completed && d && !isNaN(d) && d < now;
  };

  const filtered = tasks.filter((t) => {
    const m =
      tab === "all" ||
      (tab === "pending" && !t.completed) ||
      (tab === "completed" && t.completed) ||
      (tab === "overdue" && isOD(t));
    return (
      m && (!search || t.title.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
    overdue: tasks.filter(isOD).length,
  };

  const toggle = async (id) => {
    const t = tasks.find((t) => t.id === id);
    if (!t) return;
    const next = !t.completed;
    setTasks((prev) =>
      prev.map((x) => (x.id === id ? { ...x, completed: next } : x)),
    );
    try {
      await updateTask(id, { completed: next });
      setAiResponse({
        success: true,
        message: `Task "${t.title}" marked ${next ? "complete" : "pending"}`,
      });
      setTimeout(() => setAiResponse(null), 3000);
    } catch {
      load();
    }
  };

  const remove = async (id) => {
    const t = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTask(id);
      setAiResponse({ success: true, message: `Task "${t?.title}" deleted` });
      setTimeout(() => setAiResponse(null), 3000);
    } catch {
      load();
    }
  };

  const TABS = [
    { key: "all", label: "All", count: stats.total },
    { key: "pending", label: "Pending", count: stats.pending },
    { key: "completed", label: "Done", count: stats.completed },
    { key: "overdue", label: "Overdue", count: stats.overdue },
  ];

  return (
    <Modal
      title="Tasks"
      subtitle={`${stats.total} total · ${stats.pending} pending · ${stats.overdue} overdue`}
      iconColor="rgba(59,210,240,0.1)"
      iconTc="#3bd2f0"
      icon={
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <rect x="3" y="5" width="6" height="6" rx="1" />
          <polyline points="9.5 11 11 12.5 14.5 9" />
          <line x1="17" y1="7" x2="21" y2="7" />
          <rect x="3" y="14" width="6" height="6" rx="1" />
        </svg>
      }
      onClose={onClose}
      wide
    >
      {aiResponse && (
        <Alert type={aiResponse.success ? "success" : "error"}>
          {aiResponse.message}
        </Alert>
      )}

      <AiHint action="create a task" />

      <div className="sf-tab-bar" style={{ marginBottom: 12 }}>
        {TABS.map(({ key, label, count }) => (
          <button
            key={key}
            className={`sf-tab${tab === key ? " active" : ""}`}
            onClick={() => setTab(key)}
          >
            {label}
            <span
              style={{
                marginLeft: 6,
                background:
                  tab === key
                    ? "rgba(59,210,240,0.15)"
                    : "rgba(255,255,255,0.06)",
                borderRadius: 10,
                padding: "0 6px",
                fontSize: 10,
                color: tab === key ? "#3bd2f0" : "#64748b",
              }}
            >
              {count}
            </span>
          </button>
        ))}
        <button
          className="sf-tab"
          style={{ marginLeft: "auto" }}
          onClick={load}
          title="Refresh"
        >
          <Refresh />
        </button>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search tasks…"
      />
      {error && <Alert type="error">{error}</Alert>}

      {loading ? (
        <Skeleton />
      ) : filtered.length === 0 ? (
        <div className="sf-empty">
          <div className="sf-empty-title">No tasks found</div>
          <div className="sf-empty-sub">
            {tab === "all"
              ? 'Tell Dime: "Create a task to review the Horizon contract"'
              : `No ${tab} tasks right now.`}
          </div>
        </div>
      ) : (
        <div className="sf-list">
          {filtered.map((t) => {
            const od = isOD(t);
            const status = t.completed ? "Done" : od ? "Overdue" : "Pending";
            const due = t.due_date ? new Date(t.due_date) : null;
            const open = expanded === t.id;
            return (
              <div
                key={t.id}
                style={{
                  borderRadius: 11,
                  overflow: "hidden",
                  marginBottom: 6,
                }}
              >
                <div
                  className="sf-list-item"
                  style={{
                    cursor: "pointer",
                    borderRadius: open ? "11px 11px 0 0" : 11,
                  }}
                  onClick={() => setExpanded(open ? null : t.id)}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(t.id);
                    }}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      flexShrink: 0,
                      border: `2px solid ${t.completed ? "#22c55e" : "rgba(59,210,240,0.3)"}`,
                      background: t.completed
                        ? "rgba(34,197,94,0.15)"
                        : "transparent",
                      color: "#22c55e",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    {t.completed && <Check />}
                  </button>
                  <div className="sf-list-body">
                    <div
                      className="sf-list-title"
                      style={{
                        textDecoration: t.completed ? "line-through" : "none",
                        opacity: t.completed ? 0.5 : 1,
                      }}
                    >
                      {t.title}
                    </div>
                    {due && (
                      <div
                        className="sf-list-meta"
                        style={{ color: od ? "#f85149" : "#64748b" }}
                      >
                        Due{" "}
                        {due.toLocaleDateString("en-KE", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        {od ? " · Overdue" : ""}
                      </div>
                    )}
                  </div>
                  <div className="sf-list-right" style={{ gap: 8 }}>
                    <Pill status={status} />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(t.id);
                      }}
                      style={{
                        background: "rgba(248,81,73,0.08)",
                        border: "1px solid rgba(248,81,73,0.2)",
                        color: "#f85149",
                        borderRadius: 6,
                        padding: "4px 10px",
                        fontSize: 11,
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {open && (
                  <div
                    style={{
                      background: "rgba(59,210,240,0.03)",
                      padding: "12px 16px 14px 52px",
                      borderRadius: "0 0 11px 11px",
                      border: "1px solid rgba(59,210,240,0.08)",
                      borderTop: "none",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        color: t.description ? "#94a3b8" : "#475569",
                        fontSize: 13,
                        lineHeight: 1.7,
                        fontStyle: t.description ? "normal" : "italic",
                      }}
                    >
                      {t.description || "No description."}
                    </p>
                    {t.ai_response && (
                      <div
                        style={{
                          marginTop: 10,
                          padding: 8,
                          background: "rgba(167,139,250,0.05)",
                          borderRadius: 6,
                          fontSize: 11,
                          color: "#a78bfa",
                        }}
                      >
                        🤖 AI: {t.ai_response}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

/* ════════════════════════════════════════════════════
   MEETINGS LIST with AI response display
════════════════════════════════════════════════════ */
function MeetingsList({ filter = "upcoming", onClose }) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [rawCount, setRawCount] = useState(null);
  const [aiResponse, setAiResponse] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api
      .get("/ai-agent/api/meetings/")
      .then((r) => {
        const raw = r.data?.results ?? (Array.isArray(r.data) ? r.data : []);
        setRawCount(r.data?.count ?? raw.length);
        setMeetings(raw);
      })
      .catch((err) => {
        const body = err.response?.data;
        const detail =
          typeof body === "string"
            ? body
            : (body?.detail ?? JSON.stringify(body) ?? err.message);
        setError(`HTTP ${err.response?.status ?? "?"}: ${detail}`);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.intent === "schedule_meeting") load();
    };
    window.addEventListener("dime:intent_executed", handler);
    return () => window.removeEventListener("dime:intent_executed", handler);
  }, []);

  const now = new Date();
  const filtered = meetings.filter((m) => {
    const s = m.start_time ? new Date(m.start_time) : null;
    if (filter === "upcoming") return !s || s >= now;
    if (filter === "past") return s && s < now;
    return true;
  });

  const fmt = (dt) =>
    dt
      ? new Date(dt).toLocaleString("en-KE", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "—";
  const parts = (csv) =>
    csv
      ? csv
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  return (
    <Modal
      title={filter === "upcoming" ? "Upcoming Meetings" : "Past Meetings"}
      subtitle={
        rawCount !== null
          ? `${filtered.length} ${filter} · ${rawCount} total in DB`
          : `${filtered.length} ${filter} meetings`
      }
      iconColor="rgba(34,197,94,0.1)"
      iconTc="#22c55e"
      icon={
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      }
      onClose={onClose}
      wide
    >
      {aiResponse && (
        <Alert type={aiResponse.success ? "success" : "error"}>
          {aiResponse.message}
        </Alert>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          background: "rgba(59,210,240,0.04)",
          border: "1px solid rgba(59,210,240,0.12)",
          borderRadius: 8,
          marginBottom: 16,
          fontSize: 12,
          color: "#64748b",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#3bd2f0"
          strokeWidth={2}
          style={{ width: 16, height: 16, flexShrink: 0 }}
        >
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
        <span>
          Ask Dime to{" "}
          <strong style={{ color: "#3bd2f0" }}>schedule a meeting</strong> —
          e.g. "Schedule a board meeting on Friday at 2pm with alice@co.com"
        </span>
      </div>

      <div
        style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}
      >
        <button
          onClick={load}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            background: "rgba(59,210,240,0.06)",
            border: "1px solid rgba(59,210,240,0.15)",
            borderRadius: 6,
            padding: "5px 12px",
            color: "#3bd2f0",
            cursor: "pointer",
          }}
        >
          <Refresh /> {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {loading ? (
        <Skeleton rows={3} />
      ) : !error && filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 20px" }}>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
            No {filter} meetings
          </div>
          {rawCount === 0 && (
            <div
              style={{
                fontSize: 11,
                color: "#475569",
                marginTop: 4,
                padding: "10px 14px",
                background: "rgba(59,210,240,0.04)",
                border: "1px solid rgba(59,210,240,0.1)",
                borderRadius: 8,
              }}
            >
              <strong style={{ color: "#3bd2f0" }}>
                0 meetings in the database.
              </strong>
              <br />
              Ask Dime:{" "}
              <code style={{ color: "#94a3b8" }}>
                "Schedule a team meeting tomorrow at 2pm"
              </code>
            </div>
          )}
        </div>
      ) : !error ? (
        <div className="sf-list">
          {filtered.map((m) => {
            const pList = parts(m.participants);
            const open = expanded === m.id;
            return (
              <div
                key={m.id}
                style={{
                  borderRadius: 11,
                  overflow: "hidden",
                  marginBottom: 6,
                }}
              >
                <div
                  className="sf-list-item"
                  style={{
                    cursor: m.notes ? "pointer" : "default",
                    borderRadius: open ? "11px 11px 0 0" : 11,
                  }}
                  onClick={() => m.notes && setExpanded(open ? null : m.id)}
                >
                  <div
                    className="sf-list-icon"
                    style={{
                      background: "rgba(34,197,94,0.1)",
                      color: "#22c55e",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      style={{ width: 16, height: 16 }}
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div className="sf-list-body">
                    <div className="sf-list-title">
                      {m.title || "Untitled meeting"}
                    </div>
                    <div className="sf-list-meta">
                      {fmt(m.start_time)} → {fmt(m.end_time)}
                    </div>
                    {pList.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          gap: 4,
                          flexWrap: "wrap",
                          marginTop: 4,
                        }}
                      >
                        {pList.slice(0, 4).map((p) => (
                          <span
                            key={p}
                            style={{
                              fontSize: 10,
                              background: "rgba(34,197,94,0.08)",
                              color: "#22c55e",
                              borderRadius: 4,
                              padding: "1px 6px",
                            }}
                          >
                            {p}
                          </span>
                        ))}
                        {pList.length > 4 && (
                          <span style={{ fontSize: 10, color: "#64748b" }}>
                            +{pList.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="sf-list-right" style={{ gap: 8 }}>
                    <span
                      style={{
                        background:
                          filter === "upcoming"
                            ? "rgba(59,210,240,0.12)"
                            : "rgba(100,116,139,0.12)",
                        color: filter === "upcoming" ? "#3bd2f0" : "#64748b",
                        borderRadius: 6,
                        padding: "2px 8px",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {filter === "upcoming" ? "Upcoming" : "Past"}
                    </span>
                    {m.notes && (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#64748b"
                        strokeWidth={2}
                        style={{
                          width: 12,
                          height: 12,
                          transition: "transform .15s",
                          transform: open ? "rotate(90deg)" : "none",
                        }}
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    )}
                  </div>
                </div>
                {open && m.notes && (
                  <div
                    style={{
                      background: "rgba(34,197,94,0.03)",
                      padding: "12px 16px 14px 60px",
                      borderRadius: "0 0 11px 11px",
                      border: "1px solid rgba(34,197,94,0.1)",
                      borderTop: "none",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        color: "#94a3b8",
                        fontSize: 13,
                        lineHeight: 1.7,
                      }}
                    >
                      {m.notes}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </Modal>
  );
}

/* ════════════════════════════════════════════════════
   EMAILS — READ-ONLY VIEW with AI response display
════════════════════════════════════════════════════ */
function EmailList({ folder = "sent", onClose }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");
  const [aiResponse, setAiResponse] = useState(null);

  const loadEmails = () => {
    setLoading(true);
    api
      .get("/ai-agent/api/email/", { params: { folder } })
      .then((r) => {
        const raw = r.data?.results || r.data?.emails || r.data || [];
        setEmails(Array.isArray(raw) ? raw : []);
      })
      .catch((err) => {
        if (err.response?.status !== 404) setError(parseError(err));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadEmails(); }, [folder]);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.intent === "send_email") loadEmails();
    };
    window.addEventListener("dime:intent_executed", handler);
    return () => window.removeEventListener("dime:intent_executed", handler);
  }, [folder]);

  const filtered = emails.filter(
    (e) =>
      !search ||
      (e.subject || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.to || "").toLowerCase().includes(search.toLowerCase()),
  );

  const fmtDate = (dt) =>
    dt
      ? new Date(dt).toLocaleDateString("en-KE", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "";

  const folderLabels = {
    sent: "Sent emails",
    inbox: "Inbox",
    drafts: "Drafts",
  };

  return (
    <Modal
      title={folderLabels[folder] || "Emails"}
      subtitle={`${emails.length} messages`}
      iconColor="rgba(245,158,11,0.1)"
      iconTc="#f59e0b"
      icon={
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <polyline points="2 7 12 13 22 7" />
        </svg>
      }
      onClose={onClose}
      wide
    >
      {aiResponse && (
        <Alert type={aiResponse.success ? "success" : "error"}>
          {aiResponse.message}
        </Alert>
      )}

      <AiHint action='send an email — e.g. "Send an email to alice@co.com about the Q3 report"' />
      {error && <Alert type="error">{error}</Alert>}
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search emails…"
      />

      {loading ? (
        <Skeleton rows={3} />
      ) : filtered.length === 0 ? (
        <div className="sf-empty">
          <div className="sf-empty-title">No {folder} emails</div>
          <div className="sf-empty-sub">
            Emails sent by Dime will appear here.
          </div>
        </div>
      ) : (
        <div className="sf-list">
          {filtered.map((e, i) => {
            const open = expanded === i;
            return (
              <div
                key={e.id || i}
                style={{
                  borderRadius: 11,
                  overflow: "hidden",
                  marginBottom: 6,
                }}
              >
                <div
                  className="sf-list-item"
                  style={{
                    cursor: e.body ? "pointer" : "default",
                    borderRadius: open ? "11px 11px 0 0" : 11,
                  }}
                  onClick={() => e.body && setExpanded(open ? null : i)}
                >
                  <div
                    className="sf-list-icon"
                    style={{
                      background: "rgba(245,158,11,0.1)",
                      color: "#f59e0b",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {(e.to || "?")[0]?.toUpperCase()}
                  </div>
                  <div className="sf-list-body">
                    <div className="sf-list-title">
                      {e.subject || "(no subject)"}
                    </div>
                    <div className="sf-list-meta">
                      To: {e.to}
                      {e.created_at && (
                        <span style={{ marginLeft: 8, color: "#475569" }}>
                          {fmtDate(e.created_at)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="sf-list-right" style={{ gap: 8 }}>
                    <Pill status="Sent" />
                    {e.body && (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#64748b"
                        strokeWidth={2}
                        style={{
                          width: 12,
                          height: 12,
                          transition: "transform .15s",
                          transform: open ? "rotate(90deg)" : "none",
                        }}
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    )}
                  </div>
                </div>
                {open && e.body && (
                  <div
                    style={{
                      background: "rgba(245,158,11,0.03)",
                      padding: "12px 16px 14px 60px",
                      borderRadius: "0 0 11px 11px",
                      border: "1px solid rgba(245,158,11,0.1)",
                      borderTop: "none",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        color: "#94a3b8",
                        fontSize: 13,
                        lineHeight: 1.7,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {e.body}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

/* ════════════════════════════════════════════════════
   DOCUMENTS — READ-ONLY + DOWNLOAD + ASK DIME
════════════════════════════════════════════════════ */
// In Sidebarforms.jsx, replace the DocumentsList function with this:

function DocumentsList({ onClose, onRead }) {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const EXT = {
    pdf: ["rgba(248,81,73,0.15)", "#f85149"],
    xlsx: ["rgba(34,197,94,0.15)", "#22c55e"],
    xls: ["rgba(34,197,94,0.15)", "#22c55e"],
    docx: ["rgba(59,210,240,0.15)", "#3bd2f0"],
    doc: ["rgba(59,210,240,0.15)", "#3bd2f0"],
    txt: ["rgba(167,139,250,0.15)", "#a78bfa"],
    csv: ["rgba(34,197,94,0.15)", "#22c55e"],
  };

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const r = await api.get("/ai-agent/api/documents/");
      const raw = r.data?.results || (Array.isArray(r.data) ? r.data : []);
      setDocuments(raw);
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const handler = (e) => {
      const intent = e.detail?.intent;
      if (intent === "generate_document" || intent === "upload_document") load();
    };
    window.addEventListener("dime:intent_executed", handler);
    return () => window.removeEventListener("dime:intent_executed", handler);
  }, []);

  const getName = (d) => d.filename || d.title || `doc-${d.id}`;
  const extOf = (n) => n?.split(".").pop()?.toLowerCase() || "file";

  const filtered = documents.filter(
    (d) => !search || getName(d).toLowerCase().includes(search.toLowerCase()),
  );

  const handleDownload = (doc) => {
    const url = doc.download_url || doc.file;
    if (url) window.open(url, "_blank");
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this document?")) return;
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(parseError(err));
    }
  };

  return (
    <Modal
      title="Documents"
      subtitle={`${documents.length} files`}
      iconColor="rgba(167,139,250,0.1)"
      iconTc="#a78bfa"
      icon={
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="13" x2="15" y2="13" />
        </svg>
      }
      onClose={onClose}
      wide
    >
      <AiHint action='generate a document — e.g. "Generate a PDF report about Q4 earnings"' />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search documents…"
      />
      {error && <Alert type="error">{error}</Alert>}

      {loading ? (
        <Skeleton />
      ) : filtered.length === 0 ? (
        <div className="sf-empty">
          <div className="sf-empty-title">No documents</div>
          <div className="sf-empty-sub">
            Documents generated by Dime will appear here.
          </div>
        </div>
      ) : (
        <div className="sf-list">
          {filtered.map((d) => {
            const name = getName(d);
            const e = extOf(name);
            const [bg, tc] = EXT[e] || ["rgba(59,210,240,0.1)", "#3bd2f0"];
            return (
              <div key={d.id} className="sf-list-item">
                <div
                  className="sf-list-icon"
                  style={{
                    background: bg,
                    color: tc,
                    fontSize: 10,
                    fontWeight: 800,
                  }}
                >
                  {e.toUpperCase()}
                </div>
                <div className="sf-list-body">
                  <div className="sf-list-title">{name}</div>
                  <div className="sf-list-meta">
                    Generated{" "}
                    {new Date(d.created_at).toLocaleDateString("en-KE")}
                    {d.size && ` · ${Math.round(d.size / 1024)} KB`}
                  </div>
                  {d.description && (
                    <div
                      className="sf-list-sub"
                      style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}
                    >
                      {d.description}
                    </div>
                  )}
                </div>
                <div className="sf-list-right" style={{ gap: 6 }}>
                  <button
                    className="sf-btn sf-btn-outline"
                    style={{ padding: "5px 10px", fontSize: 11 }}
                    onClick={() => onRead?.(d.id)}
                  >
                    Ask Dime
                  </button>
                  <button
                    className="sf-btn sf-btn-outline"
                    style={{ padding: "5px 10px", fontSize: 11 }}
                    onClick={() => handleDownload(d)}
                  >
                    {e === "pdf" ? "👁️" : "↓"}
                  </button>
                  <button
                    style={{
                      background: "rgba(248,81,73,0.08)",
                      border: "1px solid rgba(248,81,73,0.2)",
                      color: "#f85149",
                      borderRadius: 6,
                      padding: "5px 10px",
                      fontSize: 11,
                      cursor: "pointer",
                    }}
                    onClick={() => handleDelete(d.id)}
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
/* ════════════════════════════════════════════════════
   READ DOCUMENT — ask AI about a document's content
════════════════════════════════════════════════════ */
function ReadDocumentForm({ onClose, initialDocId = "" }) {
  const [docId, setDocId] = useState(initialDocId);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [alert, setAlert] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!docId || !query.trim()) {
      setAlert({ type: "error", msg: "Enter document ID and question." });
      return;
    }
    setLoading(true);
    setAlert(null);
    setResult(null);
    try {
      const r = await api.post("/ai-agent/documents/read/", {
        doc_id: docId,
        query,
      });
      setResult(
        r.data?.answer || r.data?.content_preview || "No answer returned.",
      );
    } catch (err) {
      setAlert({ type: "error", msg: parseError(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Ask about a document"
      subtitle="Dime reads and answers"
      iconColor="rgba(167,139,250,0.1)"
      iconTc="#a78bfa"
      icon={
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="13" x2="15" y2="13" />
        </svg>
      }
      onClose={onClose}
      footer={
        <button
          type="submit"
          form="read-form"
          className="sf-btn sf-btn-primary"
          disabled={loading}
        >
          {loading ? <span className="sf-spinner" /> : "Ask Dime"}
        </button>
      }
    >
      <form id="read-form" onSubmit={submit}>
        {alert && <Alert type={alert.type}>{alert.msg}</Alert>}
        <div className="sf-field">
          <label className="sf-label">Document ID</label>
          <input
            className="sf-input"
            placeholder="UUID from the documents list"
            value={docId}
            onChange={(e) => setDocId(e.target.value)}
          />
        </div>
        <div className="sf-field">
          <label className="sf-label">Your question</label>
          <textarea
            className="sf-textarea"
            placeholder="e.g. What was the Q3 revenue?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {result && (
          <div className="sf-result">
            <div className="sf-result-header">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                style={{ width: 14, height: 14 }}
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Dime's answer
            </div>
            <div className="sf-result-body">{result}</div>
          </div>
        )}
      </form>
    </Modal>
  );
}

/* ════════════════════════════════════════════════════
   CONNECTIONS — read list + add new manually
════════════════════════════════════════════════════ */
function ConnectionsList({ filter = "all", onClose, onAddNew }) {
  const [conns, setConns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState(filter);
  const [error, setError] = useState(null);

  useEffect(() => {
    getConnections()
      .then((r) => setConns(r.data?.results || r.data || []))
      .catch((err) => setError(parseError(err)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = conns.filter((c) => {
    const mt = tab === "all" || c.auth_type === tab;
    const ms = !search || c.name?.toLowerCase().includes(search.toLowerCase());
    return mt && ms;
  });

  const AUTH_COLOR = {
    oauth2: "#3bd2f0",
    api_key: "#22c55e",
    bearer_token: "#a78bfa",
    basic: "#f59e0b",
    no_auth: "#64748b",
  };

  return (
    <Modal
      title="Connections"
      subtitle={`${conns.length} connections`}
      iconColor="rgba(59,210,240,0.1)"
      iconTc="#3bd2f0"
      icon={
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="9" cy="12" r="3" />
          <circle cx="19" cy="5" r="2" />
          <circle cx="19" cy="19" r="2" />
          <line x1="12" y1="12" x2="17" y2="6" />
          <line x1="12" y1="12" x2="17" y2="18" />
        </svg>
      }
      onClose={onClose}
      wide
      footer={
        <button className="sf-btn sf-btn-primary" onClick={onAddNew}>
          + Add connection
        </button>
      }
    >
      <div className="sf-tab-bar">
        {["all", "api_key", "bearer_token", "oauth2", "basic"].map((t) => (
          <button
            key={t}
            className={`sf-tab${tab === t ? " active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "all"
              ? "All"
              : t === "api_key"
                ? "API Key"
                : t === "bearer_token"
                  ? "Bearer"
                  : t === "oauth2"
                    ? "OAuth2"
                    : "Basic"}
          </button>
        ))}
      </div>
      <div className="sf-toolbar" style={{ padding: "10px 0", border: "none" }}>
        <div className="sf-search-wrap">
          <div className="sf-search-icon">
            <Search />
          </div>
          <input
            className="sf-search"
            placeholder="Search connections…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      {error && <Alert type="error">{error}</Alert>}
      {loading ? (
        <Skeleton />
      ) : filtered.length === 0 ? (
        <div className="sf-empty">
          <div className="sf-empty-title">No connections found</div>
        </div>
      ) : (
        <div className="sf-list">
          {filtered.map((c) => (
            <div key={c.id} className="sf-list-item">
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: c.is_active ? "#22c55e" : "#3a4a5a",
                  flexShrink: 0,
                  marginTop: 4,
                }}
              />
              <div className="sf-list-body">
                <div className="sf-list-title">{c.name}</div>
                <div className="sf-list-sub">
                  {c.integration?.name} ·{" "}
                  {c.integration?.base_url || c.base_url}
                </div>
                <div className="sf-list-meta">
                  <span
                    style={{
                      color: AUTH_COLOR[c.auth_type] || "#64748b",
                      fontWeight: 600,
                      fontSize: 10,
                      marginRight: 8,
                    }}
                  >
                    {c.auth_type?.replace("_", " ").toUpperCase()}
                  </span>
                  {c.endpoint_count || 0} endpoints
                </div>
              </div>
              <Pill status={c.is_active ? "Connected" : "Inactive"} />
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

/* ════════════════════════════════════════════════════
   ADD CONNECTION FORM — manual connection setup
════════════════════════════════════════════════════ */
function AddConnectionForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    auth_type: "api_key",
    base_url: "",
    description: "",
    api_key_value: "",
    api_key_key: "X-API-Key",
    api_key_placement: "header",
    bearer_token: "",
    basic_username: "",
    basic_password: "",
    oauth2_client_id: "",
    oauth2_client_secret: "",
    oauth2_authorization_url: "",
    oauth2_token_url: "",
    oauth2_scopes: "",
    oauth2_grant_type: "authorization_code",
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const c = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const buildPayload = () => {
    const base = {
      name: form.name.trim(),
      auth_type: form.auth_type,
      base_url: form.base_url.trim(),
      description: form.description.trim(),
    };
    switch (form.auth_type) {
      case "api_key":
        return {
          ...base,
          api_key_key: form.api_key_key,
          api_key_value: form.api_key_value,
          api_key_placement: form.api_key_placement,
        };
      case "bearer_token":
        return { ...base, bearer_token: form.bearer_token };
      case "basic":
        return {
          ...base,
          basic_username: form.basic_username,
          basic_password: form.basic_password,
        };
      case "oauth2":
        return {
          ...base,
          oauth2_client_id: form.oauth2_client_id,
          oauth2_client_secret: form.oauth2_client_secret,
          oauth2_authorization_url: form.oauth2_authorization_url,
          oauth2_token_url: form.oauth2_token_url,
          oauth2_scopes: form.oauth2_scopes,
          oauth2_grant_type: form.oauth2_grant_type,
        };
      default:
        return base;
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      setAlert({ type: "error", msg: "Name is required." });
      return;
    }
    if (!form.base_url) {
      setAlert({ type: "error", msg: "Base URL is required." });
      return;
    }
    setLoading(true);
    setAlert(null);
    try {
      await createConnection(buildPayload());
      setAlert({
        type: "success",
        msg: `"${form.name}" connected! Dime can now use it.`,
      });
      setTimeout(onSuccess, 1000);
    } catch (err) {
      setAlert({ type: "error", msg: parseError(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add connection"
      subtitle="Dime will use this to call external APIs"
      iconColor="rgba(59,210,240,0.1)"
      iconTc="#3bd2f0"
      icon={
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="9" cy="12" r="3" />
          <circle cx="19" cy="5" r="2" />
          <circle cx="19" cy="19" r="2" />
          <line x1="12" y1="12" x2="17" y2="6" />
          <line x1="12" y1="12" x2="17" y2="18" />
        </svg>
      }
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="sf-btn sf-btn-outline"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="conn-form"
            className="sf-btn sf-btn-primary"
            disabled={loading}
          >
            {loading ? <span className="sf-spinner" /> : "Connect"}
          </button>
        </>
      }
    >
      <form id="conn-form" onSubmit={submit}>
        {alert && <Alert type={alert.type}>{alert.msg}</Alert>}
        <div className="sf-field">
          <label className="sf-label">
            Connection name <span style={{ color: "#f85149" }}>*</span>
          </label>
          <input
            className="sf-input"
            maxLength={255}
            placeholder="e.g. Loan Management System"
            value={form.name}
            onChange={c("name")}
          />
        </div>
        <div className="sf-field">
          <label className="sf-label">
            Base URL <span style={{ color: "#f85149" }}>*</span>
          </label>
          <input
            className="sf-input"
            placeholder="https://api.yourservice.com"
            value={form.base_url}
            onChange={c("base_url")}
          />
        </div>
        <div className="sf-field">
          <label className="sf-label">Auth type</label>
          <select
            className="sf-select"
            value={form.auth_type}
            onChange={c("auth_type")}
          >
            <option value="api_key">API Key</option>
            <option value="bearer_token">Bearer Token</option>
            <option value="oauth2">OAuth 2.0</option>
            <option value="basic">Basic Auth</option>
            <option value="no_auth">No Auth</option>
          </select>
        </div>
        {form.auth_type === "api_key" && (
          <>
            <div className="sf-field-row">
              <div className="sf-field">
                <label className="sf-label">Header name</label>
                <input
                  className="sf-input"
                  placeholder="X-API-Key"
                  value={form.api_key_key}
                  onChange={c("api_key_key")}
                />
              </div>
              <div className="sf-field">
                <label className="sf-label">Placement</label>
                <select
                  className="sf-select"
                  value={form.api_key_placement}
                  onChange={c("api_key_placement")}
                >
                  <option value="header">Header</option>
                  <option value="query_param">Query Param</option>
                  <option value="cookie">Cookie</option>
                  <option value="body">Body</option>
                </select>
              </div>
            </div>
            <div className="sf-field">
              <label className="sf-label">API Key value</label>
              <input
                className="sf-input"
                type="password"
                placeholder="sk-…"
                value={form.api_key_value}
                onChange={c("api_key_value")}
              />
            </div>
          </>
        )}
        {form.auth_type === "bearer_token" && (
          <div className="sf-field">
            <label className="sf-label">Bearer token</label>
            <input
              className="sf-input"
              type="password"
              placeholder="eyJ…"
              value={form.bearer_token}
              onChange={c("bearer_token")}
            />
          </div>
        )}
        {form.auth_type === "basic" && (
          <div className="sf-field-row">
            <div className="sf-field">
              <label className="sf-label">Username</label>
              <input
                className="sf-input"
                value={form.basic_username}
                onChange={c("basic_username")}
              />
            </div>
            <div className="sf-field">
              <label className="sf-label">Password</label>
              <input
                className="sf-input"
                type="password"
                value={form.basic_password}
                onChange={c("basic_password")}
              />
            </div>
          </div>
        )}
        {form.auth_type === "oauth2" && (
          <>
            <div className="sf-field">
              <label className="sf-label">Grant type</label>
              <select
                className="sf-select"
                value={form.oauth2_grant_type}
                onChange={c("oauth2_grant_type")}
              >
                <option value="authorization_code">
                  Authorization Code (+ PKCE)
                </option>
                <option value="client_credentials">Client Credentials</option>
                <option value="password">Resource Owner Password</option>
              </select>
            </div>
            <div className="sf-field-row">
              <div className="sf-field">
                <label className="sf-label">Client ID</label>
                <input
                  className="sf-input"
                  value={form.oauth2_client_id}
                  onChange={c("oauth2_client_id")}
                />
              </div>
              <div className="sf-field">
                <label className="sf-label">Client secret</label>
                <input
                  className="sf-input"
                  type="password"
                  value={form.oauth2_client_secret}
                  onChange={c("oauth2_client_secret")}
                />
              </div>
            </div>
            <div className="sf-field">
              <label className="sf-label">Authorization URL</label>
              <input
                className="sf-input"
                placeholder="https://provider.com/oauth/authorize"
                value={form.oauth2_authorization_url}
                onChange={c("oauth2_authorization_url")}
              />
            </div>
            <div className="sf-field">
              <label className="sf-label">Token URL</label>
              <input
                className="sf-input"
                placeholder="https://provider.com/oauth/token"
                value={form.oauth2_token_url}
                onChange={c("oauth2_token_url")}
              />
            </div>
            <div className="sf-field">
              <label className="sf-label">Scopes</label>
              <input
                className="sf-input"
                placeholder="read write profile (space-separated)"
                value={form.oauth2_scopes}
                onChange={c("oauth2_scopes")}
              />
            </div>
          </>
        )}
        <div className="sf-field">
          <label className="sf-label">Description</label>
          <input
            className="sf-input"
            placeholder="What does this connection do?"
            value={form.description}
            onChange={c("description")}
          />
        </div>
      </form>
    </Modal>
  );
}

/* ════════════════════════════════════════════════════
   INTEGRATIONS LIST — read only
════════════════════════════════════════════════════ */
function IntegrationsList({ filter = "all", onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    getIntegrations()
      .then((r) => setItems(r.data?.results || r.data || []))
      .catch((err) => setError(parseError(err)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(
    (i) =>
      (filter === "all" || (filter === "active" && i.is_active)) &&
      (!search || i.name?.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <Modal
      title={filter === "active" ? "Active Integrations" : "All Integrations"}
      subtitle={`${items.length} integrations`}
      iconColor="rgba(59,210,240,0.1)"
      iconTc="#3bd2f0"
      icon={
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <rect x="2" y="2" width="8" height="8" rx="2" />
          <rect x="14" y="2" width="8" height="8" rx="2" />
          <rect x="2" y="14" width="8" height="8" rx="2" />
          <rect x="14" y="14" width="8" height="8" rx="2" />
        </svg>
      }
      onClose={onClose}
      wide
    >
      <AiHint action='use an integration — e.g. "Check loan balance for 254791305299"' />
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search integrations…"
      />
      {error && <Alert type="error">{error}</Alert>}
      {loading ? (
        <Skeleton />
      ) : filtered.length === 0 ? (
        <div className="sf-empty">
          <div className="sf-empty-title">No integrations found</div>
        </div>
      ) : (
        <div className="sf-list">
          {filtered.map((i) => (
            <div key={i.id} className="sf-list-item">
              <div
                className="sf-list-icon"
                style={{
                  background: "rgba(59,210,240,0.08)",
                  color: "#3bd2f0",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  style={{ width: 16, height: 16 }}
                >
                  <rect x="2" y="2" width="8" height="8" rx="2" />
                  <rect x="14" y="2" width="8" height="8" rx="2" />
                  <rect x="2" y="14" width="8" height="8" rx="2" />
                  <rect x="14" y="14" width="8" height="8" rx="2" />
                </svg>
              </div>
              <div className="sf-list-body">
                <div className="sf-list-title">{i.name}</div>
                <div className="sf-list-sub">{i.description}</div>
                <div className="sf-list-meta">{i.base_url}</div>
              </div>
              <Pill status={i.is_active ? "Active" : "Inactive"} />
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

/* ════════════════════════════════════════════════════
   ENDPOINTS LIST — browse what Dime can call
════════════════════════════════════════════════════ */
function EndpointsList({ onClose }) {
  const [connId, setConnId] = useState("");
  const [eps, setEps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  const load = async () => {
    if (!connId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const r = await getConnectionEndpoints(connId.trim());
      setEps(r.data?.endpoints || r.data || []);
    } catch (err) {
      setError(parseError(err));
      setEps([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = eps.filter(
    (e) =>
      !search ||
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.path?.toLowerCase().includes(search.toLowerCase()),
  );

  const MC = {
    GET: "#22c55e",
    POST: "#3bd2f0",
    PUT: "#f59e0b",
    PATCH: "#a78bfa",
    DELETE: "#f85149",
  };

  return (
    <Modal
      title="Endpoints"
      subtitle="Registered API endpoints Dime can call"
      iconColor="rgba(59,210,240,0.1)"
      iconTc="#3bd2f0"
      icon={
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      }
      onClose={onClose}
      wide
    >
      <AiHint action='call an endpoint — e.g. "Check loan balance for customer 254791305299"' />
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          className="sf-input"
          style={{ flex: 1 }}
          placeholder="Connection ID (UUID)…"
          value={connId}
          onChange={(e) => setConnId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
        />
        <button
          className="sf-btn sf-btn-outline"
          onClick={load}
          style={{ padding: "10px 14px", flexShrink: 0 }}
        >
          <Refresh />
        </button>
      </div>
      {!connId && (
        <Alert type="info">
          Enter a connection UUID to browse its registered endpoints.
        </Alert>
      )}
      {error && <Alert type="error">{error}</Alert>}
      {eps.length > 0 && (
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Filter endpoints…"
        />
      )}
      {loading ? (
        <Skeleton rows={3} />
      ) : filtered.length > 0 ? (
        <div className="sf-list">
          {filtered.map((e, i) => {
            const m = e.method || "GET";
            return (
              <div key={e.id || i} className="sf-list-item">
                <div
                  style={{
                    padding: "2px 8px",
                    borderRadius: 5,
                    fontSize: 10,
                    fontWeight: 700,
                    flexShrink: 0,
                    background: `${MC[m]}20`,
                    color: MC[m],
                  }}
                >
                  {m}
                </div>
                <div className="sf-list-body">
                  <div className="sf-list-title">
                    {e.display_name || e.name}
                  </div>
                  <div
                    className="sf-list-sub"
                    style={{ fontFamily: "monospace", fontSize: 11 }}
                  >
                    {e.path}
                  </div>
                  {e.description && (
                    <div className="sf-list-meta">{e.description}</div>
                  )}
                  {e.tags?.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                        flexWrap: "wrap",
                        marginTop: 4,
                      }}
                    >
                      {e.tags.map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: 10,
                            background: "rgba(59,210,240,0.08)",
                            color: "#3bd2f0",
                            borderRadius: 4,
                            padding: "1px 6px",
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {e.ai_hint && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "#475569",
                        marginTop: 4,
                        fontStyle: "italic",
                      }}
                    >
                      💬 "{e.ai_hint}"
                    </div>
                  )}
                </div>
                {e.requires_confirmation && (
                  <span
                    style={{
                      fontSize: 10,
                      color: "#f59e0b",
                      border: "1px solid rgba(245,158,11,0.3)",
                      borderRadius: 4,
                      padding: "1px 6px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Needs confirm
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : connId && !loading ? (
        <div className="sf-empty">
          <div className="sf-empty-title">No endpoints found</div>
        </div>
      ) : null}
    </Modal>
  );
}

/* ════════════════════════════════════════════════════
   ROUTER
════════════════════════════════════════════════════ */

// Move renderForm OUTSIDE the component as a regular function
function renderForm(label, onClose, onSuccess, extra = {}, push) {
  const p = { onClose, onSuccess, ...extra };
  switch (label) {
    // ── Tasks (created by AI, read-only here) ─────────────────────────────────
    case "All tasks":
      return <AllTasksList {...p} filter="all" />;
    case "Pending":
      return <AllTasksList {...p} filter="pending" />;
    case "Completed":
      return <AllTasksList {...p} filter="completed" />;
    case "Overdue":
      return <AllTasksList {...p} filter="overdue" />;

    // ── Meetings (created by AI, read-only here) ──────────────────────────────
    case "Upcoming":
      return <MeetingsList {...p} filter="upcoming" />;
    case "Past meetings":
      return <MeetingsList {...p} filter="past" />;

    // ── Email (sent by AI, read-only here) ───────────────────────────────────
    case "Send email":
    case "Sent emails":
    case "Inbox":
      return <EmailList {...p} folder={label === "Inbox" ? "inbox" : "sent"} />;
    case "Drafts":
      return <EmailList {...p} folder="drafts" />;

    // ── Documents (uploaded by AI or via drag-drop in chat) ──────────────────
    case "All documents":
    case "Download":
      return (
        <DocumentsList
          {...p}
          onRead={(id) => push("Read document", { initialDocId: id })}
        />
      );
    case "Read document":
      return (
        <ReadDocumentForm {...p} initialDocId={extra.initialDocId || ""} />
      );
    case "AI Responses":
    case "AI Activity":
      return <AIResponses {...p} />;

    // ── Connections (user configures, AI uses) ────────────────────────────────
    case "All connections":
      return (
        <ConnectionsList
          {...p}
          filter="all"
          onAddNew={() => push("+ Add connection")}
        />
      );
    case "OAuth2":
      return (
        <ConnectionsList
          {...p}
          filter="oauth2"
          onAddNew={() => push("+ Add connection")}
        />
      );
    case "API key":
      return (
        <ConnectionsList
          {...p}
          filter="api_key"
          onAddNew={() => push("+ Add connection")}
        />
      );
    case "+ Add connection":
      return <AddConnectionForm {...p} />;

    // ── Integrations (read-only list) ─────────────────────────────────────────
    case "All integrations":
      return <IntegrationsList {...p} filter="all" />;
    case "Active":
      return <IntegrationsList {...p} filter="active" />;

    // ── Endpoints (browse what AI can call) ───────────────────────────────────
    case "List endpoints":
    case "Search":
      return <EndpointsList {...p} />;

    default:
      console.warn("Unknown form label:", label);
      return null;
  }
}

export default function SidebarFormRouter({ activeSub, onClose, onSuccess }) {
  const [stack, setStack] = useState([]);
  const push = (label, extra = {}) => setStack((s) => [...s, { label, extra }]);
  const pop = () => setStack((s) => s.slice(0, -1));

  if (stack.length > 0) {
    const { label, extra } = stack[stack.length - 1];
    const dismiss = () => {
      if (stack.length > 1) pop();
      else {
        setStack([]);
        onClose();
      }
    };
    return renderForm(
      label,
      dismiss,
      () => {
        setStack([]);
        onSuccess?.();
      },
      extra,
      push,
    );
  }
  if (!activeSub) return null;
  return renderForm(activeSub, onClose, onSuccess, {}, push);
}
