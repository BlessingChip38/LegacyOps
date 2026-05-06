export default function SectionHeader({ title, icon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, borderBottom: "1px solid #1e2d47", paddingBottom: 10 }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <h2 style={{ margin: 0, color: "#e2e8f0", fontSize: 16, fontWeight: 700, letterSpacing: 0.5 }}>{title}</h2>
    </div>
  );
}
