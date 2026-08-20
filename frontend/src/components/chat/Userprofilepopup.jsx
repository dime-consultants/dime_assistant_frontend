import { useState, useEffect, useRef } from "react";
import "../styles/user-profile.css";
/* ════════════════════════════════════════════════════
   ICONS
════════════════════════════════════════════════════ */
function IconClose() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconMail() {
  return (
    <svg
      width="14"
      height="14"
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
function IconUser() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconBriefcase() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41M2 12h2M20 12h2" />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function IconCamera() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

/* ════════════════════════════════════════════════════
   KEYFRAMES (injected once)
════════════════════════════════════════════════════ */
const KEYFRAMES = `
@keyframes profilePopIn {
  from { opacity: 0; transform: translateY(12px) scale(.97); }
  to   { opacity: 1; transform: none; }
}
@keyframes profileOverlayIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes profileSpinAnim {
  to { transform: rotate(360deg); }
}
`;

/* ════════════════════════════════════════════════════
   USER PROFILE POPUP
   Props:
     open      — boolean
     onClose   — dismiss
     onLogout  — triggers logout flow
     onSettings — opens settings page
     user      — { name, email, role, initials, company, joinDate, plan }
════════════════════════════════════════════════════ */
export default function UserProfilePopup({
  open,
  onClose,
  onLogout,
  onSettings,
  user,
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const modalRef = useRef(null);

  /* Sync form from user prop when popup opens */
  useEffect(() => {
    if (open) {
      setForm({
        name: user?.name || "Executive User",
        email: user?.email || "executive@company.com",
        role: user?.role || "Administrator",
        company: user?.company || "Dime Executive Ltd",
        phone: user?.phone || "",
      });
      setEditing(false);
      setSaved(false);
    }
  }, [open, user]);

  /* Escape to close */
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

  if (!open) return null;

  const initials =
    user?.initials ||
    (user?.name
      ? user.name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "EX");

  const change = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const save = async () => {
    setSaving(true);
    await new Promise((r) =>
      setTimeout(r, 800),
    ); /* replace with real API call */
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const stats = [
    { label: "Tasks done", value: user?.stats?.tasks || "24" },
    { label: "Meetings", value: user?.stats?.meetings || "18" },
    { label: "Emails sent", value: user?.stats?.emails || "47" },
    { label: "API calls", value: user?.stats?.apis || "312" },
  ];

  const menuItems = [
    {
      icon: <IconSettings />,
      label: "Account settings",
      action: () => {
        onClose?.();
        onSettings?.();
      },
    },
  ];

  return (
    <>
      {/* BACKDROP */}
      <div
        className="profile-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose?.();
          }
        }}
      >
        <div
          className="profile-modal"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="profile-close" onClick={() => onClose?.()}>
            <IconClose />
          </button>

          {/* HEADER */}
          <div className="profile-header">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar">{initials}</div>

              <div className="profile-online-dot" />
            </div>

            {editing ? (
              <input
                className="profile-input"
                value={form.name}
                onChange={change("name")}
              />
            ) : (
              <div className="profile-name">{form.name}</div>
            )}

            {editing ? (
              <input
                className="profile-input-small"
                value={form.role}
                onChange={change("role")}
              />
            ) : (
              <div className="profile-role">{form.role}</div>
            )}
          </div>

          {/* DETAILS */}
          <div className="profile-details">
            {[
              {
                icon: <IconMail />,
                label: "Email",
                field: "email",
                val: form.email,
              },
              {
                icon: <IconBriefcase />,
                label: "Company",
                field: "company",
                val: form.company,
              },
              {
                icon: <IconUser />,
                label: "Phone",
                field: "phone",
                val: form.phone || "Not set",
              },
            ].map((row) => (
              <div key={row.label} className="profile-row">
                <div>{row.icon}</div>

                <div className="profile-label">{row.label}</div>

                {editing && row.field !== "email" ? (
                  <input
                    className="profile-input-row"
                    value={form[row.field]}
                    onChange={change(row.field)}
                  />
                ) : (
                  <div className="profile-value">{row.val}</div>
                )}
              </div>
            ))}

            {/* MEMBER SINCE */}
            <div className="profile-row">
              <div>📅</div>

              <div className="profile-label">Member since</div>

              <div className="profile-value">
                {user?.joinDate || "April 2026"}
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="profile-stats">
            <div className="profile-stats-grid">
              {stats.map((s) => (
                <div key={s.label} className="profile-stat">
                  <div className="profile-stat-value">{s.value}</div>

                  <div className="profile-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="profile-actions">
            {editing ? (
              <>
                <button
                  className="profile-btn profile-btn-primary"
                  onClick={save}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>

                <button
                  className="profile-btn"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button className="profile-btn" onClick={() => setEditing(true)}>
                <IconEdit />
                Edit profile
              </button>
            )}

            {saved && (
              <div className="profile-success">
                ✓ Profile updated successfully
              </div>
            )}
            <br />

            {/* SETTINGS */}
            <button
              className="profile-btn"
              onClick={() => {
                onClose?.();
                onSettings?.();
              }}
            >
              <IconSettings />
              Account settings
            </button>

            {/* LOGOUT */}
            <button
              className="profile-btn profile-btn-logout"
              onClick={() => {
                onClose?.();
                onLogout?.();
              }}
            >
              <IconLogout />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
