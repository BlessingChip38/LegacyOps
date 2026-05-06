import { useState, useEffect } from "react";
import { btnStyle, inputStyle, selectStyle } from "../styles/shared";
import Badge from "../components/Badge";
import { request } from "../api/client";
import SectionHeader from "../components/SectionHeader";


export default function EmployeeSection({ employees, onDataChange, auth }) {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ firstName: "", lastName: "", role: "operator" });
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        if (msg) {
            const timer = setTimeout(() => setMsg(null), 10000);
            return () => clearTimeout(timer);
        }
    }, [msg]);

    const createEmployee = async () => {
        if (!form.firstName || !form.lastName) {
            setMsg({ type: "err", text: "All fields are required." }); return;
        }

        const newEmployee = {

            firstName: form.firstName,
            lastName: form.lastName,
            role: form.role
        }
        try {
            const saved = await request(
                "/api/Employee",
                "POST",
                auth,
                newEmployee
            );
            console.log(`Employee ${newEmployee.firstName} set to api.`)
            setMsg({ type: "ok", text: `Employee created! Username: ${saved.username} Temp Password: ${saved.tempPassword}` });
            setShowForm(false);
            setForm({ firstName: "", lastName: "", role: "Laborer" });
            onDataChange();
        } catch (err) {
            console.error(err);
            setMsg({ type: "err", text: "Failed to create employee." });
        }
    };

    const removeEmployee = async (id) => {
        if (!confirm("Are you sure you want to remove this employee?")) return;
        try {
            await request(
                `/api/Employee/${id}`,
                "DELETE",
                auth
            )
            onDataChange();

        } catch (err) {
            console.error(err);
            setMsg({ type: "err", text: "Failed to remove employee." });
        }
    };

    const resetPassword = async (id) => {
        if (!confirm("Are you sure you want to reset this employee password?")) return;
        try {
            console.log(id);
            const saved = await request(
                `/api/Employee/${id}/resetTempPassword`,
                "POST",
                auth
            );

            setMsg({ type: "ok", text: `Password reset! Username: ${saved.username} Temp Password: ${saved.tempPassword}`});
        }
        catch (err) {
            console.error(err);
            setMsg({ type: "err", text: "Failed to reset password."})
        }
    }

    const updateEmployeeRole = async (id, role) => {
    try {
        await request(
            `/api/Employee/${id}/role`,
            "PATCH",
            auth,
            {role: role}
        )
        onDataChange();
    } catch (err) {
        console.error(err);
        setMsg({ type: "err", text: "Failed to update employee status." });
    }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <SectionHeader title="Employees" />
                <button onClick={() => setShowForm(!showForm)} style={{ ...btnStyle, background: "#10b981" }}>+ New Employee</button>
            </div>

            {msg && (
                <div style={{ color: msg.type === "ok" ? "#10b981" : "#ef4444", fontSize: 12, padding: "8px 12px", background: msg.type === "ok" ? "#10b98122" : "#ef444422", borderRadius: 6 }}>
                    {msg.text}
                </div>
            )}

            {showForm && (
                <div style={{ background: "#111c30", borderRadius: 10, border: "1px solid #10b98144", padding: 16 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <input placeholder="First Name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} style={inputStyle} />
                        <input placeholder="Last Name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} style={inputStyle} />
                        <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={selectStyle}>
                            <option value="Laborer">Laborer</option>
                            <option value="Operator">Operator</option>
                            <option value="Foreman">Foreman</option>
                            <option value="Admin">Admin</option>
                        </select>
                        <button onClick={createEmployee} style={{ ...btnStyle, background: "#10b981" }}>Create Employee</button>
                    </div>
                </div>
            )}

            {employees.map(e => (
                <div key={e.id} style={{ background: "#111c30", borderRadius: 10, border: "1px solid #1e2d47", padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", color: "#93c5fd", fontWeight: 700, fontSize: 12 }}>
                        {e.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 13 }}>{e.firstName} {e.lastName}</div>
                        <div style={{ color: "#64748b", fontSize: 11 }}>@{e.username} · {e.id}</div>
                    </div>
                    <select
                        value={e.role}
                        onChange={s => updateEmployeeRole(e.id, s.target.value)}
                        style={{ ...selectStyle, width: "auto", flex: "none" }}
                    >
                        <option value="Operator">Operator</option>
                        <option value="Laborer">Laborer</option>
                        <option value="Foreman">Foreman</option>
                        <option value="Admin">Admin</option>
                    </select>
                    <button onClick={() => resetPassword(e.id)} style={{ ...btnStyle, background: "#ef444422", color: "#1bf817", fontSize: 11 }}>Reset Password</button>
                    <button onClick={() => removeEmployee(e.id)} style={{ ...btnStyle, background: "#ef444422", color: "#ef4444", fontSize: 11 }}>Remove</button>
                </div>
            ))}
        </div>
    );
}