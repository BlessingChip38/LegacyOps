import { useState } from "react";
import Badge from "../components/Badge";
import SectionHeader from "../components/SectionHeader";
import { btnStyle, selectStyle } from "../styles/shared.js"


export default function MapTab({ jobs, auth }) {
  const [selected, setSelected] = useState(null);
  const [selectedOption, setSelectedOption] = useState("active");
  const formatAddress = (job) => `${job.street}, ${job.city}, ${job.state}`
  const openGoogleMaps = (job) => {
    const q = encodeURIComponent(formatAddress(job));
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
  };

  const openGoogleEarth = (job) => {
    window.open(`https://earth.google.com/web/search/${encodeURIComponent(formatAddress(job))}`, "_blank");
  };
  const roleFilterJobs = jobs.filter(job => {
    if (auth.role.toLowerCase() === "admin") {
      return true;
    }
    if (auth.role.toLowerCase() === "foreman") {
      return job.status !== "complete";
    }
    if (auth.role.toLowerCase() === "operator" || auth.role.toLowerCase() === "laborer"){
      return job.status === "active";
    }
    return false;
  })
  const filteredJobs = 
    selectedOption === "all" 
      ? roleFilterJobs 
      : roleFilterJobs.filter(j => j.status.toLowerCase() === selectedOption);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "#111c30", borderRadius: 10, border: "1px solid #1e2d47", padding: 16 }}>
        <SectionHeader title="Job Locations"/>
        <div>Plans to rebuild this whole tab. Want to be able to hide jobs based on status. On each job there will be an option to store pictures.</div>
        
        <div>--------------------------------------------------------------------------</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <select
            value={selectedOption || "active"}
            onChange={(e) => setSelectedOption(e.target.value)}
            name="JobStatus"
            style={selectStyle}
          >
            <option value="active">Active</option>
            
            {(auth.role.toLowerCase() === "admin" || auth.role.toLowerCase() === "Foreman") && (
              <option value="planning">Planning</option>
              )}

            {(auth.role.toLowerCase() === "admin") && (
              <option value="complete">Complete</option>
            )}

            <option value="all">All</option>
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filteredJobs.map(job => (
            <div key={job.id} onClick={() => setSelected(selected?.id === job.id ? null : job)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: 12, borderRadius: 8, cursor: "pointer",
                background: selected?.id === job.id ? "#1e2d47" : "transparent",
                border: `1px solid ${selected?.id === job.id ? job.color + "66" : "#1e2d4755"}`,
                transition: "all 0.2s"
              }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: job.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 13 }}>{job.name}</div>
                <div style={{ color: "#64748b", fontSize: 11 }}>{job.customer} · {formatAddress(job)}</div>
              </div>
              <Badge label={job.status} color={job.status === "active" ? "#10b981" : job.status === "planning" ? "#6366f1" : "#64748b"} />
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div style={{ background: "#111c30", borderRadius: 10, border: `1px solid ${selected.color}44`, padding: 16 }}>
          <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{selected.name}</div>
          <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 14 }}>📍 {formatAddress(selected)}</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => openGoogleMaps(selected)} style={{ ...btnStyle, background: "#4285F4", flex: 1 }}>
              🗺 Open in Google Maps
            </button>
            <button onClick={() => openGoogleEarth(selected)} style={{ ...btnStyle, background: "#34A853", flex: 1 }}>
              🌍 Open in Google Earth
            </button>
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ color: "#64748b", fontSize: 11, marginBottom: 6 }}>GPS Coordinates</div>
            <div style={{ fontFamily: "monospace", color: "#94a3b8", fontSize: 12 }}>
              {selected.lat}°N, {selected.lng}°W
            </div>
          </div>

          {/* Simple SVG dot map */}
          <div style={{ marginTop: 14, background: "#0f1b35", borderRadius: 8, padding: 12, position: "relative", height: 160, overflow: "hidden" }}>
            <div style={{ color: "#64748b", fontSize: 10, marginBottom: 4 }}>Job Cluster — SW Idaho</div>
            <svg width="100%" height="130" viewBox="0 0 300 130">
              <rect width="300" height="130" fill="#0f1b35" />
              {/* Grid lines */}
              {[30,60,90,120].map(y => <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="#1e2d47" strokeWidth="0.5" />)}
              {[75,150,225].map(x => <line key={x} x1={x} y1="0" x2={x} y2="130" stroke="#1e2d47" strokeWidth="0.5" />)}
              {jobs.map(j => {
                const px = ((j.lng + 116.7) / 0.6) * 280 + 10;
                const py = ((43.75 - j.lat) / 0.35) * 120 + 5;
                return (
                  <g key={j.id}>
                    <circle cx={px} cy={py} r={j.id === selected.id ? 8 : 5}
                      fill={j.id === selected.id ? j.color : j.color + "88"}
                      stroke={j.id === selected.id ? "#fff" : "none"} strokeWidth="1.5" />
                    <text x={px + 10} y={py + 4} fill="#94a3b8" fontSize="8">{j.name.split(" ")[0]}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
