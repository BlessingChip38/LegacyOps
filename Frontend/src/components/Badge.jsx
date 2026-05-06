
export default function Badge({ label, color, bg }) {
  return (
    <span style={{
      background: bg || color + "22", color: color,
      borderRadius: 4, padding: "2px 8px", fontSize: 10,
      fontWeight: 700, letterSpacing: 1, textTransform: "uppercase"
    }}>{label}</span>
  );
}