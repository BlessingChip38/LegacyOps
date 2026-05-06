import { useEffect, useState } from "react";
import Badge from "../components/Badge";
import { today, daysUntil, fmtDate } from "../utils.js";
import { btnStyle, inputStyle, selectStyle } from "../styles/shared.js";
import { request } from "../api/client.js";


// TODO: Need to fix the way the dig date is calculated.
// Currently it just adds 2 days after request date, But what if request date is a friday or weekend or holidy.

export default function BlueStakesTab({ 
  jobs = [],
  blueStakes = [],
  auth
}) {
  const [stakes, setStakes] = useState(blueStakes || []);
  useEffect(() => {
    setStakes(blueStakes || []);
  }, [blueStakes]);

  const [form, setForm] = useState({
    jobId: "",
    ticketNumber: "",
    requestDate: today(),
    legalDate: "",
    notes: ""
  });
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState(null);

  

  // ─── message auto-clear ─────────────────────────────
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 4000);
    return () => clearTimeout(t);
  }, [msg]);

  // ─── ADD BLUE STAKE ────────────────────────────────
  const addStake = async () => {
    if (!form.jobId || !form.ticketNumber) {
      setMsg({ type: "err", text: "Select job and enter ticket number." });
      return;
    }

    const legalDig = new Date(
      new Date(form.requestDate).getTime() + 2 * 86400000
    ).toISOString().split("T")[0];


    const expiry = new Date(
      new Date(legalDig).getTime() + 21 * 86400000
    ).toISOString().split("T")[0];

    const newStake = {
      jobId: form.jobId,
      ticketNumber: form.ticketNumber,
      requestDate: form.requestDate,
      legalDigDate: form.legalDate,
      expiryDate: expiry,
      notes: form.notes
    };


    try {
      const saved = await request(
        "/api/BlueStake",
        "POST",
        auth,
        newStake
      );
      setStakes(prev => [saved, ...prev]);

      setForm({
        jobId: "",
        ticketNum: "",
        requestDate: today(),
        notes: ""
      });

      setShowForm(false);

      setMsg({ type: "ok", text: "Blue Stake created successfully." });

    } catch (err) {
      console.error(err);
      setMsg({ type: "err", text: "Failed to save Blue Stake." });
    }
  };

  // ─── UI ────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, color: "#e2e8f0", fontSize: 15 }}>Blue Stakes / Utility Locates</h3>
        <button onClick={() => setShowForm(!showForm)} style={{ ...btnStyle, background: "#6366f1" }}>+ New Ticket</button>
      </div>

      {showForm && (
        <div style={{ background: "#111c30", borderRadius: 10, border: "1px solid #6366f144", padding: 16 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "120px 1fr",
              gap: 10,
              alignItems: "center"
            }}
          >
            <label>Job:</label>
            <select
              value={form.jobId}
              onChange={e => setForm({ ...form, jobId: e.target.value })}
              style={selectStyle}
            >
              <option value="">— Select Job —</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
            </select>

            <label>Ticket #:</label>
            <input
              value={form.ticketNumber}
              onChange={e => setForm({ ...form, ticketNumber: e.target.value })}
              style={inputStyle}
            />

            <label>Notes:</label>
            <input
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              style={inputStyle}
            />

            <label>Request Date:</label>
            <input
              type="date"
              value={form.requestDate}
              onChange={e => setForm({ ...form, requestDate: e.target.value })}
              style={inputStyle}
            />

            <label>Legal Date:</label>
            <input
              type="date"
              value={form.legalDate}
              onChange={e => setForm({ ...form, legalDate: e.target.value })}
              style={inputStyle}
            />

            <div /> {/* spacer */}
            <button
              onClick={addStake}
              style={{ ...btnStyle, background: "#6366f1" }}
            >
              Submit Ticket
            </button>
          </div>
        </div>
      )}

      {msg && <div style={{ color: msg.type === "ok" ? "#10b981" : "#ef4444", fontSize: 12, padding: "6px 10px", background: msg.type === "ok" ? "#10b98122" : "#ef444422", borderRadius: 6 }}>{msg.text}</div>}

      {stakes.map(s => {
        const job = jobs.find(j => j.id === s.jobId);
        const expDays = daysUntil(s.expiryDate);
        const digDays = daysUntil(s.legalDigDate);
        const statusColor = s.status === "expired" ? "#64748b" : expDays <= 3 ? "#ef4444" : expDays <= 7 ? "#f59e0b" : "#10b981";

        return (
          <div key={s.id} style={{ background: "#111c30", borderRadius: 10, border: `1px solid ${statusColor}33`, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 13 }}>#{s.ticketNumber}</div>
                <div style={{ color: "#64748b", fontSize: 11 }}>{job?.name} — {job?.customer}</div>
              </div>
              <Badge label={s.status === "expired" ? "Expired" : `${expDays}d left`} color={statusColor} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, fontSize: 11, marginBottom: 8 }}>
              <div>
                <div style={{ color: "#64748b" }}>Requested</div>
                <div style={{ color: "#94a3b8" }}>{fmtDate(s.requestDate)}</div>
              </div>
              <div>
                <div style={{ color: "#64748b" }}>Legal to Dig</div>
                <div style={{ color: digDays > 0 ? "#f59e0b" : "#10b981", fontWeight: 600 }}>
                  {digDays > 0 ? `In ${digDays}d` : fmtDate(s.legalDigDate)}
                </div>
              </div>
              <div>
                <div style={{ color: "#64748b" }}>Expires</div>
                <div style={{ color: statusColor, fontWeight: 600 }}>{fmtDate(s.expiryDate)}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
