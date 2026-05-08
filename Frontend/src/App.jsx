import { useState, useEffect } from "react";
import { get } from "./api/client.js";
import { btnStyle } from "./styles/shared.js";

import BlueStakesTab from "./tabs/BlueStakesTab.jsx";
import DashboardTab from "./tabs/DashboardTab.jsx";
import MachinesTab from "./tabs/MachineTab.jsx";
import MapTab from "./tabs/MapTab.jsx";
import PerformanceTab from "./tabs/PerformanceTab.jsx";
import TimeClockTab from "./tabs/TimeClockTab.jsx";
import LoginScreen from "./components/LoginScreen.jsx";
import ChangePasswordScreen from "./components/ChangePasswordScreen.jsx";
import AdminTab from "./tabs/AdminTab.jsx";
import API_BASE from "./api.js";

// ─── TABS ───────────────────────────────────────────────
const TABS = [
  { id: "dashboard", label: "Dashboard", roles: ["laborer", "operator", "foreman", "admin"] },
  { id: "timeclock", label: "Time Clock", roles: ["laborer", "operator", "foreman", "admin"] },
  { id: "machines", label: "Machines", roles: ["operator", "foreman", "admin"] },
  { id: "bluestakes", label: "Blue Stakes", roles: ["operator", "foreman", "admin"] },
  { id: "map", label: "Job Map", roles: ["operator", "foreman", "admin"] },
  { id: "performance", label: "Performance", roles: ["foreman", "admin"] },
  { id: "admin", label: "Admin", roles: ["admin"] }
];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [auth, setAuth] = useState(null);

  const [jobs, setJobs] = useState([]);
  const [machines, setMachines] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [blueStakes, setBlueStakes] = useState([]);
  const [performanceReviews, setPerformanceReviews] = useState([]);
  const [punchCards, setPunchCards] = useState([]);

  const [loading, setLoading] = useState(false);

  // ─── LOGIN HANDLERS ────────────────────────────────
  const handleLogin = (data) => {
    setAuth(data);
  };

  const handleLogout = () => setAuth(null);
  const handlePasswordChanged = (updated) => setAuth(updated);

  // ─── LOAD ALL DATA (SINGLE SOURCE OF TRUTH) ────────
  const loadAllData = async (authData) => {
    if (!authData) return;

    try {
      setLoading(true);

      const [
        jobs,
        machines,
        employees,
        blueStakes,
        performance,
        punches
      ] = await Promise.all([
        get("/api/Job", authData),
        get("/api/Machine", authData),
        get("/api/Employee", authData),
        get("/api/BlueStake", authData),
        get("/api/PerformanceReview", authData),
        get("/api/PunchCard", authData)
      ]);

      setJobs(jobs);
      setMachines(machines);
      setEmployees(employees);
      setBlueStakes(blueStakes);
      setPerformanceReviews(performance);
      setPunchCards(punches);

    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ─── AUTO LOAD ON LOGIN ────────────────────────────
  useEffect(() => {
    if (!auth) return;
    loadAllData(auth);
  }, [auth]);

  // ─── REFRESH WRAPPER ───────────────────────────────
  const refreshData = () => {
    loadAllData(auth);
  };
  // ─── AUTH GATES ────────────────────────────────────
  if (!auth) return <LoginScreen onLogin={handleLogin} />;

  if (auth.mustChangePassword) {
    return (
      <ChangePasswordScreen
        auth={auth}
        onPasswordChange={handlePasswordChanged}
      />
    );
  }


  // ─── UI ────────────────────────────────────────────
return (
    <div style={{
      minHeight: "100vh", background: "#0a1628",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#e2e8f0"
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(90deg, #0f1b35 0%, #1a2744 100%)",
        borderBottom: "2px solid #d4a017",
        padding: "12px 20px", display: "flex", alignItems: "center", gap: 14,
        position: "sticky", top: 0, zIndex: 100
      }}>
      <div style={{ width: 36, height: 36, background: "#d4a017", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
          <img
            src="https://img1.wsimg.com/isteam/ip/3cec4623-c666-477c-bbd0-261b9de3e4c7/Legacy%20Eathworks%20duchesne.png/:/rs=w:194,h:194,cg:true,m/cr=w:194,h:194/qt=q:95"
            alt="Legacy Earthworks Logo"
            style={{ width: 30, height: 30, objectFit: "contain" }}
          />
      </div>
    <div>
        <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: 0.5, color: "#f8fafc" }}>Legacy Earthworks</div>
        <div style={{ fontSize: 10, color: "#d4a017", letterSpacing: 2, textTransform: "uppercase" }}>Field Operations</div>
    </div>
    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 11, color: "#64748b" }}>
            {auth?.firstName} {auth?.lastName}
        </div>
        <div style={{ fontSize: 11, color: "#64748b" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
        </div>
        <button onClick={handleLogout} style={{ ...btnStyle, background: "#ef444422", color: "#ef4444", fontSize: 11 }}>
            Sign Out
        </button>
    </div>
</div>

      {/* Nav */}
      <div style={{
        display: "flex", overflowX: "auto", gap: 4, padding: "10px 16px",
        background: "#0f1b35", borderBottom: "1px solid #1e2d47",
        scrollbarWidth: "none"
      }}>
        {TABS.filter(t => t.roles.includes(auth.role.toLowerCase())).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? "#d4a017" : "transparent",
            color: tab === t.id ? "#111" : "#64748b",
            border: "none", borderRadius: 7, padding: "6px 12px",
            fontSize: 11, fontWeight: 700, cursor: "pointer",
            whiteSpace: "nowrap", fontFamily: "inherit",
            letterSpacing: 0.5, transition: "all 0.15s"
          }}>
             {t.label}
          </button>
        ))}
      </div>
 {/* CONTENT */}
      {loading && <div style={{ color: "white" }}>Loading...</div>}

      {tab === "dashboard" && (
        <DashboardTab
          jobs={jobs}
          blueStakes={blueStakes}
          punchRecords={punchCards}
          machines={machines}
        />
      )}

      {tab === "timeclock" && (
        <TimeClockTab
          jobs={jobs}
          employees={employees}
          punchRecords={punchCards}
          auth={auth}
          onDataChange={refreshData}
        />
      )}

      {tab === "machines" && (
        <MachinesTab
          jobs={jobs}
          machines={machines}
          employees={employees}
          onDataChange={refreshData}
          auth={auth}
        />
      )}

      {tab === "bluestakes" && (
        <BlueStakesTab jobs={jobs}
         blueStakes={blueStakes} 
         auth={auth}/>
      )}

      {tab === "map" && (
        <MapTab jobs={jobs} 
        auth={auth}/>
      )}

      {tab === "performance" && (
        <PerformanceTab
          jobs={jobs}
          employees={employees}
          perfReviews={performanceReviews}
          auth={auth}
        />
      )}

      {tab === "admin" && (
        <AdminTab
          employees={employees}
          jobs={jobs}
          machines={machines}
          onDataChange={refreshData}
          auth={auth}
        />
      )}

    </div>
  );
}