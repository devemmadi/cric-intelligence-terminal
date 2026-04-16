/* eslint-disable */
import React from "react";

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
                            ["/privacy", "Privacy Policy"],
                            ["/terms", "Terms & Conditions"],
                        ].map(([href, label]) => (
                            <a key={label} href={href} style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color .15s" }}
                                onMouseOver={e => e.target.style.color = "#C8961E"}
                                onMouseOut={e => e.target.style.color = "rgba(255,255,255,0.5)"}
                            >{label}</a>
                        ))}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                        {/* Buy Me a Coffee */}
                        <a href="https://buymeacoffee.com/cricintelligence" target="_blank" rel="noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFDD00", color: "#000", fontWeight: 700, fontSize: 12, padding: "6px 14px", borderRadius: 8, textDecoration: "none", transition: "opacity .15s" }}
                            onMouseOver={e => e.currentTarget.style.opacity = "0.85"}
                            onMouseOut={e => e.currentTarget.style.opacity = "1"}
                        >
                            ☕ Buy me a coffee
                        </a>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                            © {new Date().getFullYear()} CricIntelligence
                        </div>
                    </div>
                </div>

                {/* RG bar */}
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {/* 18+ badge */}
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#C8961E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ fontSize: 10, fontWeight: 900, color: "#0D1B3E" }}>18+</span>
                        </div>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 2 }}>Gamble Responsibly</div>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>
                                CricIntelligence provides predictions for informational purposes only. Not betting advice. 18+ only.
                            </div>
                        </div>
                    </div>

                    {/* RG logos/links */}
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
                        {[
                            ["https://www.begambleaware.org", "BeGambleAware"],
                            ["https://www.gamcare.org.uk", "GamCare"],
                            ["https://www.gamstop.co.uk", "GAMSTOP"],
                        ].map(([href, label]) => (
                            <a key={label} href={href} target="_blank" rel="noreferrer"
                                style={{ fontSize: 11, fontWeight: 700, color: "#C8961E", textDecoration: "none", padding: "4px 10px", border: "1px solid rgba(200,150,30,0.3)", borderRadius: 6 }}
                                onMouseOver={e => e.target.style.background = "rgba(200,150,30,0.1)"}
                                onMouseOut={e => e.target.style.background = "transparent"}
                            >{label}</a>
                        ))}
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                            Help: <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>0808 8020 133</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
