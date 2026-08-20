import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Messages from "./Message";
import RightPanel from "./RightPanel";
import { useTheme } from "../context/ThemeContext";
import { getThreads, createThread } from "./index";
import "../styles/styles.css";

export default function ChatLayout({ user, onLogout }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [threads, setThreads] = useState([]);
  const { mode, theme } = useTheme();

  useEffect(() => {
    const init = async () => {
      try {
        const raw = await getThreads();
        const list = Array.isArray(raw) ? raw : raw?.results || [];
        setThreads(list);
        if (list.length > 0) {
          setActiveThreadId(list[0].id);
        } else {
          const t = await createThread();
          setThreads([t]);
          setActiveThreadId(t.id);
        }
      } catch (err) {
        console.error("Chat init failed:", err);
      }
    };
    init();
  }, []);

  const handleNewThread = async () => {
    try {
      const t = await createThread();
      setThreads((prev) => [t, ...prev]);
      setActiveThreadId(t.id);
    } catch (err) {
      console.error("Create thread failed:", err);
    }
  };

  const handleSelectThread = (id) => {
    setActiveThreadId(id);
  };

  const handleThreadRenamed = (id, name) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name } : t))
    );
  };

  return (
    <div
      className="ci"
      data-theme={mode}
      data-accent={theme}
      style={{
        gridTemplateColumns: sidebarCollapsed
          ? "70px 1fr 260px"
          : "240px 1fr 260px",
      }}
    >
      <Sidebar
        collapsed={sidebarCollapsed}
        user={user}
        onLogout={onLogout}
        threads={threads}
        activeThreadId={activeThreadId}
        onNewThread={handleNewThread}
        onSelectThread={handleSelectThread}
      />

      <main className="ci-main">
        <Header
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onLogout={onLogout}
          user={user}
        />
        <Messages threadId={activeThreadId} onThreadRenamed={handleThreadRenamed} />
      </main>

      <RightPanel />
    </div>
  );
}
