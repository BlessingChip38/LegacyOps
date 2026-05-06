import { today, fmtDate } from "../utils.js";
import { btnStyle, selectStyle } from "../styles/shared.js"
import { useState, useEffect } from "react";
import Badge from "../components/Badge";
import SectionHeader from "../components/SectionHeader";
import API_BASE from "../api.js";
import { request } from "../api/client.js";


export default function MachinesTab({ jobs = [], machines: initialMachines = [], employees = [], onDataChange, auth}) {
  const [machines, setMachines] = useState(initialMachines);
  const [log, setLog] = useState([
    { machineId: "M01", empId: "E01", jobId: "J001", start: "2025-04-01T07:05", end: "2025-04-01T16:40", hours: 9.58 },
    { machineId: "M03", empId: "E04", jobId: "J002", start: "2025-04-01T07:10", end: null, hours: null },
  ]);
  const [newOp, setNewOp] = useState({ machineId: "", empId: "", jobId: "", machineHours: "" });
  const [greasedId, setGreasedId] = useState(null);
  const [maintenanceId, setMaintenanceId] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    setMachines(initialMachines);
  }, [initialMachines]);

 // ─── message auto-clear ─────────────────────────────
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 4000);
    return () => clearTimeout(t);
  }, [msg]);

  // ─── Mark Equipment Greased ─────────────────────────────
  const markGreased = async (id) => {
    var today = new Date().toISOString();
    try{

      await request(
        `/api/Machine/${id}/maintenance`,
        "PATCH",
        auth,
        { greased: true } 
        );

    setMachines(prev =>
      prev.map(m =>
        m.id === id ? { ...m, lastGreased: today } : m
      )
    );

    setGreasedId(id);
    onDataChange();
    setTimeout(() => setGreasedId(null), 2000);
    }
    catch (err) {
      console.error(err);
      setMsg({ type:"err", text: "Failed to update greased status"});
    }
  };

  // ─── Mark Equipment Serviced ─────────────────────────────
  const markServiced = async (id) => {
    const machine = machines.find(m => m.id === id);
    if(!machine){
      console.error("Machine not found: ", id);
    }

    try {
      await request(
        `/api/Machine/${id}/maintenance`,
        "PATCH",
        auth,
        { lastServiceHours: machine.hours,
          greased: false
         } 
      );
      console.log(machine.hours)
      setMachines(prev =>
        prev.map(m =>
          m.id === id
          ? {
            ...m,
            lastServiceHours: m.hours
          }
          : m
        )
      );

      setMaintenanceId(id);
      onDataChange?.();

      setTimeout(() => setMaintenanceId(null), 2000);

    }
    catch (err) {
      console.error(err);
      setMsg({ 
        type:"err",
        text: "Failed to update service status"
      });
    }
  };

  // ─── Start Machine ─────────────────────────────
  const startMachine = async () => {
    if (!newOp.machineId || !newOp.empId || !newOp.jobId ) { 
      setMsg({ type: "err", text: "All fields required."});
      return;
    }
    
    const selectedMachine = machines.find(m => m.id === newOp.machineId);
    
    if (!newOp.machineHours || Number(newOp.machineHours) < selectedMachine.hours){
      setMsg({ type: "err", text: `Hours must be ≥ ${selectedMachine.hours}`});
      return;
    }
    try {
      await request(
        `/api/Machine/${newOp.machineId}/startMachine`,
        "PATCH",
        auth,
        {
          status: "running",
          hours: newOp.machineHours
        }
      );
      onDataChange?.();
    } 
    catch {
      setMsg({ type: "err", text: "Failed to update machine status." });
    }

    setLog([{ ...newOp, start: new Date().toISOString(), end: null, hours: null }, ...log]);
    setMachines(prev =>
      prev.map(m =>
        m.id === newOp.machineId
        ? {
          ...m,
          status: "running",
          hours: newOp.machineHours
        }
        : m
      )
    );
    setNewOp({ machineId: "", empId: "", jobId: "", machineHours: "" });
  };
  
  const selectedMachine = machines.find(m => m.id === newOp.machineId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "#111c30", borderRadius: 10, border: "1px solid #1e2d47", padding: 16 }}>
        <SectionHeader title="Start Machine Assignment" />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select value={newOp.machineId} onChange={e => setNewOp({ ...newOp, machineId: e.target.value })} style={selectStyle}>
            <option value="">— Machine —</option>
            {machines.filter(m => m.status !== "running").map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <select value={newOp.empId} onChange={e => setNewOp({ ...newOp, empId: e.target.value })} style={selectStyle}>
            <option value="">— Operator —</option>
            {employees.filter(e => e.role === "Operator").map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
          </select>
          <select value={newOp.jobId} onChange={e => setNewOp({ ...newOp, jobId: e.target.value })} style={selectStyle}>
            <option value="">— Job —</option>
            {jobs.filter(j => j.status === "active").map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
          </select>
          <input type="number" min={selectedMachine?.hours ?? 0} maxLength="7" placeholder={`≥ ${selectedMachine?.hours ?? 0}`} value={newOp.machineHours ?? ""} onChange={e => setNewOp({ ...newOp, machineHours: e.target.value })} style={selectStyle}></input> 
          <button onClick={startMachine} style={{ ...btnStyle, background: "#f59e0b", color: "#111" }}>▶ START</button>
        </div>
         {msg && <div style={{ color: msg.type === "ok" ? "#10b981" : "#ef4444", fontSize: 12, padding: "6px 10px", background: msg.type === "ok" ? "#10b98122" : "#ef444422", borderRadius: 6 }}>{msg.text}</div>}
         
        </div>

      {machines.map(m => {
        const hoursToService = m.serviceInterval - (m.hours - m.lastServiceHours);
        const pct = Math.min(100, ((m.hours - m.lastServiceHours) / m.serviceInterval) * 100);
        const barColor = pct > 90 ? "#ef4444" : pct > 70 ? "#f59e0b" : "#10b981";
        const greaseDays = Math.floor(
              (new Date().setHours(0,0,0,0) - new Date(m.lastGreased).setHours(0,0,0,0)) / 86400000
              );
        const activeRun = log.find(l => l.machineId === m.id && !l.end);
        const operator = activeRun ? employees.find(e => e.id === activeRun.empId) : null;
        const job = activeRun ? jobs.find(j => j.id === activeRun.jobId) : null;

        return (
          <div key={m.id} style={{ background: "#111c30", borderRadius: 10, border: `1px solid ${m.status === "running" ? "#f59e0b44" : "#1e2d47"}`, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14 }}>{m.name}</div>
                <div style={{ color: "#64748b", fontSize: 11 }}>S/N: {m.serial} · {(m.hours ?? 0).toLocaleString()} hrs total</div>
              </div>
              <Badge label={m.status} color={m.status === "running" ? "#f59e0b" : m.status === "maintenance" ? "#ef4444" : "#64748b"} />
            </div>

            {operator && (
              <div style={{ background: "#f59e0b11", border: "1px solid #f59e0b33", borderRadius: 6, padding: "6px 10px", marginBottom: 10, fontSize: 12, color: "#f59e0b" }}>
                🟡 Running · {operator.firstName} {operator.lastName} · {job?.name}
              </div>
            )}
            

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, marginBottom: 10 }}>
              <div>
                <div style={{ color: "#64748b" }}>Service interval</div>
                <div style={{ color: "#e2e8f0", fontWeight: 600 }}>{hoursToService > 0 ? `${hoursToService}h remaining` : <span style={{ color: "#ef4444" }}>⚠ OVERDUE</span>}</div>
                <div style={{ background: "#1e2d47", borderRadius: 3, height: 5, marginTop: 4 }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: 3 }} />
                </div>
              </div>
              <div>
                <div style={{ color: "#64748b" }}>Last greased</div>
                <div style={{ color: greaseDays > 1 ? "#f59e0b" : "#10b981", fontWeight: 600 }}>{fmtDate(m.lastGreased)} ({greaseDays}d ago)</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => markGreased(m.id)} style={{ ...btnStyle, background: greasedId === m.id ? "#10b981" : "#1e3a5f", fontSize: 11 }}>
                {greasedId === m.id ? "✓ Greased!" : "Log Grease"}
              </button>
              <button onClick={() => markServiced(m.id)} style={{ ...btnStyle, background: maintenanceId === m.id ? "#10b981" : "#1e3a5f", fontSize: 11 }}>
                {maintenanceId === m.id ? "✓ Service Logged" : "Log Service"}
                </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}