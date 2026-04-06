/* eslint-disable */
import React from "react";

const C = {
    bg: "#F4F6FA", surface: "#FFFFFF", border: "#E2E8F0",
    text: "#0A0A0A", muted: "#64748B", accent: "#354D97",
    navy: "#354D97", gold: "#C8961E",
};

export default function TermsAndConditions() {
    return (
        <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, -apple-system, system-ui", color: C.text }}>

            {/* Nav */}
            <nav style={{ background: C.navy, padding: "0 24px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
                <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 9 }}>
                    <svg width="28" height="28" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
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
                </a>
                <a href="/" style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, textDecoration: "none" }}>← Back to App</a>
            </nav>

            <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 80px" }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, color: C.navy }}>Terms & Conditions</h1>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 36 }}>Last updated: March 2026</p>

                {/* Important notice */}
                <div style={{ padding: "16px 20px", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, marginBottom: 36 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#1E40AF", marginBottom: 6 }}>Important Notice</div>
                    <div style={{ fontSize: 13, color: "#1E40AF", lineHeight: 1.7 }}>
                        CricIntelligence provides AI-powered cricket predictions for <strong>informational and entertainment purposes only</strong>. Our predictions do not constitute betting advice. Always gamble responsibly. 18+ only.
                    </div>
                </div>

                {[
                    {
                        title: "1. Acceptance of Terms",
                        content: `By accessing or using CricIntelligence at cricintelligence.com, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our service.

These terms apply to all visitors, users, and subscribers of CricIntelligence.`
                    },
                    {
                        title: "2. Description of Service",
                        content: `CricIntelligence provides:

• AI-powered cricket match predictions and probability analysis
• Over-by-over prediction breakdowns
• Pitch condition and weather impact analysis
• Live match data and scorecard information
• Premium subscription features for enhanced analysis

Our predictions are generated using machine learning models trained on historical cricket data. We do not guarantee the accuracy of any prediction.`
                    },
                    {
                        title: "3. Eligibility",
                        content: `You must be at least 18 years of age to use CricIntelligence. By using our service, you confirm that:

• You are 18 years of age or older
• You are legally permitted to use online prediction services in your jurisdiction
• You will not use our service for any unlawful purpose`
                    },
                    {
                        title: "4. Premium Subscriptions",
                        content: `CricIntelligence offers the following subscription plans:

• Monthly: £9.99 per month
• Annual: £59.99 per year (saving approximately 50%)

Subscriptions are processed via Stripe and automatically renew unless cancelled. You may cancel at any time through your account settings. No refunds are provided for partial subscription periods.

We reserve the right to modify subscription prices with 30 days' notice.`
                    },
                    {
                        title: "5. Predictions Disclaimer",
                        content: `IMPORTANT: All predictions provided by CricIntelligence are:

• Based on historical data and AI models — not guaranteed to be accurate
• For informational and entertainment purposes only
• Not financial, betting, or investment advice
• Subject to change based on match conditions

CricIntelligence accepts no liability for any losses incurred as a result of acting on our predictions. Past prediction accuracy does not guarantee future performance.`
                    },
                    {
                        title: "6. Betting & Gambling",
                        content: `CricIntelligence may display advertisements from licensed and regulated betting operators. By using our service, you acknowledge that:

• We are not a betting operator or bookmaker
• We do not facilitate gambling transactions
• Affiliate links to betting sites are clearly disclosed
• You use any linked betting services entirely at your own risk
• Gambling can be addictive — please gamble responsibly

If you have a gambling problem, please contact GamCare at gamcare.org.uk or call 0808 8020 133.`
                    },
                    {
                        title: "7. Intellectual Property",
                        content: `All content on CricIntelligence, including but not limited to AI models, prediction algorithms, user interface design, logos, and text, is the intellectual property of CricIntelligence and is protected by copyright law.

You may not reproduce, distribute, or create derivative works without our express written permission.`
                    },
                    {
                        title: "8. Prohibited Uses",
                        content: `You agree not to:

• Use the service for any unlawful purpose
• Scrape or harvest data from our platform without permission
• Attempt to reverse-engineer our prediction algorithms
• Resell or commercially exploit our predictions without written consent
• Create accounts for the purpose of accessing premium features without payment
• Use automated tools to access our service without prior written consent`
                    },
                    {
                        title: "9. Limitation of Liability",
                        content: `To the maximum extent permitted by law, CricIntelligence shall not be liable for:

• Any direct, indirect, incidental, or consequential damages
• Loss of profits, data, or goodwill
• Financial losses arising from use of our predictions
• Service interruptions or inaccurate data

Our total liability to you shall not exceed the amount you paid us in the 12 months prior to the claim.`
                    },
                    {
                        title: "10. Third-Party Links",
                        content: `Our service contains links to third-party websites, including betting operators and data providers. These links are provided for convenience only. We are not responsible for the content, privacy practices, or services of any third-party websites.`
                    },
                    {
                        title: "11. Changes to Service",
                        content: `We reserve the right to modify, suspend, or discontinue any part of our service at any time. We will provide reasonable notice of significant changes. Continued use of the service after changes constitutes acceptance of the new terms.`
                    },
                    {
                        title: "12. Governing Law",
                        content: `These Terms and Conditions are governed by the laws of England and Wales. Any disputes arising from use of CricIntelligence shall be subject to the exclusive jurisdiction of the courts of England and Wales.`
                    },
                    {
                        title: "13. Contact",
                        content: `For any questions regarding these Terms and Conditions:

Email: emmadi.dev@gmail.com
Website: cricintelligence.com`
                    },
                ].map(({ title, content }) => (
                    <div key={title} style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 10, paddingBottom: 8, borderBottom: `2px solid ${C.gold}`, display: "inline-block" }}>{title}</h2>
                        <p style={{ fontSize: 14, lineHeight: 1.8, color: "#333", whiteSpace: "pre-line" }}>{content}</p>
                    </div>
                ))}

                {/* Footer links */}
                <div style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${C.border}`, display: "flex", gap: 24, flexWrap: "wrap" }}>
                    <a href="/privacy" style={{ fontSize: 13, color: C.navy, textDecoration: "none", fontWeight: 600 }}>Privacy Policy</a>
                    <a href="/about" style={{ fontSize: 13, color: C.navy, textDecoration: "none", fontWeight: 600 }}>About Us</a>
                    <a href="/" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>← Back to CricIntelligence</a>
                </div>

                {/* Responsible gambling footer */}
                <div style={{ marginTop: 24, padding: "20px 24px", background: "#FFF8F0", border: "1px solid #F59E0B", borderRadius: 12, display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{ fontSize: 28 }}>⚠️</span>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#92400E", marginBottom: 4 }}>Responsible Gambling</div>
                        <div style={{ fontSize: 13, color: "#92400E" }}>18+ only · BeGambleAware.org · GamCare: 0808 8020 133</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
