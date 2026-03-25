"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";

const SUGGESTED = [
  "What are the main employment trends?",
  "How does automation affect labor markets?",
  "What is the impact of migration on wages?",
  "How do low-income countries compete for workers?",
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedSource, setExpandedSource] = useState(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  const handleAsk = useCallback(
    async (q) => {
      const text = (q ?? query).trim();
      if (!text || loading) return;

      const userMsg = {
        id: `u-${Date.now()}`,
        role: "user",
        content: text,
      };

      setMessages((p) => [...p, userMsg]);
      setQuery("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      setLoading(true);

      try {
        const res = await axios.post(
          "http://127.0.0.1:8000/api/rag/rag/query/",
          { query: text },
          { headers: { "Content-Type": "application/json" } }
        );

        setMessages((p) => [
          ...p,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: res.data.answer,
            sources: res.data.sources,
            duration_ms: res.data.duration_ms,
          },
        ]);
      } catch (err) {
        setMessages((p) => [
          ...p,
          {
            id: `e-${Date.now()}`,
            role: "assistant",
            content:
              err?.response?.data?.error ||
              "Request failed. Is the Django server running?",
            error: true,
          },
        ]);
      }
      setLoading(false);
    },
    [query, loading]
  );

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:      #0c0c0e;
          --bg2:     #131316;
          --bg3:     #1a1a1f;
          --border:  rgba(255,255,255,0.07);
          --border2: rgba(255,255,255,0.12);
          --text:    #e8e8ec;
          --muted:   #6b6b78;
          --muted2:  #3e3e48;
          --accent:  #5b6af0;
          --accent2: #7c89f4;
          --gold:    #c9a96e;
          --gold2:   #e8c98a;
          --success: #4ade80;
          --warn:    #f59e0b;
          --danger:  #f87171;
          --font-display: 'Instrument Serif', Georgia, serif;
          --font-body:    'DM Sans', sans-serif;
        }

        html, body { height: 100%; background: var(--bg); color: var(--text); font-family: var(--font-body); }

        body::before {
          content: '';
          position: fixed; inset: 0; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        body::after {
          content: '';
          position: fixed;
          top: -20%; left: 50%;
          transform: translateX(-50%);
          width: 700px; height: 400px;
          background: radial-gradient(ellipse, rgba(91,106,240,0.08) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }

        .shell {
          position: relative; z-index: 1;
          display: flex; flex-direction: column;
          height: 100vh; max-width: 860px;
          margin: 0 auto;
        }

        /* Header */
        .header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 28px 18px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .header-left { display: flex; align-items: center; gap: 12px; }
        .logo-mark {
          width: 34px; height: 34px;
          background: linear-gradient(135deg, var(--accent), var(--gold));
          border-radius: 9px;
          display: grid; place-items: center;
          font-size: 16px;
        }
        .header h1 {
          font-family: var(--font-display);
          font-size: 18px; font-weight: 400;
          color: var(--text); letter-spacing: -0.01em;
        }
        .header-badge {
          font-size: 11px; font-weight: 500; letter-spacing: 0.06em;
          text-transform: uppercase;
          background: rgba(91,106,240,0.12);
          color: var(--accent2);
          border: 1px solid rgba(91,106,240,0.2);
          border-radius: 20px;
          padding: 3px 10px;
        }

        /* Messages */
        .messages {
          flex: 1; overflow-y: auto;
          padding: 28px 28px 0;
          scroll-behavior: smooth;
        }
        .messages::-webkit-scrollbar { width: 4px; }
        .messages::-webkit-scrollbar-track { background: transparent; }
        .messages::-webkit-scrollbar-thumb { background: var(--muted2); border-radius: 4px; }

        /* Empty state */
        .empty-state {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          height: 100%; gap: 32px;
          animation: fadeUp 0.6s ease both;
        }
        .empty-title {
          font-family: var(--font-display);
          font-size: 38px; font-weight: 400;
          color: var(--text); letter-spacing: -0.02em;
          line-height: 1.1; text-align: center;
        }
        .empty-title em { font-style: italic; color: var(--gold); }
        .empty-sub {
          font-size: 14px; color: var(--muted);
          text-align: center; max-width: 340px; line-height: 1.6;
          margin-top: 12px;
        }
        .suggestions {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 10px; width: 100%; max-width: 540px;
        }
        .suggestion-btn {
          background: var(--bg2); border: 1px solid var(--border);
          color: var(--muted); font-family: var(--font-body);
          font-size: 12.5px; line-height: 1.4;
          padding: 12px 14px; border-radius: 10px;
          text-align: left; cursor: pointer;
          transition: all 0.18s ease;
        }
        .suggestion-btn:hover {
          background: var(--bg3); border-color: var(--border2);
          color: var(--text); transform: translateY(-1px);
        }

        /* Message rows */
        .msg-row { margin-bottom: 24px; animation: fadeUp 0.35s ease both; }
        .msg-row.user { display: flex; justify-content: flex-end; }
        .msg-row.assistant { display: flex; flex-direction: column; gap: 12px; }

        .bubble-user {
          background: var(--accent); color: #fff;
          font-size: 14px; line-height: 1.65;
          padding: 12px 16px;
          border-radius: 18px 18px 4px 18px;
          max-width: 72%; word-break: break-word;
          box-shadow: 0 4px 24px rgba(91,106,240,0.25);
        }

        .bubble-assistant {
          background: var(--bg2); border: 1px solid var(--border);
          color: var(--text); font-size: 14px; line-height: 1.72;
          padding: 16px 18px;
          border-radius: 4px 18px 18px 18px;
          max-width: 88%; word-break: break-word;
        }
        .bubble-assistant.error { color: var(--danger); border-color: rgba(248,113,113,0.2); }

        /* Sources */
        .meta-row {
          display: flex; align-items: center; gap: 8px; padding-top: 4px;
        }
        .meta-label {
          font-size: 11px; font-weight: 500; letter-spacing: 0.05em;
          text-transform: uppercase; color: var(--muted);
        }
        .meta-time { font-size: 11px; color: var(--muted2); margin-left: auto; }

        .sources-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 8px; margin-top: 8px;
        }
        @media (max-width: 600px) { .sources-grid { grid-template-columns: 1fr; } }

        .source-card {
          background: var(--bg3); border: 1px solid var(--border);
          border-radius: 10px; padding: 12px;
          cursor: pointer; transition: all 0.18s ease;
        }
        .source-card:hover { border-color: var(--border2); background: #1e1e25; }
        .source-card.expanded { grid-column: 1 / -1; }

        .source-top {
          display: flex; align-items: center;
          justify-content: space-between; margin-bottom: 8px;
        }
        .source-page {
          font-size: 11px; font-weight: 600; letter-spacing: 0.04em;
          color: var(--gold); text-transform: uppercase;
        }
        .score-pill {
          font-size: 10px; font-weight: 600;
          padding: 2px 7px; border-radius: 20px;
        }
        .score-high { background: rgba(74,222,128,0.1);  color: var(--success); }
        .score-mid  { background: rgba(245,158,11,0.1);  color: var(--warn); }
        .score-low  { background: rgba(107,107,120,0.1); color: var(--muted); }

        .source-preview {
          font-size: 12px; color: var(--muted); line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 3; -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .source-card.expanded .source-preview {
          -webkit-line-clamp: unset; overflow: visible;
        }
        .source-file {
          font-size: 10.5px; color: var(--muted2); margin-top: 8px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .expand-hint { font-size: 10px; color: var(--accent2); margin-top: 6px; }

        /* Typing indicator */
        .typing-row { display: flex; margin-bottom: 24px; }
        .typing-bubble {
          background: var(--bg2); border: 1px solid var(--border);
          border-radius: 4px 18px 18px 18px;
          padding: 14px 18px;
          display: flex; align-items: center; gap: 5px;
        }
        .dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--muted2);
          animation: blink 1.2s ease-in-out infinite;
        }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }

        /* Input */
        .input-zone { padding: 16px 28px 24px; flex-shrink: 0; }
        .input-wrap {
          display: flex; align-items: flex-end; gap: 10px;
          background: var(--bg2); border: 1px solid var(--border);
          border-radius: 16px; padding: 12px 14px 12px 18px;
          transition: border-color 0.2s;
        }
        .input-wrap:focus-within { border-color: rgba(91,106,240,0.4); }

        textarea {
          flex: 1; background: transparent; border: none; outline: none;
          resize: none; color: var(--text);
          font-family: var(--font-body); font-size: 14px; line-height: 1.6;
          min-height: 24px; max-height: 160px; overflow-y: auto;
        }
        textarea::placeholder { color: var(--muted2); }
        textarea::-webkit-scrollbar { width: 3px; }
        textarea::-webkit-scrollbar-thumb { background: var(--muted2); }

        .send-btn {
          width: 34px; height: 34px; flex-shrink: 0;
          background: var(--accent); border: none; border-radius: 10px;
          cursor: pointer; display: grid; place-items: center;
          transition: all 0.18s ease; color: #fff;
        }
        .send-btn:hover:not(:disabled) { background: var(--accent2); transform: scale(1.05); }
        .send-btn:disabled { background: var(--muted2); cursor: not-allowed; opacity: 0.5; }

        .input-hint {
          font-size: 11px; color: var(--muted2);
          text-align: center; margin-top: 10px;
        }

        /* Animations */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); }
          40%            { opacity: 1;    transform: scale(1); }
        }
      `}</style>

      <div className="shell">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <div className="logo-mark">📖</div>
            <h1>WDR Report Assistant</h1>
          </div>
          <span className="header-badge">RAG · flan-t5</span>
        </header>

        {/* Messages */}
        <div className="messages">
          {isEmpty ? (
            <div className="empty-state">
              <div>
                <p className="empty-title">
                  Ask anything about
                  <br />
                  <em>World Development</em>
                </p>
                <p className="empty-sub">
                  Powered by retrieval-augmented generation over the full WDR report.
                </p>
              </div>
              <div className="suggestions">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    className="suggestion-btn"
                    onClick={() => handleAsk(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`msg-row ${msg.role}`}>
                {msg.role === "user" ? (
                  <div className="bubble-user">{msg.content}</div>
                ) : (
                  <>
                    <div className={`bubble-assistant${msg.error ? " error" : ""}`}>
                      {msg.content}
                    </div>

                    {msg.sources && msg.sources.length > 0 && (
                      <div>
                        <div className="meta-row">
                          <span className="meta-label">
                            ▸ {msg.sources.length} sources
                          </span>
                          {msg.duration_ms && (
                            <span className="meta-time">
                              {(msg.duration_ms / 1000).toFixed(1)}s
                            </span>
                          )}
                        </div>
                        <div className="sources-grid">
                          {msg.sources.map((src, i) => {
                            const key = `${msg.id}-${i}`;
                            const isExpanded = expandedSource === key;
                            const scoreClass =
                              src.score >= 0.8
                                ? "score-high"
                                : src.score >= 0.6
                                ? "score-mid"
                                : "score-low";
                            return (
                              <div
                                key={key}
                                className={`source-card${isExpanded ? " expanded" : ""}`}
                                onClick={() =>
                                  setExpandedSource(isExpanded ? null : key)
                                }
                              >
                                <div className="source-top">
                                  <span className="source-page">p. {src.page}</span>
                                  <span className={`score-pill ${scoreClass}`}>
                                    {Math.round(src.score * 100)}%
                                  </span>
                                </div>
                                <p className="source-preview">{src.preview}</p>
                                <p className="source-file">{src.source}</p>
                                <p className="expand-hint">
                                  {isExpanded ? "▲ collapse" : "▼ expand"}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
          )}

          {/* Typing indicator */}
          {loading && (
            <div className="typing-row">
              <div className="typing-bubble">
                <div className="dot" />
                <div className="dot" />
                <div className="dot" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="input-zone">
          <div className="input-wrap">
            <textarea
              ref={textareaRef}
              value={query}
              rows={1}
              placeholder="Ask about employment, migration, automation..."
              onChange={(e) => {
                setQuery(e.target.value);
                autoResize();
              }}
              onKeyDown={handleKey}
            />
            <button
              className="send-btn"
              onClick={() => handleAsk()}
              disabled={!query.trim() || loading}
            >
              <svg
                width="15" height="15" viewBox="0 0 24 24"
                fill="none" stroke="currentColor"
                strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <p className="input-hint">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </>
  );
}