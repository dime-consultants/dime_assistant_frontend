import React, { useEffect, useRef, useState } from "react";
import { sendMessage, getThread } from "../chat/index";

function formatMessageTime(timestamp) {
  if (!timestamp) {
    return new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Messages({ threadId, onThreadRenamed }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);

  // Load messages whenever the active thread changes
  useEffect(() => {
    if (!threadId) {
      setMessages([]);
      return;
    }
    const load = async () => {
      try {
        const thread = await getThread(threadId);
        const msgs = thread?.messages || [];
        setMessages(Array.isArray(msgs) ? msgs : []);
      } catch (err) {
        console.error("Load thread failed:", err);
        setMessages([]);
      }
    };
    load();
  }, [threadId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const nextAttachments = files.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
      file,
    }));

    setAttachments((prev) => [...prev, ...nextAttachments]);
    event.target.value = "";
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSend = async () => {
    if ((!text.trim() && attachments.length === 0) || !threadId || loading) return;

    const userMsg = {
      role: "user",
      content: text.trim() || "Shared attachment",
      timestamp: new Date().toISOString(),
      attachments: attachments.map((item) => ({
        id: item.id,
        name: item.name,
        size: item.size,
        type: item.type,
        previewUrl: item.previewUrl,
      })),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    const sentText = text;
    setText("");
    setAttachments([]);

    const placeholderId = Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: placeholderId,
        role: "ai",
        content: "🤔 Thinking...",
        timestamp: new Date().toISOString(),
        isPlaceholder: true,
      },
    ]);

    try {
      const res = await sendMessage(threadId, sentText);

      setMessages((prev) => prev.filter((msg) => msg.id !== placeholderId));

      let aiContent = "";
      if (res.ai_message?.content) {
        aiContent = res.ai_message.content;
      } else if (res.content) {
        aiContent = res.content;
      } else if (res.response) {
        aiContent = res.response;
      } else {
        aiContent = "I've processed your request.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "ai",
          content: aiContent,
          timestamp: new Date().toISOString(),
          attachment_url: res.ai_message?.attachment_url || "",
          attachment_filename: res.ai_message?.attachment_filename || "",
        },
      ]);

      // Update sidebar title if the backend generated one for this thread
      if (res.thread_name && threadId) {
        onThreadRenamed?.(threadId, res.thread_name);
      }

      // Process intent result — store in activity log and notify sidebar panels
      const intentResult = res.intent_result;
      if (intentResult) {
        try {
          const key = "dime_ai_responses";
          const existing = JSON.parse(localStorage.getItem(key) || "[]");
          existing.unshift({ ...intentResult, timestamp: new Date().toISOString() });
          localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
        } catch (_) {}
        window.dispatchEvent(
          new CustomEvent("dime:intent_executed", { detail: intentResult })
        );
      }
    } catch (err) {
      console.error("Send failed:", err);
      setMessages((prev) => prev.filter((msg) => msg.id !== placeholderId));

      let errorMessage = "Sorry, an error occurred. Please try again.";
      if (err.message?.includes("timeout")) {
        errorMessage = "⏰ The AI is taking too long. Please try again.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "ai",
          content: errorMessage,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="ci-messages">
        {messages.length === 0 && !loading && (
          <div className="ci-empty-state">
            <div className="ci-empty-icon">💬</div>
            <h3>Welcome to DIME</h3>
            <p>Ask anything — business strategy, code review, or analysis.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={msg.id || i}
            className={`ci-msg ${msg.role === "ai" ? "ai" : "user"}`}
          >
            <div className="ci-msg-avatar">
              {msg.role === "user" ? "You" : "DIME"}
            </div>
            <div className="ci-bubble-wrap">
              <div className="ci-bubble">{msg.content}</div>
              {msg.attachment_url && (
                <div className="ci-message-attachments">
                  <a
                    className="ci-attachment-item file ci-generated-doc"
                    href={msg.attachment_url}
                    download={msg.attachment_filename || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="ci-attachment-file">
                      <span className="ci-attachment-icon">📄</span>
                      <span className="ci-attachment-name">
                        {msg.attachment_filename || "Download document"}
                      </span>
                      <span className="ci-attachment-download">⬇</span>
                    </div>
                  </a>
                </div>
              )}
              {msg.attachments?.length > 0 && (
                <div className="ci-message-attachments">
                  {msg.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className={`ci-attachment-item ${attachment.previewUrl ? "image" : "file"}`}
                    >
                      {attachment.previewUrl ? (
                        <img
                          src={attachment.previewUrl}
                          alt={attachment.name}
                          className="ci-attachment-image"
                        />
                      ) : (
                        <div className="ci-attachment-file">
                          <span className="ci-attachment-icon">📄</span>
                          <span className="ci-attachment-name">
                            {attachment.name}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="ci-msg-time">
                {formatMessageTime(
                  msg.timestamp || msg.created_at || msg.sent_at
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="ci-msg ai">
            <div className="ci-msg-avatar">DIME</div>
            <div className="ci-bubble">
              <div className="ci-typing">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <footer className="ci-input-area">
        <div className="ci-input-bar">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar"
            onChange={handleFilesSelected}
          />
          <button
            type="button"
            className="ci-attach"
            onClick={handleAttachClick}
            disabled={loading || !threadId}
            aria-label="Add attachment"
          >
            +
          </button>
          <div className="ci-input-main">
            {attachments.length > 0 && (
              <div className="ci-attachment-list">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="ci-attachment-chip">
                    {attachment.previewUrl ? (
                      <img
                        src={attachment.previewUrl}
                        alt={attachment.name}
                        className="ci-attachment-thumb"
                      />
                    ) : (
                      <span className="ci-attachment-icon">📄</span>
                    )}
                    <span className="ci-attachment-name">{attachment.name}</span>
                    <button
                      type="button"
                      className="ci-attachment-remove"
                      onClick={() => removeAttachment(attachment.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <textarea
              className="ci-textarea"
              value={text}
              placeholder={threadId ? "Ask anything..." : "Loading chat..."}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={loading || !threadId}
            />
          </div>
          <button
            className="ci-send"
            onClick={handleSend}
            disabled={loading || !threadId}
          >
            {loading ? "⏳" : "➤"}
          </button>
        </div>
      </footer>
    </>
  );
}
