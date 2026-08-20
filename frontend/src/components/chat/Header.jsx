import React, { useState, useEffect, useRef } from "react";
import NotificationsPage from "./Notifications";
import SettingsPage from "./Settings";
import CalendarPage from "./Calendar";
import AboutPage from "./About";
import { logoutUser } from "../chat/index";
import { clearStoredUser } from "../chat/index";
import { useTheme } from "../context/ThemeContext";

import "../styles/header.css"; // Make sure this CSS file is imported

/* ════════════════════════════════════════════════════
   ICONS
════════════════════════════════════════════════════ */
function IconMenu() {
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
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
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

function IconSettings() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
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
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconClose() {
  return (
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
  );
}

function IconShield() {
  return (
    <svg
      width="28"
      height="28"
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

/* ════════════════════════════════════════════════════
   LOGOUT CONFIRMATION MODAL
════════════════════════════════════════════════════ */
function LogoutModal({ open, onCancel, onConfirm, user }) {
  const [confirming, setConfirming] = useState(false);
  const cancelRef = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => cancelRef.current?.focus(), 80);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  const handleConfirm = async () => {
    setConfirming(true);
    await new Promise((r) => setTimeout(r, 700));
    onConfirm();
    setConfirming(false);
  };

  const displayName = user?.name || user?.email?.split("@")[0] || "Executive";

  return (
    <div
      className="logout-overlay"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="logout-modal">
        <button className="logout-close" onClick={onCancel}>
          <IconClose />
        </button>
        <div className="logout-accent-line" />
        <div className="logout-icon">
          <IconShield />
        </div>
        <h2 className="logout-title">Sign out?</h2>
        <p className="logout-message">
          You're signed in as <strong>{displayName}</strong>. Your session and
          unsaved chat history will be cleared.
        </p>
        <div className="logout-buttons">
          <button
            ref={cancelRef}
            onClick={onCancel}
            disabled={confirming}
            className="logout-cancel-btn"
          >
            Stay signed in
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="logout-confirm-btn"
          >
            {confirming ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   HEADER COMPONENT
════════════════════════════════════════════════════ */
export default function Header({ onToggleSidebar, onLogout, user }) {
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [page, setPage] = useState(null);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const { theme, setTheme, themes } = useTheme();
  const themeMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target)) {
        setThemeMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoutConfirm = async () => {
    try {
      setLogoutOpen(false);
      // Delegate navigation and token clearing to parent via onLogout
      clearStoredUser();
      if (typeof onLogout === "function") {
        await onLogout();
      }
    } catch (err) {
      console.error("Logout failed:", err);
      // Fallback: still call parent logout if available
      if (typeof onLogout === "function") {
        try {
          await onLogout();
        } catch (_) {}
      }
    }
  };

  if (page === "notifications")
    return <NotificationsPage onBack={() => setPage(null)} />;
  if (page === "settings")
    return <SettingsPage onBack={() => setPage(null)} user={user} />;
  if (page === "calendar") return <CalendarPage onBack={() => setPage(null)} />;
  if (page === "about") return <AboutPage onBack={() => setPage(null)} />;

  return (
    <>
      <div className="ci-header">
        <div className="ci-header-left">
          <button
            className="ci-icon-btn"
            onClick={onToggleSidebar}
            title="Toggle sidebar"
          >
            <IconMenu />
          </button>
          <div className="ci-status-dot" />
          <div>
            <div
              className="ci-header-title"
              style={{ cursor: "pointer" }}
              onClick={() => setPage("about")}
            >
              Dime Executive
            </div>
            <div className="ci-header-sub">
              {user?.name ? `Signed in as ${user.name}` : "Active session"}
            </div>
          </div>
        </div>

        <div className="ci-toolbar">
          <div className="ci-theme-menu" ref={themeMenuRef}>
            <button
              type="button"
              className="ci-icon-btn"
              title="Choose color theme"
              onClick={() => setThemeMenuOpen((prev) => !prev)}
            >
              <span className="ci-theme-button-dot" style={{ backgroundColor: themes[theme].primary }} />
            </button>
            {themeMenuOpen && (
              <div className="ci-theme-popover">
                <div className="ci-theme-popover-title">Theme colors</div>
                <div className="ci-theme-options">
                  {Object.entries(themes).map(([key, value]) => (
                    <button
                      key={key}
                      type="button"
                      className={`ci-theme-option ${theme === key ? "selected" : ""}`}
                      onClick={() => {
                        setTheme(key);
                        setThemeMenuOpen(false);
                      }}
                    >
                      <span className="ci-theme-option-swatch" style={{ backgroundColor: value.primary }} />
                      <span className="ci-theme-option-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            className="ci-icon-btn"
            title="Notifications"
            onClick={() => setPage("notifications")}
          >
            <IconBell />
            <div className="ci-badge" />
          </button>
          <button
            className="ci-icon-btn"
            title="Calendar"
            onClick={() => setPage("calendar")}
          >
            <IconCalendar />
          </button>
          <button
            className="ci-icon-btn"
            title="Settings"
            onClick={() => setPage("settings")}
          >
            <IconSettings />
          </button>
          <button
            className="ci-icon-btn"
            title="About"
            onClick={() => setPage("about")}
          >
            ?
          </button>
          <div className="ci-divider-v" />
          <button
            className="ci-icon-btn danger"
            title="Sign out"
            onClick={() => setLogoutOpen(true)}
          >
            <IconLogout />
          </button>
        </div>
      </div>

      <LogoutModal
        open={logoutOpen}
        user={user}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}
