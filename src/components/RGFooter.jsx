/* eslint-disable */
import React from "react";
import { Link } from "react-router-dom";

export default function RGFooter() {
    return (
        <footer style={{
            background: "#0D1B3E",
            borderTop: "1px solid rgba(200,150,30,0.2)",
            padding: "20px 24px",
            fontFamily: "Inter, system-ui",
        }}>
            <div style={{ maxWidth: 900, margin: "0 auto" }}>

                {/* Top row — links + BMC button */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
                        {[
                            ["/", "Home"],
                            ["/about", "About Us"],
                            ["/how-it-works", "How It Works"],
                            ["/faq", "FAQ"],
                            ["/cricket-predictions-uk", "Cricket Predictions UK"],
                            ["/predictions/ipl-2026", "IPL 2026 Predictions"],
                            ["/privacy", "Privacy Policy"],
                            ["/terms", "Terms & Conditions"],
                        ].map(([to, label]) => (
                            <Link key={label} to={to} style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color .15s" }}
                                onMouseOver={e => e.target.style.color = "#C8961E"}
                                onMouseOut={e => e.target.style.color = "rgba(255,255,255,0.5)"}
                            >{label}</Link>
                        ))}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                        © {new Date().getFullYear()} CricIntelligence
                    </div>
                </div>

                {/* RG bar */}
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#C8961E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 10, fontWeight: 900, color: "#0D1B3E" }}>18+</span>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
                        For informational purposes only. Not financial or betting advice. Bet responsibly. 18+ only.
                    </div>
                </div>
            </div>
        </footer>
    );
}
