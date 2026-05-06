import { useState, useEffect } from "react";
import { btnStyle, inputStyle, selectStyle } from "../styles/shared";
import Badge from "../components/Badge";
import { request } from "../api/client";
import SectionHeader from "../components/SectionHeader";


export default function MachineSection({ machines, onDataChange, auth}) {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: "", serial: "", hours: "", serviceInterval: "" });
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        if (msg) {
            const timer = setTimeout(() => setMsg(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [msg]);

    const createMachine = async () => {
        if (!form.name || !form.serial || !form.hours || !form.serviceInterval) {
            setMsg({ type: "err", text: "All fields are required." }); return;
        }
        const newMachine = {
            name: form.name,
            serial: form.serial,
            hours: form.hours,
            serviceInterval: form.serviceInterval
        }
        try {
            const saved = await request(
                "/api/Machine",
                "POST",
                auth,
                newMachine
            );

            setMsg({ type: "ok", text: `Machine ${saved.name} added!` });
            setShowForm(false);
            setForm({ name: "", serial: "", hours: "", serviceInterval: "" });
            onDataChange();
        } catch (err) {
            console.error(err);
            setMsg({ type: "err", text: "Failed to create machine." });
        }
    };

    const removeMachine = async (id) => {
        if (!confirm("Are you sure you want to remove this machine?")) return;
        try {
            await request(
                `api/Machine/${id}`,
                "DELETE",
                auth
            )
            setMsg({type: "ok", text: "Machine removed!"})
        } catch (err) {
            console.error(err);
            setMsg({ type: "err", text: "Failed to remove machine." });
        }
    };

    const updateMachineStatus = async (id, status) => {
        try {
            await request(
                `/api/Machine/${id}/status`,
                "PATCH",
                auth,
                {status: status}
               
            );
            onDataChange();

        } catch (err) {
            console.error(err)
            setMsg({ type: "err", text: "Failed to update machine status." });
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <SectionHeader title="Machines" />
                <button onClick={() => setShowForm(!showForm)} style={{ ...btnStyle, background: "#10b981" }}>+ New Machine</button>
            </div>

            {msg && (
                <div style={{ color: msg.type === "ok" ? "#10b981" : "#ef4444", fontSize: 12, padding: "8px 12px", background: msg.type === "ok" ? "#10b98122" : "#ef444422", borderRadius: 6 }}>
                    {msg.text}
                </div>
            )}

            {showForm && (
                <div style={{ background: "#111c30", borderRadius: 10, border: "1px solid #10b98144", padding: 16 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <input placeholder="Machine Name (e.g. CAT 336 Excavator)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
                        <input placeholder="Serial Number" value={form.serial} onChange={e => setForm({ ...form, serial: e.target.value })} style={inputStyle} />
                        <div style={{ display: "flex", gap: 10 }}>
                            <input placeholder="Current Hours" value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                            <input placeholder="Service Interval (hrs)" value={form.serviceInterval} onChange={e => setForm({ ...form, serviceInterval: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                        </div>
                        <button onClick={createMachine} style={{ ...btnStyle, background: "#10b981" }}>Add Machine</button>
                    </div>
                </div>
            )}

            {machines.map(m => (
                <div key={m.id} style={{ background: "#111c30", borderRadius: 10, border: "1px solid #1e2d47", padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", color: "#93c5fd", fontWeight: 700, fontSize: 12 }}>
                        {m.id}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 13 }}>{m.name}</div>
                        <div style={{ color: "#64748b", fontSize: 11 }}>S/N: {m.serial} · {m.hours} hrs</div>
                    </div>
                    <select
                        value={m.status}
                        onChange={e => updateMachineStatus(m.id, e.target.value)}
                        style={{ ...selectStyle, width: "auto", flex: "none" }}
                    >
                        <option value="idle">Idle</option>
                        <option value="running">Running</option>
                        <option value="maintenance">Maintenance</option>
                    </select>
                    <button onClick={() => removeMachine(m.id)} style={{ ...btnStyle, background: "#ef444422", color: "#ef4444", fontSize: 11 }}>Remove</button>
                </div>
            ))}
        </div>
    );
}
