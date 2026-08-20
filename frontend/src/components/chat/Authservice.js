// src/components/chat/Authservice.js

const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "" : "");

/* =====================================================
   SIMPLE COOKIE HELPERS - FIXED
===================================================== */
function setCookie(name, value, days = 7) {
  const expires = new Date(
    Date.now() + days * 24 * 60 * 60 * 1000,
  ).toUTCString();

  // Ensure cookie is accessible by JavaScript and sent with requests
  const secureFlag = location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${name}=${encodeURIComponent(value)}; ` +
    `expires=${expires}; path=/; SameSite=Lax${secureFlag}`;

  console.log(
    `[Cookie] Set ${name}:`,
    value ? `${value.substring(0, 20)}...` : "empty",
  );
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  const value = match ? decodeURIComponent(match[2]) : null;
  console.log(
    `[Cookie] Get ${name}:`,
    value ? `${value.substring(0, 20)}...` : "not found",
  );
  return value;
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  console.log(`[Cookie] Deleted ${name}`);
}

/* =====================================================
   TOKEN STORAGE (PLAIN JWT IN COOKIES)
===================================================== */

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export const getAccessToken = () => {
  const token = getCookie(ACCESS_KEY);
  if (!token) {
    console.warn("[Auth] No access token found in cookies");
  }
  return token;
};

export const isAuthenticated = () => {
  const authenticated = !!getAccessToken();
  console.log("[Auth] Is authenticated:", authenticated);
  return authenticated;
};

export const getRefreshToken = () => {
  return getCookie(REFRESH_KEY);
};

export const setTokens = ({ access, refresh }) => {
  console.log("[Auth] Setting tokens...");
  if (access) {
    setCookie(ACCESS_KEY, access);
  }
  if (refresh) {
    setCookie(REFRESH_KEY, refresh);
  }
  console.log("[Auth] Tokens stored in cookies");
};

export const clearTokens = () => {
  console.log("[Auth] Clearing tokens");
  deleteCookie(ACCESS_KEY);
  deleteCookie(REFRESH_KEY);
  deleteCookie("user");
};

/* =====================================================
   LOGIN - Make sure we're getting the right response
===================================================== */

export async function loginWithEmail({ email, password }) {
  console.log("[Auth] Logging in with email:", email);

  const res = await fetch(`${API_BASE}/api/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  console.log("[Auth] Login response status:", res.status);
  console.log("[Auth] Login response data:", data);

  if (!res.ok) {
    throw new Error(data?.detail || "Invalid credentials");
  }

  // Make sure we have both access and refresh tokens
  if (!data.access || !data.refresh) {
    console.error("[Auth] Missing tokens in response:", data);
    throw new Error("Invalid token response from server");
  }

  setTokens(data);
  console.log("[Auth] Login successful, tokens stored");

  return data;
}

/* =====================================================
   REGISTER
===================================================== */

export async function registerWithEmail({
  first_name,
  last_name,
  email,
  password,
}) {
  console.log("[Auth] Registering user:", email);

  const res = await fetch(`${API_BASE}/auth/signup/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, first_name, last_name, password }),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Server returned non-JSON response");
  }

  if (!res.ok) {
    throw new Error(data?.detail || data?.error || "Registration failed");
  }

  // Store tokens returned from signup
  if (data.access && data.refresh) {
    setTokens({ access: data.access, refresh: data.refresh });
    console.log("[Auth] Tokens stored after registration");
  }

  return data;
}
/* =====================================================
   GET CURRENT USER
===================================================== */
export async function getCurrentUser() {
  const token = getAccessToken();
  console.log("[Auth] Getting current user, token present:", !!token);

  const res = await fetch(`${API_BASE}/auth/users/me/`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  console.log("[Auth] Get user response status:", res.status);

  if (!res.ok) {
    console.error("[Auth] Failed to get user:", res.status);
    clearTokens();
    throw new Error("Unauthorized");
  }

  const user = await res.json();
  console.log("[Auth] User retrieved:", user.email);
  return user;
}

/* =====================================================
   AUTH FETCH (AUTO TOKEN ATTACHMENT)
===================================================== */

export async function authFetch(url, options = {}) {
  const token = getAccessToken();
  console.log(`[AuthFetch] ${url}, token present:`, !!token);

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    console.error(`[AuthFetch] Error ${res.status}: ${url}`);
    if (res.status === 401) {
      clearTokens();
    }
    throw new Error("Unauthorized");
  }

  return res;
}

/* =====================================================
   LOGOUT
===================================================== */

export function logout() {
  console.log("[Auth] Logging out");
  clearTokens();
}
