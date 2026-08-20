import React, { useState, useEffect, useRef, useCallback } from "react";
import api, { getDocuments, downloadDocument } from "../chat/index";
import "../styles/rightpanel.css";

const FILE_TYPES = {
  pdf:  { bg: "rgba(248,81,73,0.12)",   color: "#f85149",   icon: "📄", label: "PDF"  },
  xlsx: { bg: "rgba(34,197,94,0.12)",   color: "#22c55e",   icon: "📊", label: "XLSX" },
  xls:  { bg: "rgba(34,197,94,0.12)",   color: "#22c55e",   icon: "📊", label: "XLS"  },
  docx: { bg: "rgba(59,210,240,0.12)",  color: "var(--brand)", icon: "📝", label: "DOCX" },
  doc:  { bg: "rgba(59,210,240,0.12)",  color: "var(--brand)", icon: "📝", label: "DOC"  },
  txt:  { bg: "rgba(167,139,250,0.12)", color: "#a78bfa",   icon: "📃", label: "TXT"  },
  csv:  { bg: "rgba(34,197,94,0.12)",   color: "#22c55e",   icon: "📈", label: "CSV"  },
  image:{ bg: "rgba(245,158,11,0.12)",  color: "#f59e0b",   icon: "🖼️", label: "IMG"  },
};

const getFileType = (filename) => {
  const ext = filename?.split(".").pop()?.toLowerCase() || "file";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return FILE_TYPES.image;
  return FILE_TYPES[ext] || { bg: "var(--brand-soft)", color: "var(--brand)", icon: "📎", label: ext.toUpperCase().slice(0, 4) };
};

const getFileName = (doc) =>
  doc.filename || (doc.file ? String(doc.file).split("/").pop() : `doc-${doc.id}`);

const formatFileSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-KE", { day: "numeric", month: "short" });
};

export default function RightPanel() {
  const [activeTab, setActiveTab]     = useState("files");
  const [documents, setDocuments]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [uploading, setUploading]     = useState(false);
  const [error, setError]             = useState(null);
  const [selectedDocs, setSelectedDocs] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [notes, setNotes]             = useState("");
  const [hoveredDoc, setHoveredDoc]   = useState(null);
  const fileInputRef = useRef();

  // ── Load documents from API ───────────────────────────────────
  const loadDocuments = useCallback(async () => {
    try {
      const res = await getDocuments();
      const raw = res.data;
      const docs = Array.isArray(raw) ? raw : raw?.results || [];
      setDocuments(docs);
      setError(null);
    } catch (err) {
      console.error("Failed to load documents:", err);
      setError("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Refresh when AI generates or uploads a document
  useEffect(() => {
    const handleIntent = (e) => {
      const intent = e.detail?.intent;
      if (intent === "generate_document" || intent === "upload_document") {
        loadDocuments();
      }
    };
    window.addEventListener("dime:intent_executed", handleIntent);
    return () => window.removeEventListener("dime:intent_executed", handleIntent);
  }, [loadDocuments]);

  // Periodic refresh every 30s (catches WebSocket-based generations)
  useEffect(() => {
    const id = setInterval(loadDocuments, 30000);
    return () => clearInterval(id);
  }, [loadDocuments]);

  // Notes — persisted to localStorage
  useEffect(() => {
    const saved = localStorage.getItem("user_notes");
    if (saved) setNotes(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem("user_notes", notes);
  }, [notes]);

  // ── Helpers ───────────────────────────────────────────────────
  const filteredDocuments = documents.filter((doc) =>
    getFileName(doc).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (id, e) => {
    if (e) e.stopPropagation();
    setSelectedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedDocs.size === filteredDocuments.length) setSelectedDocs(new Set());
    else setSelectedDocs(new Set(filteredDocuments.map((d) => d.id)));
  };

  const clearSelection = () => setSelectedDocs(new Set());

  const getSelectedDocuments = () => filteredDocuments.filter((d) => selectedDocs.has(d.id));

  // ── Download ──────────────────────────────────────────────────
  // Accepts an optional array of docs; falls back to current selection
  const handleDownload = async (docsOverride) => {
    const targets = docsOverride ?? getSelectedDocuments();
    for (const doc of targets) {
      try {
        const response = await downloadDocument(doc.id);
        const url = URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = url;
        link.download = getFileName(doc);
        link.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error(`Download failed for ${getFileName(doc)}:`, err);
        setError(`Could not download "${getFileName(doc)}"`);
      }
    }
  };

  // ── Print ─────────────────────────────────────────────────────
  // Downloads the file as a blob (respects JWT auth), then prints via iframe
  const handlePrint = async () => {
    const selected = getSelectedDocuments();
    if (selected.length !== 1) return;
    const doc = selected[0];
    try {
      const response = await downloadDocument(doc.id);
      const blobUrl = URL.createObjectURL(response.data);
      const iframe = document.createElement("iframe");
      iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;";
      iframe.src = blobUrl;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (_) {
          // Cross-origin PDF — open in new tab so user can print manually
          window.open(blobUrl, "_blank");
        }
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(blobUrl);
        }, 5000);
      };
    } catch (err) {
      console.error("Print failed:", err);
      setError("Could not prepare file for printing.");
    }
  };

  // ── Upload ────────────────────────────────────────────────────
  // Uses the DRF endpoint that accepts JWT auth
  const handleUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;
    setUploading(true);
    setError(null);
    let anyFailed = false;
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        await api.post("/ai-agent/api/upload/", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } catch (err) {
        console.error(`Upload failed: ${file.name}`, err);
        anyFailed = true;
      }
    }
    if (anyFailed) setError("One or more files failed to upload.");
    await loadDocuments();
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Delete this file?")) return;
    try {
      await api.delete(`/ai-agent/api/documents/${id}/`);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      setSelectedDocs((prev) => { const n = new Set(prev); n.delete(id); return n; });
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Could not delete the file.");
    }
  };

  const stats = {
    total: documents.length,
    pdf:   documents.filter((d) => getFileName(d).toLowerCase().endsWith(".pdf")).length,
    excel: documents.filter((d) => /\.(xlsx|xls)$/i.test(getFileName(d))).length,
    doc:   documents.filter((d) => /\.(docx|doc)$/i.test(getFileName(d))).length,
  };

  const selectedCount    = selectedDocs.size;
  const isSingleSelected = selectedCount === 1;

  return (
    <aside className="right-panel">
      {/* Header */}
      <div className="right-panel-header">
        <div className="right-panel-title-section">
          <h3 className="right-panel-title">Workspace</h3>
          <p className="right-panel-subtitle">
            {stats.total} {stats.total === 1 ? "document" : "documents"}
          </p>
        </div>
        <button onClick={loadDocuments} className="refresh-btn" title="Refresh" disabled={loading}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
          </svg>
        </button>
      </div>

      {/* Statistics Bar */}
      <div className="stats-bar">
        <div className="stat-item"><span className="stat-value">{stats.total}</span><span className="stat-label">TOTAL</span></div>
        <div className="stat-divider" />
        <div className="stat-item"><span className="stat-value">{stats.pdf}</span><span className="stat-label">PDF</span></div>
        <div className="stat-divider" />
        <div className="stat-item"><span className="stat-value">{stats.excel}</span><span className="stat-label">SHEETS</span></div>
        <div className="stat-divider" />
        <div className="stat-item"><span className="stat-value">{stats.doc}</span><span className="stat-label">DOCS</span></div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button className={`tab-button ${activeTab === "files" ? "active" : ""}`} onClick={() => setActiveTab("files")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Files
          {stats.total > 0 && <span className="tab-badge">{stats.total}</span>}
        </button>
        <button className={`tab-button ${activeTab === "notes" ? "active" : ""}`} onClick={() => setActiveTab("notes")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          Notes
        </button>
      </div>

      {/* ── Files Tab ─────────────────────────────────────────── */}
      {activeTab === "files" && (
        <>
          {/* Toolbar */}
          <div className="toolbar">
            <div className="search-wrapper">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button className="clear-search" onClick={() => setSearchQuery("")}>×</button>
              )}
            </div>

            <div className="toolbar-actions">
              {filteredDocuments.length > 0 && (
                <button className="toolbar-btn" onClick={selectAll}>
                  {selectedCount === filteredDocuments.length ? "Deselect" : "Select All"}
                </button>
              )}
              <label className={`toolbar-btn upload-btn${uploading ? " uploading" : ""}`}>
                {uploading ? (
                  <span className="upload-spinner" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7 10 12 5 17 10" />
                    <line x1="12" y1="5" x2="12" y2="15" />
                  </svg>
                )}
                {uploading ? "Uploading…" : "Upload"}
                <input
                  type="file"
                  multiple
                  hidden
                  ref={fileInputRef}
                  onChange={handleUpload}
                  accept=".pdf,.xlsx,.xls,.doc,.docx,.txt,.csv,.jpg,.jpeg,.png"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="error-message">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <circle cx="12" cy="16" r="0.5" fill="currentColor" />
              </svg>
              {error}
              <button style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "inherit" }} onClick={() => setError(null)}>×</button>
            </div>
          )}

          {/* AI hint */}
          <div className="ai-hint">
            <span>AI-generated documents appear here automatically</span>
          </div>

          {/* File list */}
          <div className="file-list">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="skeleton-item">
                  <div className="skeleton-checkbox" />
                  <div className="skeleton-icon" />
                  <div className="skeleton-text">
                    <div className="skeleton-title" />
                    <div className="skeleton-meta" />
                  </div>
                </div>
              ))
            ) : filteredDocuments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📁</div>
                <div className="empty-title">No files yet</div>
                <div className="empty-subtitle">
                  {searchQuery ? "Try a different search term" : "Upload files or ask the AI to generate a document"}
                </div>
              </div>
            ) : (
              filteredDocuments.map((doc) => {
                const fileName  = getFileName(doc);
                const fileType  = getFileType(fileName);
                const isSelected = selectedDocs.has(doc.id);
                const isHovered  = hoveredDoc === doc.id;
                return (
                  <div
                    key={doc.id}
                    className={`file-item ${isSelected ? "selected" : ""}`}
                    onMouseEnter={() => setHoveredDoc(doc.id)}
                    onMouseLeave={() => setHoveredDoc(null)}
                    onClick={() => toggleSelect(doc.id)}
                  >
                    <div className="file-checkbox" onClick={(e) => toggleSelect(doc.id, e)}>
                      <div className={`checkbox ${isSelected ? "checked" : ""}`}>
                        {isSelected && (
                          <svg viewBox="0 0 10 10" fill="none" stroke="#0d1117" strokeWidth={2.5}>
                            <polyline points="2 5 4 7 8 3" />
                          </svg>
                        )}
                      </div>
                    </div>

                    <div className="file-icon" style={{ background: fileType.bg, color: fileType.color }}>
                      <span className="file-emoji">{fileType.icon}</span>
                    </div>

                    <div className="file-details">
                      <div className="file-name" title={fileName}>{fileName}</div>
                      <div className="file-meta">
                        <span>{formatDate(doc.created_at)}</span>
                        {doc.size && (
                          <><span className="meta-dot">•</span><span>{formatFileSize(doc.size)}</span></>
                        )}
                      </div>
                    </div>

                    {isHovered && (
                      <div className="file-actions">
                        <button
                          className="action-btn"
                          title="Download"
                          onClick={(e) => { e.stopPropagation(); handleDownload([doc]); }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                        </button>
                        <button
                          className="action-btn delete-btn"
                          title="Delete"
                          onClick={(e) => handleDelete(doc.id, e)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Action Bar */}
          <div className="action-bar">
            <div className="action-bar-left">
              {selectedCount > 0 && (
                <>
                  <span className="selection-count">{selectedCount} selected</span>
                  <button className="clear-selection-btn" onClick={clearSelection}>Clear</button>
                </>
              )}
            </div>
            <div className="action-buttons">
              <button
                className="action-btn-primary"
                onClick={() => handleDownload()}
                disabled={selectedCount === 0}
                title={selectedCount === 0 ? "Select files to download" : `Download ${selectedCount} file(s)`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Download
                {selectedCount > 0 && <span className="btn-badge">{selectedCount}</span>}
              </button>

              <button
                className="action-btn-primary print-btn"
                onClick={handlePrint}
                disabled={!isSingleSelected}
                title={!isSingleSelected ? "Select exactly one file to print" : "Print"}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                  <path d="M6 9V3h12v6" />
                  <rect x="6" y="15" width="12" height="6" rx="2" />
                </svg>
                Print
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Notes Tab ─────────────────────────────────────────── */}
      {activeTab === "notes" && (
        <div className="notes-container">
          <div className="notes-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            <span>Quick Notes</span>
          </div>
          <textarea
            className="notes-textarea"
            placeholder="Write your thoughts here… (saved locally)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="notes-footer">
            <span>{notes.length} characters</span>
          </div>
        </div>
      )}
    </aside>
  );
}
