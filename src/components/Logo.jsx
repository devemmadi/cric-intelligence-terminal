/* eslint-disable */
import React from "react";
import { Link } from "react-router-dom";

/**
 * Shared CricIntelligence logo — use this everywhere.
 * Props:
 *   size  — icon size in px (default 28)
 *   href  — wrap in <a> link (default "/")
 */
export default function Logo({ size = 28, href = "/" }) {
    const content = (
        <div style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                <rect width="100" height="100" fill="#0D1B3E" rx="8"/>
                <rect width="100" height="4" fill="#C8961E"/>
                <rect y="96" width="100" height="4" fill="#C8961E"/>
                <path d="M 62,18 A 32,32 0 1,0 62,82" fill="none" stroke="#C8961E" strokeWidth="8" strokeLinecap="round"/>
                <line x1="34" y1="30" x2="34" y2="70" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                <line x1="44" y1="28" x2="44" y2="72" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                <line x1="54" y1="30" x2="54" y2="70" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                <line x1="31" y1="28" x2="57" y2="28" stroke="#C8961E" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
                <span style={{ fontWeight: 800, fontSize: 13, color: "#fff", letterSpacing: 2, fontFamily: "Georgia, serif" }}>CRIC</span>
                <span style={{ fontWeight: 400, fontSize: 9, color: "#C8961E", letterSpacing: 3.5, fontFamily: "Georgia, serif" }}>INTELLIGENCE</span>
            </div>
        </div>
    );

    return (
        <Link to={href} style={{ textDecoration: "none" }}>
            {content}
        </Link>
    );
}
