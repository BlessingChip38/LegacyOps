import { useState } from "react";
import API_BASE from "../api";
import { btnStyle, inputStyle } from "../styles/shared";
import { request } from "../api/client";


export default function ChangePasswordScreen({ auth, onPasswordChange }) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
        if (!currentPassword || !newPassword || !confirm) {
            setError("All fields are required."); return;
        }
        if (newPassword !== confirm) {
            setError("New passwords do not match."); return;
        }
        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters."); return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await request(
                "/api/Auth/changePassword",
                "POST",
                auth,
                {
                    empId: auth.id,
                    currentPassword,
                    newPassword
                });
            
            if (!res.ok) {
                setError("Current password is incorrect.");
                setLoading(false);
                return;
            }
            onPasswordChanged({ ...auth, mustChangePassword: false });
        } catch (err) {
            console.log(err);
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
                <div style={{ marginBottom: 24 }}>
                    <div style={{ color: "#f8fafc", fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Change Password</div>
                    <div style={{ color: "#64748b", fontSize: 12 }}>You must set a new password before continuing.</div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <input
                        placeholder="Current Password"
                        type="password"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        style={inputStyle}
                    />
                    <input
                        placeholder="New Password"
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        style={inputStyle}
                    />
                    <input
                        placeholder="Confirm New Password"
                        type="password"
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSubmit()}
                        style={inputStyle}
                    />
                    {error && <div style={{ color: "#ef4444", fontSize: 12 }}>{error}</div>}
                    <button onClick={handleSubmit} style={{ ...btnStyle, background: "#d4a017", color: "#111", padding: "10px", fontSize: 13 }}>
                        {loading ? "Saving..." : "Set New Password"}
                    </button>
                </div>
            </div>
        </div>
    );
}

