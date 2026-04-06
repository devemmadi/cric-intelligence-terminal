/* eslint-disable */
import React, { useState, useEffect } from "react";

const STORAGE_KEY = "ci_age_verified";

export default function AgeGate({ children }) {
    const [verified, setVerified] = useState(() => {
        try { return !!localStorage.getItem(STORAGE_KEY); } catch { return false; }
    });
    const [declining, setDeclining] = useState(false);

    if (verified) return children;

    if (declining) return (
        <div style={{ minHeight: "100vh", background: "#0D1B3E", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, system-ui", padding: 24 }}>
            <div style={{ textAlign: "center", maxWidth: 400 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔞</div>
                <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Access Restricted</h2>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                    CricIntelligence is only available to users aged 18 and over. We are unable to grant access at this time.
                </p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
                    If you need support with gambling, visit{" "}
                    <a href="https://www.begambleaware.org" target="_blank" rel="noreferrer" style={{ color: "#C8961E" }}>BeGambleAware.org</a>
                    {" "}or call <strong style={{ color: "#fff" }}>0808 8020 133</strong> (free, 24/7).
                </p>
            </div>
        </div>
    );

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(10,15,40,0.97)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, system-ui", padding: 24 }}>
            <div style={{ background: "#111827", border: "1px solid rgba(200,150,30,0.3)", borderRadius: 20, padding: "36px 32px", maxWidth: 420, width: "100%", textAlign: "center", boxShadow: "0 25px 60px rgba(0,0,0,0.6)" }}>

                {/* Logo mark */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                    <svg width="48" height="48" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100" height="100" fill="#0D1B3E" rx="10"/>
                        <rect width="100" height="5" fill="#C8961E"/>
                        <rect y="95" width="100" height="5" fill="#C8961E"/>
                        <path d="M 62,18 A 32,32 0 1,0 62,82" fill="none" stroke="#C8961E" strokeWidth="8" strokeLinecap="round"/>
                        <line x1="34" y1="30" x2="34" y2="70" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                        <line x1="44" y1="28" x2="44" y2="72" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                        <line x1="54" y1="30" x2="54" y2="70" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                        <line x1="31" y1="28" x2="57" y2="28" stroke="#C8961E" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                </div>

                <div style={{ fontSize: 11, fontWeight: 700, color: "#C8961E", letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>CricIntelligence</div>
                <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 900, margin: "0 0 10px", lineHeight: 1.2 }}>Age Verification</h2>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, margin: "0 0 28px" }}>
                    This site contains content related to sports predictions. You must be <strong style={{ color: "#fff" }}>18 years or older</strong> to continue.
                </p>

                {/* Age confirm */}
                <button
                    onClick={() => { try { localStorage.setItem(STORAGE_KEY, "1"); } catch {} setVerified(true); }}
                    style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #1E2D6B, #2A3F82)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 10, transition: "opacity .2s" }}
                    onMouseOver={e => e.target.style.opacity = "0.85"}
                    onMouseOut={e => e.target.style.opacity = "1"}
                >
                    ✅ I am 18 or older — Enter Site
                </button>

                <button
                    onClick={() => setDeclining(true)}
                    style={{ width: "100%", padding: "12px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "rgba(255,255,255,0.4)", fontSize: 14, cursor: "pointer", transition: "opacity .2s" }}
                >
                    I am under 18
                </button>

                {/* Compliance links */}
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>Gambling support & responsible gaming</div>
                    <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
                        <a href="https://www.begambleaware.org" target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#C8961E", textDecoration: "none", fontWeight: 600 }}>BeGambleAware.org</a>
                        <a href="https://www.gamcare.org.uk" target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#C8961E", textDecoration: "none", fontWeight: 600 }}>GamCare.org.uk</a>
                        <a href="https://www.gamstop.co.uk" target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#C8961E", textDecoration: "none", fontWeight: 600 }}>GAMSTOP</a>
                    </div>
                    <div style={{ marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
                        Free helpline: <span style={{ color: "rgba(255,255,255,0.5)" }}>0808 8020 133</span> (24/7)
                    </div>
                </div>
            </div>
        </div>
    );
}
