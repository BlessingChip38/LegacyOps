import {useState, useEffect } from "react";


export default function QuoteCard({ quote, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [aiQuote, setAiQuote] = useState(null);

  const fetchAIQuote = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 150,
          messages: [{
            role: "user",
            content: "Give me one short, powerful motivational quote (under 20 words) specifically for construction workers or earthworks crews. Return ONLY the quote and attribution if known — nothing else, no explanation, no quotes marks."
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || quote;
      setAiQuote(text.trim());
    } catch {
      setAiQuote(quote);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAIQuote(); }, []);

  return (
    <div style={{
      background: "linear-gradient(135deg, #1a2744 0%, #0f1b35 100%)",
      border: "1px solid #d4a017",
      borderRadius: 12,
      padding: "20px 24px",
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{ position: "absolute", top: -20, right: -20, fontSize: 120, opacity: 0.04, color: "#d4a017", fontFamily: "Georgia, serif", lineHeight: 1 }}>"</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 18 }}>💬</span>
        <span style={{ color: "#d4a017", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Quote of the Day</span>
      </div>
      {loading
        ? <div style={{ color: "#94a3b8", fontStyle: "italic", fontSize: 14 }}>Pulling today's quote...</div>
        : <div style={{ color: "#e2e8f0", fontSize: 15, lineHeight: 1.6, fontStyle: "italic" }}>{aiQuote || quote}</div>
      }
      <button onClick={fetchAIQuote} style={{
        marginTop: 12, background: "transparent", border: "1px solid #d4a01755",
        color: "#d4a017", borderRadius: 6, padding: "4px 12px", fontSize: 11,
        cursor: "pointer", letterSpacing: 1
      }}>↻ NEW QUOTE</button>
    </div>
  );
}