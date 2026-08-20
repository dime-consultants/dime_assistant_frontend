import React, { useState, useEffect, createContext, useContext } from "react";
import UserProfilePopup from "./Userprofilepopup";
import SidebarFormRouter from "./Sidebarforms.jsx";
import { useTheme } from "../context/ThemeContext";

const AIDataContext = createContext();

// Provider component - THIS IS WHAT App.jsx IS LOOKING FOR
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

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const deleteMeeting = (id) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
  };

  const updateTask = (id, updates) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    );
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
        deleteTask,
        deleteMeeting,
        updateTask,
      }}
    >
      {children}
    </AIDataContext.Provider>
  );
}

// Hook to use the data - ALSO NEEDED
export const useAIData = () => {
  const context = useContext(AIDataContext);
  if (!context) {
    throw new Error("useAIData must be used within AIDataProvider");
  }
  return context;
};
const SECTIONS = [
  {
    id: "workspace",
    label: "Workspace",
    items: [
      {
        id: "tasks",
        label: "Tasks",
        badge: null, // badge updated dynamically by AllTasksList
        icon: <TasksIcon />,
        sub: [
          { label: "All tasks" },
          { label: "Pending" },
          { label: "Completed" },
          { label: "Overdue" },
          // No "+ Create task" — tell Dime in chat
        ],
      },
      {
        id: "meetings",
        label: "Meetings",
        icon: <MeetingsIcon />,
        sub: [
          { label: "Upcoming" },
          { label: "Past meetings" },
          // No "+ Schedule" — tell Dime in chat
        ],
      },
      {
        id: "email",
        label: "Email",
        icon: <EmailIcon />,
        sub: [
          { label: "Sent emails" }, // ← shows emails AI sent
          { label: "Inbox" },
          { label: "Drafts" },
          // No "Send email" form — tell Dime in chat
        ],
      },
      {
        id: "documents",
        label: "Documents",
        icon: <DocsIcon />,
        sub: [
          { label: "All documents" },
          { label: "Read document" },
          { label: "Download" },
          // No "Upload" form — tell Dime in chat
        ],
      },
    ],
  },
  {
    id: "integrations",
    label: "Integrations",
    items: [
      {
        id: "connections",
        label: "Connections",
        icon: <ConnectionsIcon />,
        sub: [
          { label: "All connections" },
          { label: "OAuth2" },
          { label: "API key" },
          { label: "+ Add connection", isAction: true }, // only manual action kept
        ],
      },
      {
        id: "integrations-item",
        label: "Integrations",
        icon: <IntegrationsIcon />,
        sub: [
          { label: "All integrations" },
          { label: "Active" },
          // No "Use integration" — tell Dime in chat
        ],
      },
      {
        id: "endpoints",
        label: "Endpoints",
        icon: <EndpointsIcon />,
        sub: [
          { label: "List endpoints" },
          { label: "Search" },
          // No "Execute" — tell Dime in chat
        ],
      },
    ],
  },
];

// handleSubClick — no FORM_TRIGGERS needed, all items open the panel
const handleSubClick = (label) => {
  setActiveSub(label);
  setOpenForm(label); // every sub-item opens the panel
};

// ── Component ──────────────────────────────────────────────────────────────
export default function Sidebar({
  collapsed,
  user,
  onLogout,
  onSettings,
  threads = [],
  activeThreadId,
  onNewThread,
  onSelectThread,
}) {
  const { theme, mode } = useTheme();
  const [openSecs, setOpenSecs] = useState({
    workspace: true,
    integrations: true,
    history: true,
  });
  const [openItems, setOpenItems] = useState({ tasks: true });
  const [activeItem, setActiveItem] = useState("tasks");
  const [activeSub, setActiveSub] = useState("All tasks");
  const [profileOpen, setProfileOpen] = useState(false);
  const [openForm, setOpenForm] = useState(null);

  const toggleSec = (id) =>
    !collapsed && setOpenSecs((p) => ({ ...p, [id]: !p[id] }));
  const toggleItem = (id) =>
    !collapsed && setOpenItems((p) => ({ ...p, [id]: !p[id] }));

  const handleSubClick = (label) => {
    setActiveSub(label);
    setOpenForm(label); // ← ALL sub-items now open the panel
  };

  const closeForm = () => setOpenForm(null);
  // In Sidebarforms.jsx, update the renderForm function:

  function renderForm(label, onClose, onSuccess, extra = {}, push) {
    console.log("[renderForm] Rendering form for label:", label);

    const p = { onClose, onSuccess, ...extra };

    switch (label) {
      // Tasks
      case "All tasks":
        return <AllTasksList key="all-tasks" {...p} filter="all" />;
      case "Pending":
        return <AllTasksList key="pending-tasks" {...p} filter="pending" />;
      case "Completed":
        return <AllTasksList key="completed-tasks" {...p} filter="completed" />;
      case "Overdue":
        return <AllTasksList key="overdue-tasks" {...p} filter="overdue" />;

      // Meetings
      case "Upcoming":
        return (
          <MeetingsList key="upcoming-meetings" {...p} filter="upcoming" />
        );
      case "Past meetings":
        return <MeetingsList key="past-meetings" {...p} filter="past" />;

      // Email
      case "Sent emails":
        return <EmailList key="sent-emails" {...p} folder="sent" />;
      case "Inbox":
        return <EmailList key="inbox" {...p} folder="inbox" />;
      case "Drafts":
        return <EmailList key="drafts" {...p} folder="drafts" />;

      // Documents
      case "All documents":
      case "Download":
        return (
          <DocumentsList
            key="documents"
            {...p}
            onRead={(id) => push("Read document", { initialDocId: id })}
          />
        );
      case "Read document":
        return (
          <ReadDocumentForm
            key="read-doc"
            {...p}
            initialDocId={extra.initialDocId || ""}
          />
        );
      case "AI Responses":
      case "AI Activity":
        return <AIResponses key="ai-responses" {...p} />;

      // Connections
      case "All connections":
        return (
          <ConnectionsList
            key="all-connections"
            {...p}
            filter="all"
            onAddNew={() => push("+ Add connection")}
          />
        );
      case "OAuth2":
        return (
          <ConnectionsList
            key="oauth2-connections"
            {...p}
            filter="oauth2"
            onAddNew={() => push("+ Add connection")}
          />
        );
      case "API key":
        return (
          <ConnectionsList
            key="apikey-connections"
            {...p}
            filter="api_key"
            onAddNew={() => push("+ Add connection")}
          />
        );
      case "+ Add connection":
        return <AddConnectionForm key="add-connection" {...p} />;

      // Integrations
      case "All integrations":
        return <IntegrationsList key="all-integrations" {...p} filter="all" />;
      case "Active":
        return (
          <IntegrationsList key="active-integrations" {...p} filter="active" />
        );

      // Endpoints
      case "List endpoints":
      case "Search":
        return <EndpointsList key="endpoints" {...p} />;

      default:
        console.warn("[renderForm] Unknown form label:", label);
        // Return a fallback component that shows the error
        return (
          <Modal
            title="Not implemented"
            subtitle={`"${label}" form is not available yet`}
            iconColor="rgba(248,81,73,0.1)"
            iconTc="#f85149"
            icon={<X />}
            onClose={onClose}
          >
            <div className="sf-empty">
              <div className="sf-empty-title">Form not found</div>
              <div className="sf-empty-sub">
                The form for "{label}" hasn't been implemented yet.
              </div>
            </div>
          </Modal>
        );
    }
  }

  return (
    <>
      <aside className={`ci-left ${collapsed ? "collapsed" : ""}`}>
        {/* Logo */}
        <div className="ci-logo">
          <div className="ci-logo-icon">D</div>
          {!collapsed && (
            <div>
              <div className="ci-logo-text">Dime Executive</div>
              <div className="ci-logo-sub">AI Assistant</div>
            </div>
          )}
        </div>

        {/* New chat */}
        <button
          className="ci-new-chat"
          onClick={onNewThread}
          style={
            collapsed
              ? {
                  justifyContent: "center",
                  padding: "8px 0",
                  margin: "10px 8px 4px",
                }
              : {}
          }
        >
          <PlusIcon />
          {!collapsed && <span>New chat</span>}
        </button>

        {/* Scrollable nav */}
        <div className="ci-history" style={{ flex: 1, overflowY: "auto" }}>
          {SECTIONS.map((sec) => (
            <div key={sec.id}>
              {/* Section header */}
              <div
                className="ci-section-header"
                onClick={() => toggleSec(sec.id)}
                style={
                  collapsed
                    ? { justifyContent: "center", padding: "8px 0 4px" }
                    : {}
                }
              >
                {!collapsed && (
                  <>
                    <span>{sec.label}</span>
                    <ChevronIcon open={openSecs[sec.id]} size={12} />
                  </>
                )}
              </div>

              {/* Section body */}
              <div
                style={{
                  overflow: "hidden",
                  maxHeight: collapsed || openSecs[sec.id] ? 999 : 0,
                  transition: "max-height .25s ease",
                }}
              >
                {sec.items.map((item) => {
                  const itemOpen = collapsed || openItems[item.id];
                  const isActive = activeItem === item.id;
                  return (
                    <div key={item.id}>
                      {/* Parent row */}
                      <div
                        className={`ci-chat-item${isActive ? " active" : ""}`}
                        title={collapsed ? item.label : undefined}
                        onClick={() => {
                          setActiveItem(item.id);
                          toggleItem(item.id);
                        }}
                        style={
                          collapsed
                            ? {
                                justifyContent: "center",
                                padding: "8px 0",
                                margin: "1px 8px",
                              }
                            : {
                                display: "flex",
                                alignItems: "center",
                                gap: 9,
                                padding: "7px 10px 7px 12px",
                                margin: "1px 6px",
                              }
                        }
                      >
                        <span
                          style={{
                            width: 16,
                            height: 16,
                            flexShrink: 0,
                            display: "flex",
                            stroke: isActive
                              ? "var(--brand)"
                              : "var(--text-muted)",
                          }}
                        >
                          {item.icon}
                        </span>
                        {!collapsed && (
                          <>
                            <span
                              className="ci-chat-name"
                              style={{
                                flex: 1,
                                color: isActive ? "var(--brand)" : undefined,
                                fontWeight: isActive ? 600 : undefined,
                              }}
                            >
                              {item.label}
                            </span>
                            {item.badge && <NavBadge>{item.badge}</NavBadge>}
                            <ChevronIcon open={itemOpen} size={11} />
                          </>
                        )}
                      </div>

                      {/* Sub-items */}
                      <div
                        style={{
                          overflow: "hidden",
                          maxHeight: itemOpen ? 999 : 0,
                          transition: "max-height .2s ease",
                        }}
                      >
                        {item.sub.map((s) => {
                          const isSubActive = activeSub === s.label;
                          const isOpen = openForm === s.label;
                          return (
                            <div
                              key={s.label}
                              onClick={() => handleSubClick(s.label)}
                              title={collapsed ? s.label : undefined}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                cursor: "pointer",
                                padding: collapsed
                                  ? "5px 0"
                                  : "6px 12px 6px 34px",
                                margin: collapsed ? "0 8px" : "0 6px",
                                borderRadius: 7,
                                transition: "background .12s",
                                background: isSubActive
                                  ? "var(--brand-dim)"
                                  : "transparent",
                                justifyContent: collapsed
                                  ? "center"
                                  : undefined,
                              }}
                            >
                              {!collapsed && (
                                <>
                                  {/* Dot — filled when active */}
                                  <div
                                    style={{
                                      width: 5,
                                      height: 5,
                                      borderRadius: "50%",
                                      flexShrink: 0,
                                      background: isSubActive
                                        ? "var(--brand)"
                                        : "var(--text-faint)",
                                    }}
                                  />

                                  <span
                                    style={{
                                      fontSize: 11,
                                      flex: 1,
                                      color:
                                        isSubActive || s.isAction
                                          ? "var(--brand)"
                                          : "var(--text-muted)",
                                      fontWeight:
                                        isSubActive || s.isAction
                                          ? 600
                                          : undefined,
                                    }}
                                  >
                                    {s.label}
                                  </span>

                                  {s.badge && (
                                    <span
                                      style={{
                                        fontSize: 10,
                                        fontWeight: 600,
                                        color: "var(--text-muted)",
                                        background: "var(--bg-raised)",
                                        border: "1px solid var(--border)",
                                        borderRadius: 8,
                                        padding: "0 5px",
                                      }}
                                    >
                                      {s.badge}
                                    </span>
                                  )}

                                  {/* Chevron — rotated when panel is open */}
                                  <svg
                                    width="10"
                                    height="10"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke={
                                      isSubActive
                                        ? "var(--brand)"
                                        : "var(--text-faint)"
                                    }
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{
                                      flexShrink: 0,
                                      transition: "transform .15s",
                                      transform: isOpen
                                        ? "rotate(90deg)"
                                        : "none",
                                    }}
                                  >
                                    <polyline points="9 18 15 12 9 6" />
                                  </svg>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Chat history */}
          <div style={{ marginTop: 6 }}>
            <div
              className="ci-section-header"
              onClick={() => toggleSec("history")}
              style={
                collapsed
                  ? { justifyContent: "center", padding: "8px 0 4px" }
                  : {}
              }
            >
              {!collapsed && (
                <>
                  <span>Chat history</span>
                  <ChevronIcon open={openSecs.history} size={12} />
                </>
              )}
            </div>
            <div
              style={{
                overflow: "hidden",
                maxHeight: collapsed || openSecs.history ? 999 : 0,
                transition: "max-height .25s ease",
              }}
            >
              {threads.length === 0 && !collapsed && (
                <div
                  style={{
                    padding: "8px 16px",
                    fontSize: 11,
                    color: "var(--text-faint)",
                  }}
                >
                  No chats yet
                </div>
              )}
              {threads.map((t) => {
                const isActive = activeThreadId === t.id;
                const label = t.name || "New chat";
                const date = t.created_at
                  ? new Date(t.created_at).toLocaleDateString("en-KE", {
                      day: "numeric",
                      month: "short",
                    })
                  : "";
                return (
                  <div
                    key={t.id}
                    className={`ci-chat-item${isActive ? " active" : ""}`}
                    onClick={() => onSelectThread?.(t.id)}
                    title={collapsed ? label : undefined}
                    style={
                      collapsed
                        ? {
                            justifyContent: "center",
                            padding: "7px 0",
                            margin: "1px 8px",
                          }
                        : {}
                    }
                  >
                    <div
                      className={`ci-chat-dot${isActive ? " active-dot" : ""}`}
                    />
                    {!collapsed && (
                      <>
                        <span
                          className="ci-chat-name"
                          style={{
                            color: isActive ? "var(--brand)" : undefined,
                          }}
                        >
                          {label}
                        </span>
                        <span className="ci-chat-date">{date}</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="ci-left-footer"
          style={{
            borderTop: "1px solid var(--border)",
            padding: 10,
            flexShrink: 0,
          }}
        >
          <div
            className="ci-user-row"
            onClick={() => setProfileOpen(true)}
            title="View profile"
            style={
              collapsed
                ? {
                    justifyContent: "center",
                    padding: "8px 0",
                    cursor: "pointer",
                  }
                : { cursor: "pointer" }
            }
          >
            <div
              className="ci-avatar"
              style={{
                border: "2px solid rgba(59,210,240,.3)",
                color: "#0d1117",
                flexShrink: 0,
                transition: "box-shadow .2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 0 0 4px rgba(59,210,240,0.18)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              {user?.initials || "EX"}
            </div>
            {!collapsed && (
              <>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div className="ci-user-name">
                    {user?.name || "Executive User"}
                  </div>
                  <div className="ci-user-role">
                    {user?.role || "Administrator"}
                  </div>
                </div>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--green)",
                    flexShrink: 0,
                    border: "2px solid var(--bg-surface)",
                  }}
                />
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Profile popup */}
      <UserProfilePopup
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onLogout={onLogout}
        onSettings={onSettings}
        user={user}
      />

      {/* ── Form/list panel ──────────────────────────────────────────────────
          SidebarFormRouter maps every label string to the right component.
          activeSub={null} renders nothing (panel closed).
      ─────────────────────────────────────────────────────────────────────── */}
      <SidebarFormRouter
        activeSub={openForm}
        onClose={closeForm}
        onSuccess={closeForm}
      />
    </>
  );
}

// ── Icon / helper components ───────────────────────────────────────────────
function ChevronIcon({ open, size = 12 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{
        color: "var(--text-muted)",
        flexShrink: 0,
        transition: "transform .2s",
        transform: open ? "none" : "rotate(-90deg)",
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// Renamed to avoid clash with Badge in SidebarForms
function NavBadge({ children }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        background: "var(--brand)",
        color: "#0d1117",
        borderRadius: 10,
        padding: "1px 6px",
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  );
}

function PlusIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#0d1117"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function TasksIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="6" height="6" rx="1" />
      <polyline points="9.5 11 11 12.5 14.5 9" />
      <rect x="3" y="13" width="6" height="6" rx="1" />
      <polyline points="9.5 19 11 20.5 14.5 17" />
      <line x1="17" y1="7" x2="21" y2="7" />
      <line x1="17" y1="15" x2="21" y2="15" />
    </svg>
  );
}
function MeetingsIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function EmailIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="2 7 12 13 22 7" />
    </svg>
  );
}
function DocsIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
    </svg>
  );
}
function ConnectionsIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="12" r="3" />
      <circle cx="19" cy="5" r="2" />
      <circle cx="19" cy="19" r="2" />
      <line x1="12" y1="12" x2="17" y2="6" />
      <line x1="12" y1="12" x2="17" y2="18" />
    </svg>
  );
}
function IntegrationsIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="8" height="8" rx="2" />
      <rect x="14" y="2" width="8" height="8" rx="2" />
      <rect x="2" y="14" width="8" height="8" rx="2" />
      <rect x="14" y="14" width="8" height="8" rx="2" />
    </svg>
  );
}
function EndpointsIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
