// NotificationsPage.jsx - Full Page Version with Proper Spacing
import { useState } from "react";
import "../styles/notifications.css";

/* ════════════════════════════════════════════════════════════════
   CONSTANTS & MOCK DATA
════════════════════════════════════════════════════════════════ */
const FILTERS = ["All", "Tasks", "Meetings", "Email", "System"];

const ALL_NOTIFS = [
  {
    id: 1,
    type: "task",
    title: "Task completed",
    desc: "You marked 'Review Q4 financial report' as completed",
    time: "5 minutes ago",
    unread: true,
    color: "#3bd2f0",
    tc: "#3bd2f0",
  },
  {
    id: 2,
    type: "meeting",
    title: "Meeting reminder",
    desc: "Board meeting starts in 30 minutes",
    time: "1 hour ago",
    unread: true,
    color: "#22c55e",
    tc: "#22c55e",
  },
  {
    id: 3,
    type: "email",
    title: "Email sent",
    desc: "Dime sent an email to charlesdete47@gmail.com about Q3 updates",
    time: "2 hours ago",
    unread: false,
    color: "#f59e0b",
    tc: "#f59e0b",
  },
  {
    id: 4,
    type: "system",
    title: "Integration connected",
    desc: "Loan Management System connected successfully",
    time: "Yesterday",
    unread: false,
    color: "#a78bfa",
    tc: "#a78bfa",
  },
  {
    id: 5,
    type: "task",
    title: "Task overdue",
    desc: "'Submit board report' is now overdue",
    time: "Yesterday",
    unread: false,
    color: "#f85149",
    tc: "#f85149",
  },
  {
    id: 6,
    type: "meeting",
    title: "Meeting scheduled",
    desc: "Dime scheduled 'Strategy Review' for tomorrow at 10:00 AM",
    time: "Yesterday",
    unread: false,
    color: "#22c55e",
    tc: "#22c55e",
  },
];

/* ════════════════════════════════════════════════════════════════
   ICON COMPONENTS
════════════════════════════════════════════════════════════════ */
const NotifIcon = ({ type, color, tc }) => {
  const icons = {
    task: (
      <svg viewBox="0 0 24 24" fill="none" stroke={tc} strokeWidth="2">
        <rect x="3" y="5" width="6" height="6" rx="1" />
        <polyline points="9.5 11 11 12.5 14.5 9" />
        <line x1="17" y1="7" x2="21" y2="7" />
      </svg>
    ),
    meeting: (
      <svg viewBox="0 0 24 24" fill="none" stroke={tc} strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    email: (
      <svg viewBox="0 0 24 24" fill="none" stroke={tc} strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <polyline points="2 7 12 13 22 7" />
      </svg>
    ),
    system: (
      <svg viewBox="0 0 24 24" fill="none" stroke={tc} strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  };
  return (
    <div
      className="notif-icon-wrapper"
      style={{ background: `${color}15`, borderColor: `${color}30` }}
    >
      {icons[type] || icons.system}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   MAIN NOTIFICATIONS PAGE
════════════════════════════════════════════════════════════════ */
export default function NotificationsPage({ onBack }) {
  const [filter, setFilter] = useState("All");
  const [notifs, setNotifs] = useState(ALL_NOTIFS);

  const getFilterType = (filter) => {
    const map = {
      Tasks: "task",
      Meetings: "meeting",
      Email: "email",
      System: "system",
    };
    return map[filter] || null;
  };

  const filtered =
    filter === "All"
      ? notifs
      : notifs.filter((n) => n.type === getFilterType(filter));

  const markAllRead = () =>
    setNotifs((n) => n.map((x) => ({ ...x, unread: false })));
  const markRead = (id) =>
    setNotifs((n) => n.map((x) => (x.id === id ? { ...x, unread: false } : x)));
  const unreadCount = notifs.filter((n) => n.unread).length;

  return (
    <div className="notifications-page-container">
      {/* Page Header */}
      <div className="notifications-page-header">
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
            <h1>Notifications</h1>
            <p>
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "All caught up"}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button className="mark-all-btn" onClick={markAllRead}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Mark all read
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="notifications-main-content">
        {/* Left Column - Filters & Preferences */}
        <div className="notifications-sidebar">
          {/* Filter Section */}
          <div className="filter-card">
            <div className="card-header">
              <span className="card-icon">🔍</span>
              <h3>Filter by</h3>
            </div>
            <div className="filter-list">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  className={`filter-btn ${filter === f ? "active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                  {filter === f && unreadCount > 0 && f === "All" && (
                    <span className="filter-count">{unreadCount}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preferences Card */}
          <div className="preferences-card">
            <div className="card-header">
              <span className="card-icon">⚙️</span>
              <h3>Notification preferences</h3>
            </div>
            <p className="card-subtitle">
              Choose which events trigger notifications
            </p>

            <div className="preferences-list">
              {[
                {
                  label: "Task updates",
                  sub: "Created, completed, or overdue tasks",
                  key: "tasks",
                  default: true,
                },
                {
                  label: "Meeting reminders",
                  sub: "30 min before every scheduled meeting",
                  key: "meetings",
                  default: true,
                },
                {
                  label: "Email activity",
                  sub: "Sent, bounced, or replied emails",
                  key: "emails",
                  default: true,
                },
                {
                  label: "Integration alerts",
                  sub: "API errors, reconnects, usage limits",
                  key: "integrations",
                  default: true,
                },
                {
                  label: "AI activity",
                  sub: "When Dime executes an action on your behalf",
                  key: "ai",
                  default: true,
                },
              ].map((item) => (
                <div className="preference-item" key={item.key}>
                  <div className="preference-info">
                    <div className="preference-label">{item.label}</div>
                    <div className="preference-desc">{item.sub}</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked={item.default} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Notifications List */}
        <div className="notifications-list-container">
          <div className="notifications-header">
            <h3>Recent activity</h3>
            <span className="notifications-count">
              {filtered.length} notification{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="notifications-list">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔔</div>
                <h4>No notifications</h4>
                <p>No notifications in this category</p>
              </div>
            ) : (
              filtered.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item ${notif.unread ? "unread" : ""}`}
                  onClick={() => markRead(notif.id)}
                >
                  <NotifIcon
                    type={notif.type}
                    color={notif.color}
                    tc={notif.tc}
                  />
                  <div className="notification-content">
                    <div className="notification-header">
                      <div className="notification-title">{notif.title}</div>
                      <div className="notification-time">{notif.time}</div>
                    </div>
                    <div className="notification-description">{notif.desc}</div>
                  </div>
                  {notif.unread && <div className="unread-indicator" />}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
