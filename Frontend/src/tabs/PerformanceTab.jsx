import { useState } from "react";
import { btnStyle, selectStyle, inputStyle, avatarStyle } from "../styles/shared.js";
import { today, fmtDate } from "../utils.js";
import { request } from "../api/client.js";

export default function PerformanceTab({ jobs = [], employees = [], perfReviews = [], auth }) {
  const [reviews, setReviews] = useState(perfReviews);
  const [form, setForm] = useState({ empId: "", jobId: "", safetyScore: 5, productivityScore: 5, attitudeScore: 5, qualityScore: 5, foreman: "DS", notes: "" });
  const [showForm, setShowForm] = useState(false);
  const [aiSummary, setAiSummary] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const [msg, setMsg] = useState(null);


  const submit = async () => {
    
    const newReview = {
      empId: form.empId,
      jobId: form.jobId,
      safetyScore: form.safetyScore,
      productivityScore: form.productivityScore,
      attitudeScore: form.attitudeScore,
      qualityScore: form.qualityScore,
      foremanId: auth.id,
      notes: form.notes
    }
    
    try {
      const saved = await request(
        "/api/PerformanceReview",
        "POST",
        auth,
        newReview
      )
    
    setReviews(prev => [saved, ...prev]);
    setShowForm(false);
    
    setForm({ empId: "", jobId: "", safetyScore: 5, productivityScore: 5, attitudeScore: 5, qualityScore: 5, foreman: "DS", notes: "" });
  
    setMsg({ type: "ok", text: "Review created successfully." });

    } catch (err) {
      console.error(err);
      setMsg({ type: "err", text: "Failed to save Review." });
    }
  
  };

  const getRating = (val) => ["", "⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"][val];

  const getAISummary = async (review) => {
    setLoadingId(review.id);
    const emp = employees.find(e => e.id === review.empId);
    const job = jobs.find(j => j.id === review.jobId);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 200,
          messages: [{
            role: "user",
            content: `You are a construction foreman assistant. Write a 2-sentence coaching note for a crew member review. Employee: ${emp?.firstName} ${emp?.lastName}, Job: ${job?.name}. Scores (1-5): Safety=${review.safetyScore}, Productivity=${review.productivityScore}, Attitude=${review.attitudeScore}, Quality=${review.qualityScore}. Notes: "${review.notes}". Be direct, constructive, and specific. No fluff.`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      setAiSummary(prev => ({ ...prev, [review.id]: text.trim() }));
    } catch {
      setAiSummary(prev => ({ ...prev, [review.id]: "Unable to generate coaching note." }));
    }
    setLoadingId(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, color: "#e2e8f0", fontSize: 15 }}>Team Performance Reviews</h3>
        <button onClick={() => setShowForm(!showForm)} style={{ ...btnStyle, background: "#6366f1" }}>+ New Review</button>
      </div>

      {showForm && (
        <div style={{ background: "#111c30", borderRadius: 10, border: "1px solid #6366f144", padding: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <select value={form.empId} onChange={e => setForm({ ...form, empId: e.target.value })} style={selectStyle}>
              <option value="">— Employee —</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
            </select>
            <select value={form.jobId} onChange={e => setForm({ ...form, jobId: e.target.value })} style={selectStyle}>
              <option value="">— Job —</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
            </select>
          </div>
          {["safetyScore", "productivityScore", "attitudeScore", "qualityScore"].map(cat => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ color: "#94a3b8", fontSize: 12, width: 90, textTransform: "capitalize" }}>{cat.replace("Score", "")}</div>
              <input type="range" min="1" max="5" value={form[cat]} onChange={e => setForm({ ...form, [cat]: parseInt(e.target.value) })}
                style={{ flex: 1, accentColor: "#6366f1" }} />
              <div style={{ color: "#e2e8f0", fontSize: 13, width: 30 }}>{form[cat]}/5</div>
            </div>
          ))}
          <textarea placeholder="Foreman notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
            style={{ ...inputStyle, minHeight: 60, resize: "vertical", width: "100%", boxSizing: "border-box" }} />
          <button onClick={submit} style={{ ...btnStyle, background: "#6366f1", marginTop: 8 }}>Submit Review</button>
        </div>
      )}

      {reviews.map(r => {
        const emp = employees.find(e => e.id === r.empId);
        const job = jobs.find(j => j.id === r.jobId);
        const avg = ((r.safetyScore + r.productivityScore + r.attitudeScore + r.qualityScore) / 4).toFixed(1);

        return (
          <div key={r.id} style={{ background: "#111c30", borderRadius: 10, border: "1px solid #1e2d47", padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={avatarStyle}>{emp?.avatar}</div>
                <div>
                  <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 13 }}>{emp?.firstName} {emp?.lastName}</div>
                  <div style={{ color: "#64748b", fontSize: 11 }}>{job?.name} · {fmtDate(r.date)}</div>
                </div>
              </div>
              <div style={{ color: parseFloat(avg) >= 4 ? "#10b981" : parseFloat(avg) >= 3 ? "#f59e0b" : "#ef4444", fontWeight: 800, fontSize: 18, fontFamily: "monospace" }}>{avg}</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
              {["safetyScore", "productivityScore", "attitudeScore", "qualityScore"].map(cat => (
                <div key={cat} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b", fontSize: 11, textTransform: "capitalize" }}>{cat.replace("Score", "")}</span>
                  <span style={{ fontSize: 11 }}>{getRating(r[cat])}</span>
                </div>
              ))}
            </div>

            {r.notes && <div style={{ color: "#94a3b8", fontSize: 12, fontStyle: "italic", marginBottom: 10, padding: "6px 10px", background: "#0f1b35", borderRadius: 6 }}>"{r.notes}"</div>}

            {aiSummary[r.id]
              ? <div style={{ background: "#6366f111", border: "1px solid #6366f133", borderRadius: 6, padding: "8px 10px", fontSize: 12, color: "#a5b4fc" }}>
                  <span style={{ color: "#6366f1", fontWeight: 700, fontSize: 10 }}>🤖 AI COACHING NOTE: </span>{aiSummary[r.id]}
                </div>
              : <button onClick={() => getAISummary(r)} disabled={loadingId === r.id}
                  style={{ ...btnStyle, background: "#1e2d47", fontSize: 11 }}>
                  {loadingId === r.id ? "Generating..." : "🤖 Get AI Coaching Note"}
                </button>
            }
          </div>
        );
      })}
    </div>
  );
}