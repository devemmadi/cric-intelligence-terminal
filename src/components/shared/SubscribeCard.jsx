/* eslint-disable */
import React, { useState } from "react";
import usePushNotifications from "../hooks/usePushNotifications";
import { C } from "./constants";

const API = "https://cricintel-backend-production.up.railway.app";

export default function SubscribeCard({ compact = false }) {
    const { isSupported, permission, isSubscribed, isLoading, subscribe } = usePushNotifications();
    const [email, setEmail] = useState("");
    const [emailDone, setEmailDone] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);

    async function handleEmail(e) {
        e.preventDefault();
        if (!email || !email.includes("@")) return;
        setEmailLoading(true);
        try {
            await fetch(API + "/email-subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, source: "subscribe_card" }),
            });
            setEmailDone(true);
        } catch (_) {}
        setEmailLoading(false);
    }

    if (compact) {
        // Slim version for sidebar
        return (
            <div style={{ background: "linear-gradient(135deg, #0d1f3c 0%, #1a2f4e 100%)", border: `1px solid ${C.accent}40`, borderRadius: 12, padding: "14px 14px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: C.accent, letterSpacing: 1 }}>GET MATCH ALERTS</div>

                {/* Push notifications */}
                {isSupported && !isSubscribed && permission !== "denied" && (
                    <button
                        onClick={subscribe}
                        disabled={isLoading}
                        style={{ background: C.accent, border: "none", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, width: "100%", justifyContent: "center" }}
                    >
                        🔔 {isLoading ? "Setting up..." : "Notify me — live & pre-match"}
                    </button>
                )}
                {isSubscribed && (
                    <div style={{ fontSize: 11, color: C.green, fontWeight: 700 }}>✓ Push alerts on</div>
                )}

                {/* Email */}
                {!emailDone ? (
                    <form onSubmit={handleEmail} style={{ display: "flex", gap: 6 }}>
                        <input
                            type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: `1px solid ${C.accent}40`, borderRadius: 7, padding: "7px 9px", color: C.text, fontSize: 11, fontFamily: "Inter, system-ui", outline: "none", minWidth: 0 }}
                        />
                        <button type="submit" disabled={emailLoading} style={{ background: C.green, border: "none", borderRadius: 7, padding: "7px 10px", color: "#fff", fontSize: 11, fontWeight: 800, cursor: "pointer", flexShrink: 0 }}>
                            {emailLoading ? "..." : "Go"}
                        </button>
                    </form>
                ) : (
                    <div style={{ fontSize: 11, color: C.green, fontWeight: 700 }}>✓ You're on the list</div>
                )}
            </div>
        );
    }

    // Full card version for mobile main content
    return (
        <div style={{ background: "linear-gradient(135deg, #0d1f3c 0%, #1a2f4e 100%)", border: `1px solid ${C.accent}50`, borderRadius: 14, padding: "18px 16px 16px", marginBottom: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.accent, letterSpacing: 1, marginBottom: 6 }}>GET INSTANT MATCH ALERTS</div>
            <div style={{ fontSize: 13, color: C.text, fontWeight: 600, marginBottom: 12, lineHeight: 1.4 }}>
                Wickets, big overs, momentum shifts — straight to your phone. Free.
            </div>

            {/* Push */}
            {isSupported && !isSubscribed && permission !== "denied" && (
                <button
                    onClick={subscribe}
                    disabled={isLoading}
                    style={{ background: C.accent, border: "none", borderRadius: 10, padding: "11px 16px", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, width: "100%", justifyContent: "center", marginBottom: 10 }}
                >
                    🔔 {isLoading ? "Setting up..." : "Turn on notifications"}
                </button>
            )}
            {isSubscribed && (
                <div style={{ fontSize: 12, color: C.green, fontWeight: 700, marginBottom: 10 }}>✓ Push alerts active</div>
            )}

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>or get email alerts</span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            </div>

            {!emailDone ? (
                <form onSubmit={handleEmail} style={{ display: "flex", gap: 8 }}>
                    <input
                        type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: `1px solid rgba(255,255,255,0.15)`, borderRadius: 9, padding: "10px 12px", color: C.text, fontSize: 13, fontFamily: "Inter, system-ui", outline: "none", minWidth: 0 }}
                    />
                    <button type="submit" disabled={emailLoading} style={{ background: C.green, border: "none", borderRadius: 9, padding: "10px 16px", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", flexShrink: 0 }}>
                        {emailLoading ? "..." : "Alert me"}
                    </button>
                </form>
            ) : (
                <div style={{ fontSize: 13, color: C.green, fontWeight: 700 }}>✓ You're on the list — we'll email you before big matches</div>
            )}
        </div>
    );
}
