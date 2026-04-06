import { useState, useEffect, useRef } from "react";

const CLAUDE_MODEL = "claude-sonnet-4-20250514";

async function callClaude(systemPrompt, userMessage) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  const data = await response.json();
  return data.content?.[0]?.text || "No response received.";
}

// ─── Styles ────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body { background: #0a0e1a; color: #e8e4dc; font-family: 'DM Sans', sans-serif; }

  .app {
    min-height: 100vh;
    background: #0a0e1a;
    background-image: radial-gradient(ellipse at 20% 10%, rgba(180,140,80,0.08) 0%, transparent 50%),
                      radial-gradient(ellipse at 80% 90%, rgba(60,80,140,0.1) 0%, transparent 50%);
  }

  .sidebar {
    position: fixed; left: 0; top: 0; bottom: 0; width: 220px;
    background: rgba(255,255,255,0.03);
    border-right: 1px solid rgba(255,255,255,0.07);
    display: flex; flex-direction: column; padding: 32px 0;
    backdrop-filter: blur(10px);
    z-index: 100;
  }

  .logo {
    padding: 0 24px 32px;
    font-family: 'Playfair Display', serif;
    font-size: 20px; font-weight: 700;
    color: #c9a84c;
    letter-spacing: -0.3px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    margin-bottom: 24px;
  }
  .logo span { display: block; font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 400; color: rgba(232,228,220,0.4); letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px; }

  .nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 24px; cursor: pointer;
    color: rgba(232,228,220,0.5);
    font-size: 14px; font-weight: 500;
    border-left: 2px solid transparent;
    transition: all 0.2s;
  }
  .nav-item:hover { color: #e8e4dc; background: rgba(255,255,255,0.04); }
  .nav-item.active { color: #c9a84c; border-left-color: #c9a84c; background: rgba(201,168,76,0.08); }
  .nav-icon { font-size: 18px; width: 22px; text-align: center; }

  .main { margin-left: 220px; min-height: 100vh; padding: 48px; }

  .page-title {
    font-family: 'Playfair Display', serif;
    font-size: 32px; font-weight: 700;
    color: #e8e4dc; margin-bottom: 6px;
    letter-spacing: -0.5px;
  }
  .page-sub { color: rgba(232,228,220,0.45); font-size: 14px; margin-bottom: 40px; font-weight: 300; }

  .card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 28px;
    margin-bottom: 20px;
    transition: border-color 0.2s;
  }
  .card:hover { border-color: rgba(201,168,76,0.2); }
  .card-title {
    font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
    color: rgba(232,228,220,0.45); margin-bottom: 18px;
  }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 32px; }

  .stat-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px; padding: 24px;
  }
  .stat-value { font-family: 'Playfair Display', serif; font-size: 36px; color: #c9a84c; font-weight: 700; }
  .stat-label { font-size: 13px; color: rgba(232,228,220,0.45); margin-top: 4px; font-weight: 400; }

  textarea, input[type="text"] {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    color: #e8e4dc;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    padding: 14px 16px;
    resize: vertical;
    outline: none;
    transition: border-color 0.2s;
    line-height: 1.6;
  }
  textarea:focus, input[type="text"]:focus { border-color: rgba(201,168,76,0.5); }
  textarea::placeholder, input::placeholder { color: rgba(232,228,220,0.25); }

  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 24px; border-radius: 10px; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
    transition: all 0.2s; letter-spacing: 0.2px;
  }
  .btn-gold { background: #c9a84c; color: #0a0e1a; }
  .btn-gold:hover { background: #d9b85c; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(201,168,76,0.3); }
  .btn-ghost { background: rgba(255,255,255,0.06); color: #e8e4dc; border: 1px solid rgba(255,255,255,0.1); }
  .btn-ghost:hover { background: rgba(255,255,255,0.1); }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }

  .spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(10,14,26,0.3);
    border-top-color: #0a0e1a;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .ai-response {
    margin-top: 20px;
    background: rgba(201,168,76,0.06);
    border: 1px solid rgba(201,168,76,0.2);
    border-radius: 12px;
    padding: 22px;
    font-size: 14px;
    line-height: 1.8;
    color: #e8e4dc;
    white-space: pre-wrap;
    animation: fadeIn 0.4s ease;
  }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .badge {
    display: inline-block; padding: 3px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;
  }
  .badge-red { background: rgba(220,60,60,0.15); color: #e87878; border: 1px solid rgba(220,60,60,0.2); }
  .badge-amber { background: rgba(201,168,76,0.15); color: #c9a84c; border: 1px solid rgba(201,168,76,0.2); }
  .badge-green { background: rgba(60,180,120,0.15); color: #5cd4a0; border: 1px solid rgba(60,180,120,0.2); }

  .task-item {
    display: flex; align-items: flex-start; gap: 14px;
    padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .task-item:last-child { border-bottom: none; }
  .task-num {
    width: 28px; height: 28px; border-radius: 50%; background: rgba(201,168,76,0.15);
    color: #c9a84c; font-weight: 700; font-size: 12px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .task-text { flex: 1; }
  .task-name { font-weight: 500; font-size: 14px; color: #e8e4dc; }
  .task-reason { font-size: 12px; color: rgba(232,228,220,0.4); margin-top: 3px; }

  .input-row { display: flex; gap: 10px; margin-bottom: 10px; }
  .input-row input { flex: 1; }

  .tag {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,0.07); border-radius: 6px;
    padding: 5px 10px; font-size: 13px; margin: 4px;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .tag button { background: none; border: none; color: rgba(232,228,220,0.4); cursor: pointer; font-size: 14px; line-height: 1; }
  .tag button:hover { color: #e87878; }

  .divider { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 24px 0; }

  .schedule-block {
    display: flex; align-items: flex-start; gap: 16px;
    padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .schedule-block:last-child { border-bottom: none; }
  .time-label { font-size: 12px; color: #c9a84c; font-weight: 600; min-width: 70px; padding-top: 2px; }

  .tip-box {
    background: rgba(60,80,180,0.08); border: 1px solid rgba(60,80,180,0.2);
    border-radius: 10px; padding: 14px 18px; font-size: 13px;
    color: rgba(232,228,220,0.6); line-height: 1.7; margin-top: 16px;
  }

  .empty-state { text-align: center; padding: 40px; color: rgba(232,228,220,0.3); font-size: 14px; }
  .empty-icon { font-size: 36px; margin-bottom: 10px; }
`;

// ─── Dashboard ─────────────────────────────────────────────────────────────
function Dashboard({ tasks, emails }) {
  return (
    <div>
      <div className="page-title">Good morning ☀️</div>
      <div className="page-sub">Here's your life admin overview for today.</div>

      <div className="grid-3">
        <div className="stat-card">
          <div className="stat-value">{tasks.length}</div>
          <div className="stat-label">Tasks in queue</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{emails.length}</div>
          <div className="stat-label">Emails triaged</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">~2h</div>
          <div className="stat-label">Estimated time saved today</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">🎯 What this app does</div>
          <div style={{ fontSize: 14, color: "rgba(232,228,220,0.6)", lineHeight: 1.9 }}>
            <div style={{ marginBottom: 10 }}>📧 <strong style={{ color: "#e8e4dc" }}>Email Triage</strong> — Paste any email. AI classifies its urgency and drafts a smart reply for you.</div>
            <div style={{ marginBottom: 10 }}>✅ <strong style={{ color: "#e8e4dc" }}>Task Digest</strong> — Add your to-dos. AI ranks them by priority with clear reasoning.</div>
            <div>📅 <strong style={{ color: "#e8e4dc" }}>Smart Schedule</strong> — Describe your day. AI builds an optimized schedule with focus time blocks.</div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">🚀 Quick start</div>
          <div style={{ fontSize: 13, color: "rgba(232,228,220,0.5)", lineHeight: 2 }}>
            <div>1. Go to <strong style={{ color: "#c9a84c" }}>Email Triage</strong> → paste an email → get AI classification + reply draft</div>
            <div>2. Go to <strong style={{ color: "#c9a84c" }}>Task Digest</strong> → add your tasks → let AI prioritize your day</div>
            <div>3. Go to <strong style={{ color: "#c9a84c" }}>Schedule</strong> → describe your day → get a smart hour-by-hour plan</div>
          </div>
          <div className="tip-box" style={{ marginTop: 16 }}>
            💡 All responses are generated live by Claude AI — no canned answers.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Email Triage ───────────────────────────────────────────────────────────
function EmailTriage({ onEmailAdded }) {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const SYSTEM = `You are an elite executive assistant AI. When given an email, respond with:

URGENCY: [CRITICAL / HIGH / MEDIUM / LOW]
REASON: [One sentence explaining the urgency level]
CATEGORY: [e.g. Client Request / Internal Admin / Invoice / Meeting / Newsletter / Other]
SUMMARY: [2-3 sentence plain-English summary of the email]
ACTION: [What the recipient should do — be specific]
DRAFT REPLY:
[Write a professional, warm, and concise reply. Match the tone of the original. Max 5 sentences.]

Keep your response clean and structured exactly as above.`;

  async function triage() {
    if (!email.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await callClaude(SYSTEM, `Triage this email:\n\n${email}`);
      setResult(res);
      onEmailAdded(email.slice(0, 60) + "...");
    } catch (e) {
      setResult("Error calling AI. Please try again.");
    }
    setLoading(false);
  }

  function getUrgencyBadge(text) {
    if (!text) return null;
    if (text.includes("URGENCY: CRITICAL")) return <span className="badge badge-red">🔴 Critical</span>;
    if (text.includes("URGENCY: HIGH")) return <span className="badge badge-amber">🟡 High</span>;
    if (text.includes("URGENCY: MEDIUM")) return <span className="badge badge-green">🟢 Medium</span>;
    return <span className="badge badge-green">⚪ Low</span>;
  }

  return (
    <div>
      <div className="page-title">Email Triage</div>
      <div className="page-sub">Paste any email — AI classifies urgency, summarizes it, and drafts your reply.</div>

      <div className="card">
        <div className="card-title">📧 Paste email content</div>
        <textarea
          rows={8}
          placeholder="Paste the full email here — subject, body, everything. The more context, the better the reply..."
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
          <button className="btn btn-gold" onClick={triage} disabled={loading || !email.trim()}>
            {loading ? <><span className="spinner" /> Analyzing...</> : "⚡ Triage Email"}
          </button>
          {email && <button className="btn btn-ghost" onClick={() => { setEmail(""); setResult(null); }}>Clear</button>}
        </div>
      </div>

      {result && (
        <div className="card" style={{ border: "1px solid rgba(201,168,76,0.25)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>AI Analysis</div>
            {getUrgencyBadge(result)}
          </div>
          <div className="ai-response">{result}</div>
        </div>
      )}

      {!result && !loading && (
        <div className="tip-box">
          💡 <strong>Tip:</strong> Include the full email thread for better context. AI will identify tone, urgency, and what action you need to take — then write a ready-to-send reply.
        </div>
      )}
    </div>
  );
}

// ─── Task Digest ────────────────────────────────────────────────────────────
function TaskDigest() {
  const [taskInput, setTaskInput] = useState("");
  const [tasks, setTasks] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const SYSTEM = `You are a world-class productivity coach and AI assistant. Given a list of tasks, return a prioritized daily task list.

Format your response EXACTLY like this (one task per block):

RANK 1 | [Task Name]
Why: [1 sentence — why this is the top priority]
Time estimate: [e.g. 45 min]
Energy needed: [High / Medium / Low]

RANK 2 | [Task Name]
Why: [1 sentence]
Time estimate: [e.g. 20 min]
Energy needed: [High / Medium / Low]

...and so on.

At the end, add:
---
DAILY SUMMARY: [2-3 sentences about the day's theme and a motivational note]
FOCUS BLOCK SUGGESTION: [Best 2-hour window for deep work and why]`;

  function addTask() {
    if (!taskInput.trim()) return;
    setTasks([...tasks, taskInput.trim()]);
    setTaskInput("");
  }

  function removeTask(i) {
    setTasks(tasks.filter((_, idx) => idx !== i));
  }

  async function prioritize() {
    if (tasks.length === 0) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await callClaude(SYSTEM, `Prioritize these tasks for today:\n${tasks.map((t, i) => `${i + 1}. ${t}`).join("\n")}`);
      setResult(res);
    } catch (e) {
      setResult("Error calling AI. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="page-title">Daily Task Digest</div>
      <div className="page-sub">Add your to-dos and AI will rank them by impact, urgency, and energy.</div>

      <div className="card">
        <div className="card-title">✅ Your tasks today</div>
        <div className="input-row">
          <input
            type="text"
            placeholder="Add a task... (press Enter)"
            value={taskInput}
            onChange={e => setTaskInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTask()}
          />
          <button className="btn btn-gold" onClick={addTask} disabled={!taskInput.trim()}>+ Add</button>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            No tasks yet. Add some above to get started.
          </div>
        ) : (
          <div style={{ marginTop: 10 }}>
            {tasks.map((t, i) => (
              <span key={i} className="tag">
                {t}
                <button onClick={() => removeTask(i)}>×</button>
              </span>
            ))}
          </div>
        )}

        {tasks.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <button className="btn btn-gold" onClick={prioritize} disabled={loading}>
              {loading ? <><span className="spinner" /> Prioritizing...</> : "🎯 Prioritize My Day"}
            </button>
          </div>
        )}
      </div>

      {result && (
        <div className="card" style={{ border: "1px solid rgba(201,168,76,0.25)" }}>
          <div className="card-title">AI Priority List</div>
          <div className="ai-response">{result}</div>
        </div>
      )}
    </div>
  );
}

// ─── Smart Schedule ─────────────────────────────────────────────────────────
function SmartSchedule() {
  const [context, setContext] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const SYSTEM = `You are an elite personal scheduler and productivity expert. Given a description of someone's day (meetings, tasks, energy levels, preferences), create a detailed hour-by-hour schedule.

Format your response as:

SCHEDULE FOR TODAY
==================

[TIME] — [Activity]
[Brief note: why this time slot / any tips]

[TIME] — [Activity]
[Brief note]

...

Include:
- Specific time blocks for all mentioned meetings/tasks
- At least one "FOCUS BLOCK 🔒" for deep work (protect this time — no meetings)
- Breaks and lunch
- Buffer time between meetings
- End-of-day review block

After the schedule, add:
---
KEY INSIGHT: [One key observation about today's schedule and how to make the most of it]
PROTECT AT ALL COSTS: [The single most important block and why]`;

  async function generate() {
    if (!context.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await callClaude(SYSTEM, `Build my schedule based on this:\n\n${context}`);
      setResult(res);
    } catch (e) {
      setResult("Error calling AI. Please try again.");
    }
    setLoading(false);
  }

  const example = `I have a team standup at 9am (30 min), a client call at 2pm (1 hour), and a deadline to finish a quarterly report by EOD. I work best in the mornings and get tired after 3pm. I need to also review 3 contracts and send 5 emails. I prefer a lunch break around 12:30.`;

  return (
    <div>
      <div className="page-title">Smart Scheduling</div>
      <div className="page-sub">Describe your day and AI builds your optimized hour-by-hour plan with focus blocks.</div>

      <div className="card">
        <div className="card-title">📅 Describe your day</div>
        <textarea
          rows={6}
          placeholder="Tell me: your meetings (with times), tasks to complete, energy levels throughout the day, preferences, and any deadlines..."
          value={context}
          onChange={e => setContext(e.target.value)}
        />
        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-gold" onClick={generate} disabled={loading || !context.trim()}>
            {loading ? <><span className="spinner" /> Building schedule...</> : "📅 Build My Schedule"}
          </button>
          <button className="btn btn-ghost" onClick={() => setContext(example)}>Try Example</button>
          {context && <button className="btn btn-ghost" onClick={() => { setContext(""); setResult(null); }}>Clear</button>}
        </div>
      </div>

      {result && (
        <div className="card" style={{ border: "1px solid rgba(201,168,76,0.25)" }}>
          <div className="card-title">Your AI-Built Schedule</div>
          <div className="ai-response">{result}</div>
        </div>
      )}

      {!result && !loading && (
        <div className="tip-box">
          💡 <strong>Tip:</strong> Include your energy levels ("I'm usually tired after 3pm"), meeting times, deep work tasks, and any deadlines. The more you share, the more tailored your schedule.
        </div>
      )}
    </div>
  );
}

// ─── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [tasks, setTasks] = useState([]);
  const [emails, setEmails] = useState([]);

  const nav = [
    { id: "dashboard", icon: "🏠", label: "Dashboard" },
    { id: "email", icon: "📧", label: "Email Triage" },
    { id: "tasks", icon: "✅", label: "Task Digest" },
    { id: "schedule", icon: "📅", label: "Smart Schedule" },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <nav className="sidebar">
          <div className="logo">
            ARIA
            <span>AI Life Admin</span>
          </div>
          {nav.map(n => (
            <div
              key={n.id}
              className={`nav-item ${page === n.id ? "active" : ""}`}
              onClick={() => setPage(n.id)}
            >
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </div>
          ))}
          <div style={{ marginTop: "auto", padding: "24px", fontSize: 11, color: "rgba(232,228,220,0.2)", lineHeight: 1.6 }}>
            ARIA MVP v1.0<br />Powered by Claude AI
          </div>
        </nav>
        <main className="main">
          {page === "dashboard" && <Dashboard tasks={tasks} emails={emails} />}
          {page === "email" && <EmailTriage onEmailAdded={e => setEmails(prev => [...prev, e])} />}
          {page === "tasks" && <TaskDigest />}
          {page === "schedule" && <SmartSchedule />}
        </main>
      </div>
    </>
  );
}

