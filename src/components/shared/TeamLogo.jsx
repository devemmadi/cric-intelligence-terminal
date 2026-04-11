/* eslint-disable */
import React from "react";
import { API_BASE } from "./constants";

export default function TeamLogo({ name, size = 32, imageId = 0 }) {
    const [imgError, setImgError] = React.useState(false);
    const abbr = (name || "?").replace(/[^A-Za-z]/g, "").substring(0, 3).toUpperCase() || "???";
    const colors = ["#1E2D6B", "#C8961E", "#00B894", "#E53E3E", "#6B21A8", "#DD6B20", "#0369A1", "#065F46"];
    const teamBg = colors[(abbr.charCodeAt(0) || 65) % colors.length];
    const proxyUrl = imageId ? `${API_BASE}/team-image/${imageId}` : null;

    if (!proxyUrl || imgError) {
        return (
            <div style={{ width: size, height: size, borderRadius: "50%", background: teamBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "2px solid rgba(255,255,255,0.25)", boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }}>
                <span style={{ fontFamily: "Inter,system-ui", fontSize: size * 0.32, fontWeight: 800, color: "#fff", letterSpacing: 0.5 }}>{abbr}</span>
            </div>
        );
    }
    return (
        <img src={proxyUrl} alt={name} onError={() => setImgError(true)}
            style={{ width: size, height: size, objectFit: "contain", borderRadius: "50%", background: "#fff", padding: 2, flexShrink: 0, border: "2px solid " + teamBg, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }} />
    );
}
