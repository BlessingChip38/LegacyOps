import { useState, useEffect } from "react";
import { daysDiff, fmtTime } from "../utils.js";
import { btnStyle, selectStyle, avatarStyle } from "../styles/shared.js";
import SectionHeader from "../components/SectionHeader";
import { request } from "../api/client.js";

// ─── component ───────────────────────────────────────────
export default function TimeClockTab({
  jobs = [],
  employees = [],
  punchRecords = [],
  onDataChange,
  auth
}) {
  const [selEmp, setSelEmp] = useState("");
  const [selJob, setSelJob] = useState("");
  const [msg, setMsg] = useState(null);

  // ─── message timeout ───────────────────────────────────
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 4000);
    return () => clearTimeout(t);
  }, [msg]);

  // ─── PUNCH IN ─────────────────────────────────────────
  const punchIn = async () => {
    if (!selEmp || !selJob) {
      setMsg({ type: "err", text: "Select employee and job." });
      return;
    }

    const alreadyIn = punchRecords.some(
      p => p.empId === Number(selEmp) && !p.punchOut
    );

    if (alreadyIn) {
      setMsg({ type: "err", text: "Already clocked in." });
      return;
    }
    

     try {
    await request(
      "/api/PunchCard",
      "POST",
      auth,
      { empId: selEmp, jobId: selJob }
    );

    onDataChange?.();

  } catch (err) {
    console.error(err);
  }
};

  // ─── PUNCH OUT ────────────────────────────────────────
  const punchOut = async (id) => {
  try {
      await request(
        `/api/PunchCard/${id}/clockout`,
        "POST",
        auth
      );

      onDataChange?.();

    } catch (err) {
      console.error(err);
    }
  };
  // ─── Date Helper Function ──────────────────────────



  // ─── ACTIVE / COMPLETED DATA ──────────────────────────
  const active = punchRecords.filter(p => !p.punchOut);
  const completed = punchRecords.filter(p => 
    p.punchOut && daysDiff(p.punchOut, new Date()) === 0
  );
  
  // ─── UI ───────────────────────────────────────────────  return (
  return(
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "#111c30", borderRadius: 10, border: "1px solid #1e2d47", padding: 16 }}>
        <SectionHeader title="Clock In / Clock Out"/>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <select value={selEmp} onChange={e => setSelEmp(e.target.value)} style={selectStyle}>
            <option value="">— Select Employee —</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.role})</option>)}
          </select>
          <select value={selJob} onChange={e => setSelJob(e.target.value)} style={selectStyle}>
            <option value="">— Select Job —</option>
            {jobs.filter(j => j.status === "active").map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
          </select>
          <button onClick={punchIn} style={{ ...btnStyle, background: "#10b981" }}>✅ PUNCH IN</button>
        </div>
        {msg && <div style={{ color: msg.type === "ok" ? "#10b981" : "#ef4444", fontSize: 12, padding: "6px 10px", background: msg.type === "ok" ? "#10b98122" : "#ef444422", borderRadius: 6 }}>{msg.text}</div>}
      </div>
 
      <div style={{ background: "#111c30", borderRadius: 10, border: "1px solid #1e2d47", padding: 16 }}>
        <SectionHeader title="Active Punches"/>
        {active.map(p => {
          const emp = employees.find(e => e.id === p.empId);
          const job = jobs.find(j => j.id === p.jobId);
          
          const elapsedMs = Math.max(0,Date.now() - new Date(p.punchIn).getTime());
         
          const elapsed = (elapsedMs / 3600000).toFixed(1);
          return (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #1e2d4755" }}>
              <div style={avatarStyle}>{emp?.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 13 }}>{emp?.name}</div>
                <div style={{ color: "#64748b", fontSize: 11 }}>{job?.name} · in @ {fmtTime(p.punchIn)}</div>
              </div>
              <div style={{ color: "#f59e0b", fontWeight: 700, fontFamily: "monospace", fontSize: 14 }}>{elapsed}h</div>
              <button onClick={() => punchOut(p.id)} style={{ ...btnStyle, background: "#ef4444", padding: "4px 10px", fontSize: 11 }}>OUT</button>
            </div>
          );
        })}
        {punchRecords.filter(p => !p.punchOut).length === 0 && <div style={{ color: "#64748b", fontSize: 12 }}>No active punches.</div>}
      </div>

      <div style={{ background: "#111c30", borderRadius: 10, border: "1px solid #1e2d47", padding: 16 }}>
        <SectionHeader title="Today's Completed Records"/>
        {completed.map(p => {
          const emp = employees.find(e => e.id === p.empId);
          const job = jobs.find(j => j.id === p.jobId);
          return (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #1e2d4755" }}>
              <div style={{ ...avatarStyle, opacity: 0.6 }}>{emp?.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#94a3b8", fontSize: 13 }}>{emp?.firstName} — {job?.name}</div>
                <div style={{ color: "#64748b", fontSize: 11 }}>{fmtTime(p.punchIn)} → {fmtTime(p.punchOut)}</div>
              </div>
              <div style={{ color: "#94a3b8", fontFamily: "monospace", fontSize: 13 }}>{p.totalHours}h</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
