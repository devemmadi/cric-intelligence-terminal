/* eslint-disable */
import React from "react";
import { affiliateHref } from "./shared/affiliates";

export default function WilliamHillBanner({ style = {}, placement = "" }) {
    return (
        <a
            href={affiliateHref("williamhill", placement)}
            target="_blank"
            rel="noopener noreferrer sponsored"
            style={{
                display: "block",
                background: "linear-gradient(160deg, #001a3a 0%, #003066 100%)",
                border: "1px solid #FFB300",
                borderRadius: 12,
                padding: "18px 16px 14px",
                textDecoration: "none",
                cursor: "pointer",
                ...style,
            }}
        >
            {/* William Hill logo pill */}
            <div style={{ marginBottom: 12 }}>
                <span style={{
                    background: "#FFB300",
                    color: "#001a3a",
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: "1.5px",
                    padding: "3px 10px",
                    borderRadius: 4,
                    fontFamily: "Inter, system-ui",
                    textTransform: "uppercase",
                }}>WILLIAM HILL</span>
            </div>

            {/* Header */}
            <div style={{
                color: "#FFB300",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: 8,
                fontFamily: "Inter, system-ui",
            }}>
                WELCOME OFFER
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
                Bet £10 &amp; Get £30<br />
                <span style={{ color: "#FFB300" }}>in Free Bets</span>
            </div>

            {/* Sub-offer line */}
            <div style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: 12,
                marginBottom: 14,
                fontFamily: "Inter, system-ui",
                lineHeight: 1.5,
            }}>
                New UK customers — use promo code <strong style={{ color: "#FFB300" }}>R30</strong>.
            </div>

            {/* Terms */}
            <div style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 10,
                lineHeight: 1.5,
                marginBottom: 14,
                fontFamily: "Inter, system-ui",
            }}>
                Ends 31.12.26. 18+, new UK customers only, promo code R30. Deposit £10+, then
                place a £10 single bet at odds 1/2+ on any sports market (excl. Virtuals).
                £30 in Free Bets (3&times;£10) credited after settlement, expire in 7 days,
                non-withdrawable, must be used in full. Some deposit methods excluded.
                One per customer. Full T&amp;Cs apply. BeGambleAware.org
            </div>

            {/* Footer: GambleAware + 18+ */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                    fontSize: 10,
                    fontWeight: 600,
                    fontFamily: "Inter, system-ui",
                    letterSpacing: "0.3px",
                }}>
                    <span style={{ color: "#fff" }}>BeGamble</span>
                    <span style={{ color: "#f97316" }}>Aware</span>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>®</span>
                </span>
                <span style={{
                    border: "1.5px solid #FFB300",
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#FFB300",
                    fontFamily: "Inter, system-ui",
                    flexShrink: 0,
                }}>18+</span>
            </div>
        </a>
    );
}
