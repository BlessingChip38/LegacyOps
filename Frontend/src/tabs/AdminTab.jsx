import { useState, useEffect } from "react";
import API_BASE from "../api.js";
import { btnStyle, inputStyle, selectStyle } from "../styles/shared.js";
import SectionHeader from "../components/SectionHeader.jsx";
import Badge from "../components/Badge.jsx";
import { request } from "../api/client.js";
import EmployeeSection from "./AdminEmployeeTab.jsx";
import JobSection from "./AdminJobTab.jsx";
import MachineSection from "./AdminMachineTab.jsx";


export default function AdminTab({ employees = [], jobs = [], machines = [], onDataChange, auth }) {
    const [section, setSection] = useState("employees");

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Section Nav */}
            <div style={{ display: "flex", gap: 8 }}>
                {["employees", "jobs", "machines"].map(s => (
                    <button key={s} onClick={() => setSection(s)} style={{
                        ...btnStyle,
                        background: section === s ? "#d4a017" : "#1e2d47",
                        color: section === s ? "#111" : "#94a3b8",
                        textTransform: "capitalize"
                    }}>{s}</button>
                ))}
            </div>

            {section === "employees" && <EmployeeSection employees={employees} onDataChange={onDataChange} auth={auth} />}
            {section === "jobs" && <JobSection jobs={jobs} onDataChange={onDataChange} auth={auth} />}
            {section === "machines" && <MachineSection machines={machines} onDataChange={onDataChange} auth={auth} />}
        </div>
    );
}