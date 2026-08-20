// Settings.jsx
import { useState } from "react";
import "../styles/pages.css";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

const TABS = [
  { id: "profile", label: "Profile", icon: "👤" },
  { id: "notifications", label: "Notifications", icon: "🔔" },
  { id: "integrations", label: "Integrations", icon: "🔌" },
  { id: "security", label: "Security", icon: "🔒" },
  { id: "appearance", label: "Appearance", icon: "🎨" },
];

function ProfileTab({ user }) {
  return (
    <div>
      <div className="pg-card">
        <div className="pg-card-title">Profile information</div>
        <div className="pg-card-sub">
          Your public profile visible to connected team members.
        </div>

        <div className="settings-avatar-section">
          <div className="settings-avatar-wrapper">
            <div className="settings-avatar">{user?.initials || "EX"}</div>
            <button className="settings-avatar-edit">📷</button>
          </div>
          <div className="settings-avatar-info">
            <h3>{user?.name || "Executive User"}</h3>
            <p>{user?.email || "executive@company.com"}</p>
          </div>
        </div>

        <div className="settings-form-grid">
          <div className="settings-field">
            <label className="settings-input-label">First name</label>
            <input
              className="settings-input"
              defaultValue={user?.name?.split(" ")[0] || "Executive"}
              placeholder="First name"
            />
          </div>
          <div className="settings-field">
            <label className="settings-input-label">Last name</label>
            <input
              className="settings-input"
              defaultValue={user?.name?.split(" ")[1] || "User"}
              placeholder="Last name"
            />
          </div>
          <div className="settings-field full-width">
            <label className="settings-input-label">Email address</label>
            <input
              className="settings-input"
              type="email"
              defaultValue={user?.email || "executive@company.com"}
              placeholder="Email address"
            />
          </div>
          <div className="settings-field">
            <label className="settings-input-label">Job title</label>
            <input
              className="settings-input"
              defaultValue={user?.role || "Chief Executive Officer"}
              placeholder="Job title"
            />
          </div>
          <div className="settings-field">
            <label className="settings-input-label">Company</label>
            <input
              className="settings-input"
              defaultValue="Dime Executive Ltd"
              placeholder="Company"
            />
          </div>
          <div className="settings-field full-width">
            <label className="settings-input-label">Timezone</label>
            <select className="settings-select">
              <option>Africa/Nairobi (EAT, UTC+3)</option>
              <option>UTC</option>
              <option>America/New_York (EST)</option>
              <option>Europe/London (GMT)</option>
              <option>Asia/Dubai (GST)</option>
              <option>Asia/Tokyo (JST)</option>
            </select>
          </div>
        </div>

        <div className="settings-actions">
          <button className="pg-btn pg-btn-primary">Save changes</button>
          <button className="pg-btn pg-btn-outline">Discard</button>
        </div>
      </div>

      <div className="pg-card">
        <div className="pg-card-title">AI assistant preferences</div>
        <div className="pg-card-sub">
          Customize how Dime responds and behaves.
        </div>

        <div className="settings-preferences">
          <div className="settings-preference-item">
            <div className="settings-preference-info">
              <div className="settings-preference-label">Response style</div>
              <div className="settings-preference-desc">
                How detailed Dime's responses should be
              </div>
            </div>
            <select className="settings-select-small">
              <option>Concise</option>
              <option>Detailed</option>
              <option selected>Executive brief</option>
            </select>
          </div>

          <div className="settings-preference-item">
            <div className="settings-preference-info">
              <div className="settings-preference-label">Default language</div>
              <div className="settings-preference-desc">
                Primary language for responses
              </div>
            </div>
            <select className="settings-select-small">
              <option selected>English (US)</option>
              <option>English (UK)</option>
              <option>Swahili</option>
              <option>French</option>
            </select>
          </div>
        </div>

        <div className="settings-divider"></div>

        <div className="settings-toggle-group">
          <div className="settings-toggle-item">
            <div>
              <div className="settings-toggle-label">Proactive suggestions</div>
              <div className="settings-toggle-desc">
                Let Dime suggest actions based on your patterns
              </div>
            </div>
            <label className="pg-toggle">
              <input type="checkbox" defaultChecked />
              <div className="pg-toggle-track" />
              <div className="pg-toggle-thumb" />
            </label>
          </div>

          <div className="settings-toggle-item">
            <div>
              <div className="settings-toggle-label">
                Auto-execute safe actions
              </div>
              <div className="settings-toggle-desc">
                Dime creates tasks & drafts without confirmation
              </div>
            </div>
            <label className="pg-toggle">
              <input type="checkbox" defaultChecked />
              <div className="pg-toggle-track" />
              <div className="pg-toggle-thumb" />
            </label>
          </div>

          <div className="settings-toggle-item">
            <div>
              <div className="settings-toggle-label">Context memory</div>
              <div className="settings-toggle-desc">
                Remember previous conversation context
              </div>
            </div>
            <label className="pg-toggle">
              <input type="checkbox" defaultChecked />
              <div className="pg-toggle-track" />
              <div className="pg-toggle-thumb" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const [notifications, setNotifications] = useState([
    {
      id: "inapp",
      label: "In-app notifications",
      desc: "Show alerts inside the Dime dashboard",
      enabled: true,
    },
    {
      id: "email",
      label: "Email notifications",
      desc: "Receive a daily digest to your inbox",
      enabled: true,
    },
    {
      id: "push",
      label: "Browser push",
      desc: "Desktop notifications when Dime acts",
      enabled: false,
    },
    {
      id: "task",
      label: "Task reminders",
      desc: "Notify me before task deadlines",
      enabled: true,
    },
    {
      id: "meeting",
      label: "Meeting reminders",
      desc: "Alert 30 minutes before scheduled meetings",
      enabled: true,
    },
    {
      id: "integration",
      label: "Integration alerts",
      desc: "Warn me when an API connection fails",
      enabled: true,
    },
    {
      id: "digest",
      label: "AI action digest",
      desc: "Daily summary of everything Dime did for you",
      enabled: false,
    },
    {
      id: "marketing",
      label: "Marketing updates",
      desc: "Product news, tips, and feature announcements",
      enabled: false,
    },
  ]);

  const toggleNotification = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n)),
    );
  };

  return (
    <div className="pg-card">
      <div className="pg-card-title">Notification channels</div>
      <div className="pg-card-sub">
        Choose where and how you receive notifications.
      </div>

      <div className="notifications-list">
        {notifications.map((item) => (
          <div className="notification-item" key={item.id}>
            <div className="notification-info">
              <div className="notification-label">{item.label}</div>
              <div className="notification-desc">{item.desc}</div>
            </div>
            <label className="pg-toggle">
              <input
                type="checkbox"
                checked={item.enabled}
                onChange={() => toggleNotification(item.id)}
              />
              <div className="pg-toggle-track" />
              <div className="pg-toggle-thumb" />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function IntegrationsTab() {
  const integrations = [
    {
      name: "Loan Management System",
      type: "REST · OAuth2",
      status: "connected",
      connected: true,
    },
    {
      name: "Google Calendar",
      type: "CalDAV · OAuth2",
      status: "connected",
      connected: true,
    },
    {
      name: "Company Email (SMTP)",
      type: "SMTP · TLS",
      status: "connected",
      connected: true,
    },
    {
      name: "Document Store (S3)",
      type: "REST · API Key",
      status: "error",
      connected: false,
      error: "Token expired",
    },
    {
      name: "CRM System",
      type: "REST · Bearer",
      status: "disconnected",
      connected: false,
    },
  ];

  return (
    <div>
      <div className="pg-card">
        <div className="pg-card-title">Connected integrations</div>
        <div className="pg-card-sub">
          Manage your external system connections.
        </div>

        <div className="integrations-list">
          {integrations.map((item) => (
            <div className="integration-item" key={item.name}>
              <div className="integration-info">
                <div className="integration-icon">
                  {item.status === "connected"
                    ? "✅"
                    : item.status === "error"
                      ? "⚠️"
                      : "🔌"}
                </div>
                <div>
                  <div className="integration-name">{item.name}</div>
                  <div className="integration-type">{item.type}</div>
                  {item.error && (
                    <div className="integration-error">{item.error}</div>
                  )}
                </div>
              </div>
              <div className="integration-actions">
                <span className={`integration-status status-${item.status}`}>
                  {item.status}
                </span>
                <button className="pg-btn pg-btn-outline small">
                  {item.connected ? "Manage" : "Connect"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="add-integration">
          <button className="pg-btn pg-btn-primary">
            <span>+</span> Add integration
          </button>
        </div>
      </div>

      <div className="pg-card">
        <div className="pg-card-title">API usage this month</div>
        <div className="api-stats">
          <div className="api-stat">
            <div className="api-stat-label">Total API calls</div>
            <div className="api-stat-value">1,284</div>
          </div>
          <div className="api-stat">
            <div className="api-stat-label">Successful (200)</div>
            <div className="api-stat-value success">1,271 · 99.0%</div>
          </div>
          <div className="api-stat">
            <div className="api-stat-label">Failed (4xx/5xx)</div>
            <div className="api-stat-value error">13 · 1.0%</div>
          </div>
          <div className="api-stat">
            <div className="api-stat-label">Avg response time</div>
            <div className="api-stat-value">142ms</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityTab() {
  return (
    <div>
      <div className="pg-card">
        <div className="pg-card-title">Password</div>
        <div className="pg-card-sub">
          Update your password to keep your account secure.
        </div>

        <div className="settings-form">
          <div className="settings-field">
            <label className="settings-input-label">Current password</label>
            <input
              className="settings-input"
              type="password"
              placeholder="Enter current password"
            />
          </div>
          <div className="settings-field">
            <label className="settings-input-label">New password</label>
            <input
              className="settings-input"
              type="password"
              placeholder="Min 8 characters"
            />
            <div className="password-strength">
              <div className="strength-bar"></div>
              <div className="strength-bar"></div>
              <div className="strength-bar"></div>
              <div className="strength-bar weak"></div>
              <span className="strength-text">
                Weak - Use at least 8 characters
              </span>
            </div>
          </div>
          <div className="settings-field">
            <label className="settings-input-label">Confirm new password</label>
            <input
              className="settings-input"
              type="password"
              placeholder="Repeat new password"
            />
          </div>
        </div>

        <div className="settings-actions">
          <button className="pg-btn pg-btn-primary">Update password</button>
        </div>
      </div>

      <div className="pg-card">
        <div className="pg-card-title">Two-factor authentication</div>
        <div className="pg-card-sub">
          Add an extra layer of security to your account.
        </div>

        <div className="twofa-options">
          <div className="twofa-option">
            <div>
              <div className="twofa-label">Authenticator app</div>
              <div className="twofa-desc">Google Authenticator or Authy</div>
            </div>
            <button className="pg-btn pg-btn-outline">Enable</button>
          </div>
          <div className="twofa-option">
            <div>
              <div className="twofa-label">SMS verification</div>
              <div className="twofa-desc">Receive codes via SMS</div>
            </div>
            <button className="pg-btn pg-btn-outline">Enable</button>
          </div>
        </div>
      </div>

      <div className="pg-card">
        <div className="pg-card-title">Active sessions</div>
        <div className="pg-card-sub">
          Manage devices where you're logged in.
        </div>

        <div className="sessions-list">
          <div className="session-item current">
            <div className="session-info">
              <div className="session-device">🖥️ Chrome · Nairobi, Kenya</div>
              <div className="session-time">Now · Current session</div>
            </div>
            <span className="session-badge">Current</span>
          </div>
          <div className="session-item">
            <div className="session-info">
              <div className="session-device">📱 Safari · Nairobi, Kenya</div>
              <div className="session-time">2 hours ago</div>
            </div>
            <button className="session-revoke">Revoke</button>
          </div>
          <div className="session-item">
            <div className="session-info">
              <div className="session-device">💻 Mobile · Nairobi, Kenya</div>
              <div className="session-time">Yesterday</div>
            </div>
            <button className="session-revoke">Revoke</button>
          </div>
        </div>
      </div>

      <div className="pg-card danger-zone">
        <div className="pg-card-title">Danger zone</div>
        <div className="danger-zone-content">
          <div className="danger-zone-info">
            <div className="danger-zone-label">Delete account</div>
            <div className="danger-zone-desc">
              Permanently delete your account and all data. This cannot be
              undone.
            </div>
          </div>
          <button className="pg-btn pg-btn-danger">Delete account</button>
        </div>
      </div>
    </div>
  );
}

function AppearanceTab() {
  const { theme, setTheme, mode, setMode } = useTheme();

  const colorOptions = [
    { name: "cyan", color: "#3bd2f0", label: "Cyan" },
    { name: "green", color: "#22c55e", label: "Green" },
    { name: "orange", color: "#f59e0b", label: "Orange" },
    { name: "purple", color: "#a78bfa", label: "Purple" },
    { name: "red", color: "#f87171", label: "Red" },
  ];

  const handleThemeChange = (themeName) => {
    setTheme(themeName);
    window.dispatchEvent(
      new CustomEvent("themeChanged", { detail: { theme: themeName } }),
    );
  };

  return (
    <div className="pg-card">
      <div className="pg-card-title">Theme & appearance</div>
      <div className="pg-card-sub">Customize how Dime looks for you.</div>

      {/* Color Mode Toggle */}
      <div className="appearance-section">
        <div className="appearance-label">Color Mode</div>
        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === "dark" ? "active" : ""}`}
            onClick={() => setMode("dark")}
          >
            🌙 Dark
          </button>
          <button
            className={`mode-btn ${mode === "light" ? "active" : ""}`}
            onClick={() => setMode("light")}
          >
            ☀️ Light
          </button>
        </div>
      </div>

      <div className="settings-divider"></div>

      {/* Accent Color */}
      <div className="appearance-section">
        <div className="appearance-label">Accent Color</div>
        <div className="color-picker">
          {colorOptions.map((opt) => (
            <div
              key={opt.name}
              className={`color-option ${theme === opt.name ? "active" : ""}`}
              onClick={() => handleThemeChange(opt.name)}
            >
              <div className="color-swatch" style={{ background: opt.color }} />
              <span className="color-label">{opt.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-divider"></div>

      {/* Live Preview */}
      <div className="appearance-section">
        <div className="appearance-label">Live preview</div>
        <div className="preview-buttons">
          <button className="preview-btn primary">Primary Button</button>
          <button className="preview-btn secondary">Secondary Button</button>
          <div className="preview-icon">
            <span>★</span>
          </div>
        </div>
      </div>

      <div className="settings-divider"></div>

      {/* Additional Options */}
      <div className="settings-toggle-group">
        <div className="settings-toggle-item">
          <div>
            <div className="settings-toggle-label">Compact mode</div>
            <div className="settings-toggle-desc">
              Reduce spacing and padding
            </div>
          </div>
          <label className="pg-toggle">
            <input type="checkbox" />
            <div className="pg-toggle-track" />
            <div className="pg-toggle-thumb" />
          </label>
        </div>

        <div className="settings-toggle-item">
          <div>
            <div className="settings-toggle-label">Animations</div>
            <div className="settings-toggle-desc">
              Enable smooth transitions and effects
            </div>
          </div>
          <label className="pg-toggle">
            <input type="checkbox" defaultChecked />
            <div className="pg-toggle-track" />
            <div className="pg-toggle-thumb" />
          </label>
        </div>

        <div className="settings-preference-item">
          <div className="settings-preference-info">
            <div className="settings-preference-label">Font size</div>
            <div className="settings-preference-desc">
              Adjust text size throughout the app
            </div>
          </div>
          <select className="settings-select-small">
            <option>Small</option>
            <option selected>Medium</option>
            <option>Large</option>
            <option>Extra Large</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// Main Settings Page Component
function SettingsPageContent({ onBack, user }) {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="settings-page">
      <div className="settings-header">
        <button className="settings-back" onClick={onBack}>
          ← Back
        </button>
        <div>
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">Manage your account preferences</p>
        </div>
      </div>

      <div className="settings-tabs-container">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`settings-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="settings-content">
        {activeTab === "profile" && <ProfileTab user={user} />}
        {activeTab === "notifications" && <NotificationsTab />}
        {activeTab === "integrations" && <IntegrationsTab />}
        {activeTab === "security" && <SecurityTab />}
        {activeTab === "appearance" && <AppearanceTab />}
      </div>
    </div>
  );
}

// Export wrapped with ThemeProvider
export default function SettingsPage(props) {
  return (
    <ThemeProvider>
      <SettingsPageContent {...props} />
    </ThemeProvider>
  );
}
