/* eslint-disable */
import React from "react";

const AFFILIATE_URL = "https://betway.com/bwp/bet10get40/en-gb/?s=sp53067";

export default function BetwayBanner({ style = {} }) {
    return (
        <a
            href={AFFILIATE_URL}
            target="_blank"
            rel="noopener noreferrer sponsored"
            style={{
                display: "block",
                background: "linear-gradient(160deg, #00281a 0%, #003d24 100%)",
                border: "1px solid #00A651",
                borderRadius: 12,
                padding: "18px 16px 14px",
                textDecoration: "none",
                cursor: "pointer",
                ...style,
            }}
        >
            {/* Betway logo pill */}
            <div style={{ marginBottom: 12 }}>
                <span style={{
                    background: "#00A651",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 900,
                    letterSpacing: "1.5px",
                    padding: "3px 10px",
                    borderRadius: 4,
                    fontFamily: "Inter, system-ui",
                    textTransform: "uppercase",
                }}>BETWAY</span>
            </div>

            {/* Header */}
            <div style={{
                color: "#00A651",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: 8,
                fontFamily: "Inter, system-ui",
            }}>
                OPEN ACCOUNT OFFER
            </div>

            {/* Main offer */}
            <div style={{
                color: "#fff",
                fontSize: 20,
                fontWeight: 800,
                lineHeight: 1.25,
                marginBottom: 12,
                fontFamily: "Inter, system-ui",
            }}>
                Bet £10 &amp; Get £40<br />
                <span style={{ color: "#00A651" }}>in Free Bets</span>
            </div>

            {/* Sub-offer line */}
            <div style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: 12,
                marginBottom: 14,
                fontFamily: "Inter, system-ui",
                lineHeight: 1.5,
            }}>
                for new customers at Betway.
            </div>

            {/* Terms */}
            <div style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 10,
                lineHeight: 1.5,
                marginBottom: 14,
                fontFamily: "Inter, system-ui",
            }}>
                Min deposit £10. Free Bets credited upon qualifying bet settlement.
                Min odds 1.75. T&amp;Cs apply. Begambleaware.org
            </div>

            {/* Footer: GambleAware + 18+ */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                    fontSize: 10,
                    fontWeight: 600,
                    fontFamily: "Inter, system-ui",
                    letterSpacing: "0.3px",
                }}>
                    <span style={{ color: "#fff" }}>Gamble</span>
                    <span style={{ color: "#f97316" }}>Aware</span>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>®</span>
                </span>
                <span style={{
                    border: "1.5px solid #00A651",
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#00A651",
                    fontFamily: "Inter, system-ui",
                    flexShrink: 0,
                }}>18+</span>
            </div>
        </a>
    );
}
