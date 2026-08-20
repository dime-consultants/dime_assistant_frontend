// App.jsx - Add this component to track theme mode
import { useState, useEffect } from "react";
import Home from "./components/chat/Home";
import Signup from "./components/chat/signup";
import ChatLayout from "./components/chat/ChatLayout";
import { AIDataProvider } from "./components/chat/Sidebarforms";
import { ThemeProvider, useTheme } from "./components/context/ThemeContext";
import "./components/styles/theme.css";
import {
  getCurrentUser,
  logout,
  isAuthenticated,
} from "./components/chat/Authservice";
import { logoutUser } from "./components/chat/index";

// Component to apply theme class to body
function ThemeBodyUpdater() {
  const { mode } = useTheme();

  useEffect(() => {
    // Remove existing mode classes
    document.body.classList.remove("dark-mode", "light-mode");
    // Add current mode class
    document.body.classList.add(`${mode}-mode`);
  }, [mode]);

  return null;
}

export default function App() {
  const [page, setPage] = useState("loading");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const tokenValid = isAuthenticated();
        if (!tokenValid) {
          setPage("landing");
          return;
        }
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setPage("chat");
      } catch (err) {
        console.error("Session restore failed:", err);
        setUser(null);
        setPage("landing");
      }
    };
    init();
  }, []);

  const handleLogout = async () => {
    try {
      // Inform backend, then clear local tokens
      try {
        await logoutUser();
      } catch (e) {
        console.warn("Backend logout failed:", e);
      }
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
    setUser(null);
    setPage("landing");
  };

  const renderPage = () => {
    if (page === "loading") return null;
    if (page === "signup") {
      return (
        <Signup
          onLogin={() => setPage("landing")}
          onSuccess={(userData) => {
            if (userData?.email) {
              setUser(userData);
              setPage("chat");
            } else {
              setPage("landing");
            }
          }}
        />
      );
    }
    if (page === "chat") {
      return (
        <AIDataProvider>
          <ChatLayout user={user} onLogout={handleLogout} />
        </AIDataProvider>
      );
    }
    return (
      <Home
        onSignup={() => setPage("signup")}
        onLoginSuccess={(userData) => {
          setUser(userData);
          setPage("chat");
        }}
      />
    );
  };

  return (
    <ThemeProvider>
      <ThemeBodyUpdater />
      {renderPage()}
    </ThemeProvider>
  );
}
