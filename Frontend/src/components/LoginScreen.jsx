import { useState } from "react";
import API_BASE from "../api.js";
import { btnStyle, inputStyle } from "../styles/shared.js";

export default function LoginScreen({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            setError("Please enter username and password.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/Auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            if (!res.ok) {
                setError("Invalid username or password.");
                setLoading(false);
                return;
            }

            // console.log("Status:", res.status);
            const data = await res.json();
            // console.log("Data:", data);
            onLogin(data);
        } catch (err) {
            console.error(err);
            setError("Unable to connect to server.");
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: "100vh", background: "#0a1628",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif"
        }}>
            <div style={{
                background: "#111c30", border: "1px solid #d4a017",
                borderRadius: 12, padding: 32, width: "100%", maxWidth: 360
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                    <div style={{ width: 40, height: 40, background: "#d4a017", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                          <img
                            src="https://img1.wsimg.com/isteam/ip/3cec4623-c666-477c-bbd0-261b9de3e4c7/Legacy%20Eathworks%20duchesne.png/:/rs=w:194,h:194,cg:true,m/cr=w:194,h:194/qt=q:95"
                            alt="Legacy Earthworks Logo"
                            style={{ width: 35, height: 35, objectFit: "contain" }}
                            />
                    </div>
                    <div>
                        <div style={{ color: "#f8fafc", fontWeight: 800, fontSize: 18 }}>LegacyOps</div>
                        <div style={{ color: "#d4a017", fontSize: 10, letterSpacing: 2, textTransform: "uppercase" }}>Field Operations</div>
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <input
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        style={inputStyle}
                    />
                    <input
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleLogin()}
                        style={inputStyle}
                    />
                    {error && <div style={{ color: "#ef4444", fontSize: 12 }}>{error}</div>}
                    <button onClick={handleLogin} style={{ ...btnStyle, background: "#d4a017", color: "#111", padding: "10px", fontSize: 13 }}>
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </div>
            </div>
        </div>
    );
}