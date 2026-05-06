import { today, daysUntil } from "../utils.js";
import QuoteCard from "../components/QuoteCard";
import StatCard from "../components/StatCard";
import SectionHeader from "../components/SectionHeader";
import Badge from "../components/Badge";


export default function DashboardTab({ jobs =[], blueStakes=[], punchRecords=[], machines=[], constructionQuotes = []}) {
  const todayStr = today();
  const activePunches = punchRecords.filter(p => !p.punchOut).length;
  const activeMachines = machines.filter(m => m.status === "running").length;
  const expiringBS = blueStakes.filter(b => b.status === "active" && daysUntil(b.expiryDate) <= 7).length;
  const activeJobs = jobs.filter(j => j.status === "active").length;
  const randomQuote = constructionQuotes[new Date().getDate() % constructionQuotes.length];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <QuoteCard quote={randomQuote} />

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatCard label="Clocked In" value={activePunches} sub="employees today" accent="#10b981" />
        <StatCard label="Machines Running" value={activeMachines} accent="#f59e0b" />
        <StatCard label="Active Jobs" value={activeJobs} accent="#6366f1" />
        <StatCard label="BS Expiring" value={expiringBS} sub="within 7 days" accent="#ef4444" />
      </div>

      <div style={{ background: "#111c30", borderRadius: 10, border: "1px solid #1e2d47", padding: 16 }}>
        <SectionHeader title="Today's Job Activity" />
        {jobs.filter(j => j.status === "active").map(job => {
          const crew = punchRecords.filter(p => p.jobId === job.id && !p.punchOut);
          return (
            <div key={job.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #1e2d4755" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: job.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 13 }}>{job.name}</div>
                <div style={{ color: "#64748b", fontSize: 11 }}>{job.customer}</div>
              </div>
              <div style={{ color: "#94a3b8", fontSize: 12 }}>{crew.length} on site</div>
            </div>
          );
        })}
      </div>

      <div style={{ background: "#111c30", borderRadius: 10, border: "1px solid #1e2d47", padding: 16 }}>
        <SectionHeader title="Machine Status"/>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {machines.map(m => {
            const hoursToService = m.serviceInterval - (m.hours - m.lastServiceHours);
            const pct = Math.min(100, ((m.hours - m.lastServiceHours) / m.serviceInterval) * 100);
            const barColor = pct > 90 ? "#ef4444" : pct > 70 ? "#f59e0b" : "#10b981";
            return (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ color: "#cbd5e1", fontSize: 12, fontWeight: 600 }}>{m.name}</span>
                    <span style={{ color: "#64748b", fontSize: 11 }}>{hoursToService}h to service</span>
                  </div>
                  <div style={{ background: "#1e2d47", borderRadius: 3, height: 5 }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: 3, transition: "width 0.6s" }} />
                  </div>
                </div>
                <Badge label={m.status} color={m.status === "running" ? "#10b981" : m.status === "maintenance" ? "#ef4444" : "#64748b"} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
