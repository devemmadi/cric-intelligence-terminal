/* eslint-disable */
import React, { useState } from "react";
import { C } from "./shared/constants";

const AFFILIATE_URL = "https://betway.com/bwp/bet10get40/en-gb/?s=sp53067";

export default function BetwayBanner() {
    const [dismissed, setDismissed] = useState(
        () => !!localStorage.getItem("ci_betway_dismissed")
    );

    if (dismissed) return null;

    return (
        <div style={{
            background: "linear-gradient(90deg, #003d1f 0%, #005a2d 50%, #003d1f 100%)",
            borderBottom: "1px solid rgba(0,166,81,0.3)",
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
        }}>
            {/* Left: offer */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <span style={{
                    background: "#00A651",
                    borderRadius: 6,
                    padding: "3px 8px",
                    fontSize: 11,
                    fontWeight: 900,
                    color: "#fff",
                    letterSpacing: "0.5px",
                    whiteSpace: "nowrap",
                }}>BETWAY</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>
                    Bet £10 <span style={{ color: "#00e676" }}>Get £40</span> in Free Bets
                </span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap" }}>
                    New customers · 18+ · T&amp;Cs apply
                </span>
            </div>

            {/* Right: CTA + close */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <a
                    href={AFFILIATE_URL}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    style={{
                        background: "#00A651",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "5px 14px",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        textDecoration: "none",
                        fontFamily: "Inter, system-ui",
                        whiteSpace: "nowrap",
                    }}>
                    Claim Offer →
                </a>
                <button
                    onClick={() => {
                        localStorage.setItem("ci_betway_dismissed", "1");
                        setDismissed(true);
                    }}
                    style={{
                        background: "none",
                        border: "none",
                        color: "rgba(255,255,255,0.35)",
                        fontSize: 16,
                        cursor: "pointer",
                        padding: "2px 4px",
                        lineHeight: 1,
                        fontFamily: "Inter, system-ui",
                    }}
                    aria-label="Close">×</button>
            </div>
        </div>
    );
}
