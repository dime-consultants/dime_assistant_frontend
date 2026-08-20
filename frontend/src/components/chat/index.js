// index.js  — FIXED
// Changes from previous version:
//   1. sendEmail now hits /ai-agent/api/email/  (was /ai-agent/email/send/ — 404)
//      Matches SendEmailViewSet registered at router.register(r"email", ...)
//   2. Everything else unchanged

// index.js - Update the axios interceptor

import axios from "axios";
import { getAccessToken } from "./Authservice";
import { clearTokens } from "./Authservice";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "" : "");

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, // Increase to 120 seconds (2 minutes) for AI responses
  headers: { Accept: "application/json", "Content-Type": "application/json" },
  withCredentials: true,
});

// Debug interceptor - Make sure this runs BEFORE other interceptors
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    console.log(`[API Request] Token present:`, !!token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[API Request] Added Authorization header`);
    } else {
      console.warn(`[API Request] No token found for ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  },
);

// Response interceptor for handling 401s
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.url} - ${response.status}`);
    console.log(`[API Response] Data:`, response.data);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error("[API Response] 401 Unauthorized - Clearing tokens");
      // Clear tokens and redirect to login
      clearTokens();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

/* ── User storage ── */
const USER_KEY = "user";
export function setStoredUser(user) {
  if (!user) return;
  setCookie(USER_KEY, JSON.stringify(user));
}
export function getStoredUser() {
  try {
    const u = getCookie(USER_KEY);
    return u ? JSON.parse(decodeURIComponent(u)) : null;
  } catch {
    return null;
  }
}
export function clearStoredUser() {
  deleteCookie(USER_KEY);
}
export function isAuthenticated() {
  return !!getAccessToken();
}

/* ── Auth API ── */
export async function login({ email, password }) {
  const { data } = await api.post("/api/token/", { email, password });
  return data;
}
export async function signup(payload) {
  const { data } = await api.post("/auth/signup/", payload);
  setStoredUser(data.user);
  return data;
}
export async function logoutUser() {
  try {
    await api.post("/auth/logout/");
  } catch (_) {}
  clearStoredUser();
}
export async function verifyToken() {
  const token = getAccessToken();
  if (!token) return false;
  try {
    await axios.post(`${BASE_URL}/api/token/verify/`, { token });
    return true;
  } catch {
    return false;
  }
}

/* ── User API ── */
export async function getCurrentUser() {
  const { data } = await api.get("/auth/users/me/");
  setStoredUser(data);
  return data;
}
export async function updateUser(userId, payload) {
  const { data } = await api.patch(`/auth/users/${userId}/`, payload);
  return data;
}
export async function changePassword(userId, password) {
  const { data } = await api.post(`/auth/users/${userId}/set_password/`, {
    password,
  });
  return data;
}

/* ── Chat API ── */
export async function getThreads() {
  const { data } = await api.get("/chat/api/threads/");
  return data;
}
export async function createThread() {
  const { data } = await api.post("/chat/api/threads/", { name: "New Chat" });
  return data;
}
export async function getThread(id) {
  const { data } = await api.get(`/chat/api/threads/${id}/`);
  return data;
}
export const sendMessage = async (id, content) => {
  const { data } = await api.post(
    `/chat/api/threads/${id}/send_message/`,
    {
      content,
    },
    {
      timeout: 120000, // 2 minute timeout for AI
    },
  );
  return data;
};

/* ── Tasks ── */
export const getTasks = () =>
  api.get("/ai-agent/api/tasks/").then((r) => r.data);
export const createTask = (data) =>
  api.post("/ai-agent/api/tasks/", data).then((r) => r.data);
export const updateTask = (id, data) =>
  api.patch(`/ai-agent/api/tasks/${id}/`, data).then((r) => r.data);
export const deleteTask = (id) => api.delete(`/ai-agent/api/tasks/${id}/`);

/* ── Documents ── */
// GET  /ai-agent/documents/       — list_documents_view  (was missing, now added to urls.py)
export const getDocuments = () => api.get("/ai-agent/api/documents/");
export async function uploadChatFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  const { data } = await api.post("/ai-agent/upload-api/", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data; // { id, filename, message }
}
// POST /ai-agent/upload/          — upload_file view
export const uploadDocument = (fd) =>
  api.post("/ai-agent/upload/", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
// POST /ai-agent/documents/read/  — read_document_view   (was missing, now added to urls.py)
export const readDocument = (data) =>
  api.post("/ai-agent/documents/read/", data);
export const deleteDocument = (id) =>
  api.delete(`/ai-agent/api/documents/${id}/`);
export const downloadDocument = (id) =>
  api.get(`/ai-agent/download/${id}/`, { responseType: "blob" });

/* ── Meetings ── */
// Add to index.js — getMeetings named export
// (currently only createMeeting exists, no list export)

// ── Meetings ──────────────────────────────────────────────────
export const getMeetings = () => api.get("/ai-agent/api/meetings/");
export const createMeeting = (data) =>
  api.post("/ai-agent/api/meetings/", data);
export const deleteMeeting = (id) =>
  api.delete(`/ai-agent/api/meetings/${id}/`);
/* ── Email ──
   FIX: was /ai-agent/email/send/ (no such path) → now /ai-agent/api/email/
   Matches SendEmailViewSet registered at router.register(r"email", SendEmailViewSet)
   The router maps POST /api/email/ → SendEmailViewSet.create()
*/
export const sendEmail = (data) => api.post("/ai-agent/api/email/", data);

// GET  /ai-agent/api/email/?folder=sent|inbox|drafts  → list emails
export const getEmails = (folder = "sent") =>
  api.get("/ai-agent/api/email/", { params: { folder } });

/* ── Auth types ── */
export const getAuthTypes = () => api.get("/integrations/api/auth-types/");
export const getAuthTypeDetail = (authType) =>
  api.get(`/integrations/api/auth-types/${authType}/`);

/* ── Integrations ── */
export const getIntegrations = () => api.get("/integrations/api/integrations/");
export const createIntegration = (data) =>
  api.post("/integrations/api/integrations/", data);
export const updateIntegration = (id, data) =>
  api.put(`/integrations/api/integrations/${id}/`, data);
export const deleteIntegration = (id) =>
  api.delete(`/integrations/api/integrations/${id}/`);

/* ── Connections ── */
export const getConnections = () => api.get("/integrations/api/connections/");
export const createConnection = (data) =>
  api.post("/integrations/api/connections/", data);
export const updateConnection = (id, data) =>
  api.put(`/integrations/api/connections/${id}/`, data);
export const deleteConnection = (id) =>
  api.delete(`/integrations/api/connections/${id}/`);

/* ── Connection actions ── */
export const getConnectionRequirements = (id) =>
  api.get(`/integrations/api/connections/${id}/requirements/`);
export const testConnection = (id) =>
  api.post(`/integrations/api/connections/${id}/test/`);
export const proxyConnection = (id, payload) =>
  api.post(`/integrations/api/connections/${id}/proxy/`, payload);
export const refreshOAuth2 = (id) =>
  api.post(`/integrations/api/connections/${id}/refresh-oauth2/`);
export const runClientCredentials = (id) =>
  api.post(`/integrations/api/connections/${id}/client-credentials/`);
export const runPasswordGrant = (id) =>
  api.post(`/integrations/api/connections/${id}/password-grant/`);
export const harvestSession = (id) =>
  api.post(`/integrations/api/connections/${id}/harvest-session/`);
export const getConnectionLogs = (id) =>
  api.get(`/integrations/api/connections/${id}/logs/`);
export const getRotationLogs = (id) =>
  api.get(`/integrations/api/connections/${id}/rotation-logs/`);

/* ── Connection endpoints ── */
export const getConnectionEndpoints = (id) =>
  api.get(`/integrations/api/connections/${id}/endpoints/`);
export const importConnectionEndpoints = (id, data) =>
  api.post(`/integrations/api/connections/${id}/import/`, data);

/* ── Endpoint registry ── */
export const getEndpoints = () => api.get("/integrations/api/endpoints/");
export const createEndpoint = (data) =>
  api.post("/integrations/api/endpoints/", data);
export const updateEndpoint = (id, data) =>
  api.put(`/integrations/api/endpoints/${id}/`, data);
export const deleteEndpoint = (id) =>
  api.delete(`/integrations/api/endpoints/${id}/`);
export const testEndpoint = (id) =>
  api.post(`/integrations/api/endpoints/${id}/test/`);
export const searchEndpoints = (query) =>
  api.get("/integrations/api/endpoints/search/", { params: { q: query } });

/* ── Import jobs ── */
export const getImportJobs = () => api.get("/integrations/api/import-jobs/");

/* ── Request logs ── */
export const getRequestLogs = () => api.get("/integrations/api/logs/");

/* ── Token rotation logs ── */
export const getTokenRotationLogs = () =>
  api.get("/integrations/api/rotation-logs/");

/* ── Webhooks ── */
export const getWebhooks = () => api.get("/integrations/api/webhooks/");
export const createWebhook = (data) =>
  api.post("/integrations/api/webhooks/", data);
export const updateWebhook = (id, data) =>
  api.put(`/integrations/api/webhooks/${id}/`, data);
export const deleteWebhook = (id) =>
  api.delete(`/integrations/api/webhooks/${id}/`);
export const rotateWebhookSecret = (id) =>
  api.post(`/integrations/api/webhooks/${id}/rotate-secret/`);

/* ── OAuth2 flow ── */
export const connectOAuth2 = (connId) => {
  window.location.href = `${BASE_URL}/integrations/oauth2/connect/${connId}/`;
};
export const revokeOAuth2 = (connId) =>
  api.post(`/integrations/oauth2/revoke/${connId}/`);

/* ── Inbound webhook receiver ── */
export const receiveWebhook = (webhookId, payload) =>
  api.post(`/integrations/webhooks/${webhookId}/receive/`, payload);

/* ── Health check ── */
export async function pingServer() {
  return (await api.get("/")).data;
}

export default api;
