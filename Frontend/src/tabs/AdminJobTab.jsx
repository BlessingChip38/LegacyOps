import { useState, useEffect } from "react";
import { btnStyle, inputStyle, selectStyle } from "../styles/shared";
import Badge from "../components/Badge";
import { request } from "../api/client";
import SectionHeader from "../components/SectionHeader";


export default function JobSection({ jobs, onDataChange, auth }) {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({name: "", customer: "", street: "", city: "", state: "UT", lat: "", lng: "", status: "active", color: "#f59e0b" });
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        if (msg) {
            const timer = setTimeout(() => setMsg(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [msg]);

    const createJob = async () => {
        if (!form.name || !form.customer) {
            setMsg({ type: "err", text: "Name and customer are required." }); return;
        }

        const newJob = {
            name: form.name,
            customer: form.customer,
            street: form.street,
            city: form.city,
            state: form.state,
            lat: form.lat,
            lng: form.lng,
            status: form.status,
            color: form.color

        }
        try {
            const saved = await request(
                "/api/Job",
                "POST",
                auth,
                newJob
            )
            
            setMsg({ type: "ok", text: `Job ${saved.name} created!` });
            setShowForm(false);
            setForm({ name: "", customer: "", street: "", city: "", state: "ID", lat: "", lng: "", status: "active", color: "#f59e0b" });
            onDataChange();
        } catch (err) {
            console.error(err);
            setMsg({ type: "err", text: "Failed to create job." });
        }
    };

    const removeJob = async (id) => {
        if (!confirm("Are you sure you want to remove this job?")) return;
    try {
        const res = await fetch(`${API_BASE}/api/Job/${id}`, { method: "DELETE" });
        const hardDeleted = await res.json();
        setMsg({ 
            type: "ok", 
            text: hardDeleted ? "Job permanently deleted." : "Job has history — marked as inactive." 
        });
        onDataChange();
    } catch {
        setMsg({ type: "err", text: "Failed to remove job." });
    }
    };

    const updateJobStatus = async (id, status) => {
        try {
            await fetch(`${API_BASE}/api/Job/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });
            onDataChange();
        } catch (err) {
            setMsg({ type: "err", text: "Failed to update job status." });
            console.error(err);        
        }
    };

    const COLOR_OPTIONS = ["#f59e0b", "#10b981", "#6366f1", "#ef4444", "#3b82f6", "#ec4899"];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <SectionHeader title="Jobs"/>
                <button onClick={() => setShowForm(!showForm)} style={{ ...btnStyle, background: "#10b981" }}>+ New Job</button>
            </div>

            {msg && (
                <div style={{ color: msg.type === "ok" ? "#10b981" : "#ef4444", fontSize: 12, padding: "8px 12px", background: msg.type === "ok" ? "#10b98122" : "#ef444422", borderRadius: 6 }}>
                    {msg.text}
                </div>
            )}

            {showForm && (
                <div style={{ background: "#111c30", borderRadius: 10, border: "1px solid #10b98144", padding: 16 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <input placeholder="Job Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
                        <input placeholder="Customer" value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })} style={inputStyle} />
                        <input placeholder="Street" value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} style={inputStyle} />
                        <div style={{ display: "flex", gap: 10 }}>
                            <input placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} style={{ ...inputStyle, flex: 2 }} />
                            <input placeholder="State" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                        </div>
                        <div style={{ display: "flex", gap: 10 }}>
                            <input placeholder="Latitude" value={form.lat} onChange={e => setForm({ ...form, lat: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                            <input placeholder="Longitude" value={form.lng} onChange={e => setForm({ ...form, lng: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                        </div>
                        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={selectStyle}>
                            <option value="planning">Planning</option>
                            <option value="active">Active</option>
                            <option value="complete">Complete</option>
                        </select>
                        <div>
                            <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 6 }}>Job Color</div>
                            <div style={{ display: "flex", gap: 8 }}>
                                {COLOR_OPTIONS.map(c => (
                                    <div key={c} onClick={() => setForm({ ...form, color: c })} style={{
                                        width: 24, height: 24, borderRadius: "50%", background: c,
                                        cursor: "pointer", border: form.color === c ? "2px solid #fff" : "2px solid transparent"
                                    }} />
                                ))}
                            </div>
                        </div>
                        <button onClick={createJob} style={{ ...btnStyle, background: "#10b981" }}>Create Job</button>
                    </div>
                </div>
            )}

            {jobs.map(j => (
                <div key={j.id} style={{ background: "#111c30", borderRadius: 10, border: "1px solid #1e2d47", padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: j.color, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
            <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 13 }}>{j.name}</div>
            <div style={{ color: "#64748b", fontSize: 11 }}>{j.customer} · {j.street}, {j.city}</div>
        </div>
        <select
            value={j.status}
            onChange={e => updateJobStatus(j.id, e.target.value)}
            style={{ ...selectStyle, width: "auto", flex: "none" }}
        >
            <option value="active">Active</option>
            <option value="planning">Planning</option>
            <option value="complete">Complete</option>
        </select>
        <button onClick={() => removeJob(j.id)} style={{ ...btnStyle, background: "#ef444422", color: "#ef4444", fontSize: 11 }}>Remove</button>
    </div>
            ))}
        </div>
    );
}
