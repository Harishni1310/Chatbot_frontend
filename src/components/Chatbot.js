import { useState, useRef, useEffect, useCallback } from "react";
import { sendMessage, getNotifications, getSuggestions } from "../services/api";

const FALLBACK_SUGGESTIONS = [
  { icon: "📅", text: "What are the exam dates?" },
  { icon: "📊", text: "How to check my results?" },
  { icon: "🎓", text: "Tell me about admissions" },
  { icon: "📚", text: "What is the syllabus?" },
  { icon: "💰", text: "How to apply for scholarship?" },
  { icon: "📋", text: "What documents are needed?" },
];

const SUGGESTION_ICONS = ["📅", "📊", "🎓", "📚", "💰", "📋", "❓", "🔍"];

const formatTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const getTitle = (text) =>
  text.length > 30 ? text.slice(0, 30) + "…" : text;

const STORAGE_KEY = (userId) => `chat_sessions_${userId}`;

// Typewriter hook
const useTypewriter = (text, speed = 18, enabled = true) => {
  const [displayed, setDisplayed] = useState(enabled ? "" : text);
  const [done, setDone] = useState(!enabled);

  useEffect(() => {
    if (!enabled) { setDisplayed(text); setDone(true); return; }
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(interval); setDone(true); }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, enabled]);

  return { displayed, done };
};

// Single bot message with typewriter
const BotMessage = ({ msg, isLatest, onReact }) => {
  const { displayed } = useTypewriter(msg.text, 16, isLatest);
  const [reaction, setReaction] = useState(null);

  const handleReact = (r) => {
    setReaction(r);
    onReact?.(r);
  };

  return (
    <div className="message-row bot">
      <div className="message-avatar bot">
        <span>🤖</span>
        <div className="avatar-pulse-ring" />
      </div>
      <div className="message-content">
        <div className="message-bubble bot">{displayed}</div>
        <div className="message-meta">
          <span className="message-time">{msg.time}</span>
          <div className="message-reactions">
            <button
              className={`reaction-btn ${reaction === "up" ? "active-up" : ""}`}
              onClick={() => handleReact("up")}
              title="Helpful"
            >👍</button>
            <button
              className={`reaction-btn ${reaction === "down" ? "active-down" : ""}`}
              onClick={() => handleReact("down")}
              title="Not helpful"
            >👎</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Chatbot = ({ onLogout, isGuest = false, userId = null }) => {
  const storageKey = useRef(isGuest ? null : STORAGE_KEY(userId)).current;

  const [sessions, setSessions] = useState(() => {
    if (!storageKey) return [];
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [latestBotIdx, setLatestBotIdx] = useState(-1);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const chatEndRef = useRef(null);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    getNotifications().then(d => setNotifications(d.data || [])).catch(() => {});
    getSuggestions(isGuest ? null : userId)
      .then(d => setSuggestions(Array.isArray(d) ? d : (d.data || [])))
      .catch(() => {});
  }, []); // eslint-disable-line

  const loadSuggestions = () => {
    getSuggestions(isGuest ? null : userId)
      .then(d => setSuggestions(Array.isArray(d) ? d : (d.data || [])))
      .catch(() => {});
  };

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, loading, scrollToBottom]);

  const handleScroll = () => {
    const el = chatWindowRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 150);
  };

  const saveSessions = (updated) => {
    if (storageKey) {
      try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch { }
    }
  };

  const startNewChat = () => {
    const newId = Date.now();
    setActiveId(newId);
    setMessages([]);
    setInput("");
    setLatestBotIdx(-1);
    setSessions((prev) => {
      const updated = [
        { id: newId, title: "New Chat", messages: [] },
        ...prev.filter((s) => s.messages.length > 0),
      ];
      saveSessions(updated);
      return updated;
    });
  };

  const loadSession = (session) => {
    setActiveId(session.id);
    setMessages(session.messages);
    setLatestBotIdx(-1);
    setInput("");
  };

  const deleteSession = (e, id) => {
    e.stopPropagation();
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveSessions(updated);
      return updated;
    });
    if (activeId === id) { setActiveId(null); setMessages([]); }
  };

  const handleSend = async (text) => {
    const question = (text || input).trim();
    if (!question || loading) return;

    let currentId = activeId;
    if (!currentId) {
      currentId = Date.now();
      setActiveId(currentId);
    }

    const userMsg = { role: "user", text: question, time: formatTime() };
    const withUser = [...messages, userMsg];
    setMessages(withUser);
    setInput("");
    setLoading(true);

    setSessions((prev) => {
      const exists = prev.find((s) => s.id === currentId);
      let updated;
      if (exists) {
        updated = prev.map((s) =>
          s.id === currentId ? { ...s, messages: withUser, title: getTitle(question) } : s
        );
      } else {
        updated = [{ id: currentId, title: getTitle(question), messages: withUser }, ...prev];
      }
      saveSessions(updated);
      return updated;
    });

    try {
      const data = await sendMessage(question, isGuest ? null : userId);
      const botMsg = {
        role: "bot",
        text: data.answer || data.response || data.message || "I received your message!",
        time: formatTime(),
      };
      const withBot = [...withUser, botMsg];
      setMessages(withBot);
      setLatestBotIdx(withBot.length - 1);
      setSessions((prev) => {
        const updated = prev.map((s) =>
          s.id === currentId ? { ...s, messages: withBot } : s
        );
        saveSessions(updated);
        return updated;
      });
      loadSuggestions();
    } catch {
      const errMsg = {
        role: "bot",
        text: "⚠️ Unable to connect to the server. Please ensure the backend is running on port 8080.",
        time: formatTime(),
      };
      const withErr = [...withUser, errMsg];
      setMessages(withErr);
      setLatestBotIdx(withErr.length - 1);
      setSessions((prev) => {
        const updated = prev.map((s) =>
          s.id === currentId ? { ...s, messages: withErr } : s
        );
        saveSessions(updated);
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const charCount = input.length;
  const charLimit = 500;

  // ── Voice Input ──
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);

  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    if (listeningRef.current) {
      recognitionRef.current?.stop();
      listeningRef.current = false;
      setListening(false);
      setInterimText("");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => { listeningRef.current = true; setListening(true); };

    recognition.onresult = (e) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      if (final) {
        setInput((prev) => (prev + " " + final).trim().slice(0, 500));
        setInterimText("");
      } else {
        setInterimText(interim);
      }
    };

    recognition.onerror = (e) => {
      console.error("Speech error:", e.error);
      listeningRef.current = false;
      setListening(false);
      setInterimText("");
    };

    recognition.onend = () => {
      if (listeningRef.current) {
        // Auto-restart to keep listening continuously
        try { recognition.start(); } catch { }
      } else {
        setListening(false);
        setInterimText("");
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="chatbot-layout">
      {/* Animated grid background */}
      <div className="chat-grid-bg" />
      <div className="chatbot-bg-orb chatbot-bg-orb-1" />
      <div className="chatbot-bg-orb chatbot-bg-orb-2" />
      <div className="chatbot-bg-orb chatbot-bg-orb-3" />

      {/* ── SIDEBAR ── */}
      <aside className={`chat-sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">🤖</div>
            {sidebarOpen && <span className="sidebar-logo-text">AI Assistant</span>}
          </div>
          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Collapse" : "Expand"}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        <button className="new-chat-btn" onClick={startNewChat} title="New Chat">
          <span className="new-chat-icon">✏️</span>
          {sidebarOpen && <span>New Chat</span>}
        </button>

        <div className="sidebar-history">
          {sidebarOpen && <p className="sidebar-section-label">Chat History</p>}
          <div className="history-list">
            {sessions.filter((s) => s.messages.length > 0).length === 0 && sidebarOpen && (
              <p className="history-empty">No chats yet</p>
            )}
            {sessions.filter((s) => s.messages.length > 0).map((session) => (
              <div
                key={session.id}
                className={`history-item ${activeId === session.id ? "active" : ""}`}
                onClick={() => loadSession(session)}
                title={session.title}
              >
                <span className="history-icon">💬</span>
                {sidebarOpen && (
                  <>
                    <span className="history-title">{session.title}</span>
                    <button
                      className="history-delete-btn"
                      onClick={(e) => deleteSession(e, session.id)}
                      title="Delete"
                    >🗑</button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          {sidebarOpen && isGuest && (
            <div className="sidebar-guest-notice">👤 Guest Mode</div>
          )}
          <button className="sidebar-logout-btn" onClick={onLogout} title="Logout">
            <span>🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="chat-main">
        {/* Enhanced topbar */}
        <div className="chat-topbar">
          <div className="chat-topbar-left">
            <div className="topbar-bot-avatar">🤖</div>
            <div className="topbar-bot-info">
              <div className="topbar-bot-name">
                AI Student Assistant
                {isGuest && <span className="guest-badge">👤 Guest</span>}
              </div>
              <div className="topbar-bot-status">
                <span className="status-dot" />
                <span>Online · Powered by Groq AI</span>
              </div>
            </div>
          </div>
          <div className="chat-topbar-right">
            {/* Notification Bell */}
            <div className="notif-bell-wrap">
              <button className="notif-bell-btn" onClick={() => setShowNotifs(!showNotifs)} title="Notifications">
                🔔
                {notifications.length > 0 && (
                  <span className="notif-bell-count">{notifications.length}</span>
                )}
              </button>
              {showNotifs && (
                <div className="notif-dropdown">
                  <div className="notif-dropdown-header">
                    <span>🔔 Notifications</span>
                    <button onClick={() => setShowNotifs(false)}>✕</button>
                  </div>
                  <div className="notif-dropdown-list">
                    {notifications.length === 0 && (
                      <p className="notif-empty">No notifications</p>
                    )}
                    {notifications.map(n => (
                      <div key={n.id} className="notif-item">
                        <div className="notif-item-title">{n.title}</div>
                        <div className="notif-item-msg">{n.message}</div>
                        <div className="notif-item-time">
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button className="new-chat-topbar-btn" onClick={startNewChat}>
              ✏️ New Chat
            </button>
          </div>
        </div>

        {/* Chat window */}
        <div
          className="chat-window"
          ref={chatWindowRef}
          onScroll={handleScroll}
        >
          {messages.length === 0 && (
            <div className="chat-welcome">
              <div className="welcome-bot-icon">
                <span>🤖</span>
                <div className="welcome-pulse-ring" />
              </div>
              <h2>Hello! I'm your AI Assistant</h2>
              <p>Ask me anything about exams, syllabus, results, admissions, or scholarships!</p>
              <div className="chat-suggestions">
                {(suggestions.length > 0
                  ? suggestions.map((s, i) => ({ icon: SUGGESTION_ICONS[i % SUGGESTION_ICONS.length], text: s }))
                  : FALLBACK_SUGGESTIONS
                ).map((s) => (
                  <button key={s.text} className="chat-suggestion-btn" onClick={() => handleSend(s.text)}>
                    <span className="suggestion-icon">{s.icon}</span>
                    <span>{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) =>
            msg.role === "bot" ? (
              <BotMessage
                key={i}
                msg={msg}
                isLatest={i === latestBotIdx}
              />
            ) : (
              <div key={i} className="message-row user">
                <div className="message-avatar user">👤</div>
                <div className="message-content">
                  <div className="message-bubble user">{msg.text}</div>
                  <div className="message-meta">
                    <span className="message-time">{msg.time}</span>
                  </div>
                </div>
              </div>
            )
          )}

          {loading && (
            <div className="typing-indicator">
              <div className="message-avatar bot">
                <span>🤖</span>
                <div className="avatar-pulse-ring" />
              </div>
              <div className="typing-bubble">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-label">AI is thinking...</span>
              </div>
            </div>
          )}

          {/* Dynamic suggestions bar after conversation */}
          {messages.length > 0 && !loading && suggestions.length > 0 && (
            <div className="dynamic-suggestions">
              <p className="dynamic-suggestions-label">💡 Quick suggestions</p>
              <div className="dynamic-suggestions-list">
                {suggestions.slice(0, 4).map((s, i) => (
                  <button
                    key={i}
                    className="dynamic-suggestion-chip"
                    onClick={() => handleSend(s)}
                  >
                    {SUGGESTION_ICONS[i % SUGGESTION_ICONS.length]} {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Scroll to bottom button */}
        {showScrollBtn && (
          <button className="scroll-to-bottom-btn" onClick={scrollToBottom} title="Scroll to bottom">
            ↓
          </button>
        )}

        {/* Input area */}
        <div className="chat-input-area">
          <div className="chat-input-wrap">
            <button
              className={`voice-btn ${listening ? "listening" : ""}`}
              onClick={toggleVoice}
              title={listening ? "Stop listening" : "Voice input"}
              type="button"
            >
              {listening ? "🔴" : "🎙️"}
            </button>
            <textarea
              className="chat-input"
              placeholder={listening ? "🎙️ Listening... speak now" : "Ask about exams, syllabus, results, admissions..."}
              value={listening && interimText ? interimText : input}
              onChange={(e) => { if (!listening) setInput(e.target.value.slice(0, charLimit)); }}
              onKeyDown={handleKeyDown}
              rows={1}
              readOnly={listening}
            />
            <div className="input-actions">
              <span className={`char-counter ${charCount > charLimit * 0.85 ? "warn" : ""}`}>
                {charCount}/{charLimit}
              </span>
              <button
                className={`chat-send-btn ${loading ? "sending" : ""}`}
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                title="Send message"
              >
                {loading ? "" : "➤"}
              </button>
            </div>
          </div>
          <p className="chat-input-hint">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </main>
    </div>
  );
};

export default Chatbot;
