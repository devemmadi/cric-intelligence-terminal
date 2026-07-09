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
                background: "linear-gradient(160deg, #00622e 0%, #004d24 100%)",
                border: "1px solid rgba(0,166,81,0.4)",
                borderRadius: 12,
                padding: "18px 16px 14px",
                textDecoration: "none",
                cursor: "pointer",
                ...style,
            }}
        >
            {/* Header chip */}
            <div style={{
                color: "#FFD700",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: 10,
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
                <span style={{ color: "#5dde8a" }}>in Free Bets</span>
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
                color: "rgba(255,255,255,0.45)",
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
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 10,
                    fontWeight: 600,
                    fontFamily: "Inter, system-ui",
                    letterSpacing: "0.3px",
                }}>
                    <span style={{ color: "#fff" }}>Gamble</span>
                    <span style={{ color: "#f97316" }}>Aware</span>
                    <span style={{ color: "rgba(255,255,255,0.5)" }}>®</span>
                </span>
                <span style={{
                    border: "1.5px solid rgba(255,255,255,0.4)",
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.6)",
                    fontFamily: "Inter, system-ui",
                    flexShrink: 0,
                }}>18+</span>
            </div>
        </a>
    );
}
