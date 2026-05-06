export default function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div style={{
      background: "#111c30", border: `1px solid ${accent}33`,
      borderRadius: 10, padding: "16px 20px", flex: 1, minWidth: 120
    }}>
      <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
      <div style={{ color: accent, fontSize: 22, fontWeight: 800, fontFamily: "monospace" }}>{value}</div>
      <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
      {sub && <div style={{ color: "#64748b", fontSize: 10, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}