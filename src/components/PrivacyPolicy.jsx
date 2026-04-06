/* eslint-disable */
import React from "react";
import Logo from "./Logo";

const C = {
    bg: "#F4F6FA", surface: "#FFFFFF", border: "#E2E8F0",
    text: "#0A0A0A", muted: "#64748B", accent: "#354D97",
    navy: "#354D97", gold: "#C8961E",
};

// Set page title
if (typeof document !== "undefined") document.title = "Privacy Policy | CricIntelligence";

export default function PrivacyPolicy() {
    return (
        <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, -apple-system, system-ui", color: C.text }}>

            {/* Nav */}
            <nav style={{ background: C.navy, padding: "0 24px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
                <Logo />
                <a href="/" style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, textDecoration: "none" }}>← Back to App</a>
            </nav>

            <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 80px" }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, color: C.navy }}>Privacy Policy</h1>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 36 }}>Last updated: March 2026</p>

                {[
                    {
                        title: "1. Introduction",
                        content: `CricIntelligence ("we", "our", or "us") operates cricintelligence.com. This Privacy Policy explains how we collect, use, and protect your information when you use our AI-powered cricket prediction service.

By using CricIntelligence, you agree to the collection and use of information in accordance with this policy.`
                    },
                    {
                        title: "2. Information We Collect",
                        content: `We collect the following types of information:

• Email address (if provided voluntarily for alerts or premium subscription)
• Payment information (processed securely via Stripe — we do not store card details)
• Usage data (pages visited, features used, prediction interactions)
• Device information (browser type, operating system, IP address)
• Cookies and similar tracking technologies`
                    },
                    {
                        title: "3. How We Use Your Information",
                        content: `We use the collected information to:

• Provide and improve our AI cricket prediction service
• Process payments and manage premium subscriptions
• Send match alerts and prediction updates (if opted in)
• Analyse usage patterns to improve accuracy and user experience
• Comply with legal obligations
• Communicate service updates and changes`
                    },
                    {
                        title: "4. Third-Party Services",
                        content: `We work with the following third-party services:

• Stripe — Payment processing (stripe.com/privacy)
• CricketData.org — Live cricket data and match information
• OpenWeatherMap — Weather data for match conditions
• Google Analytics — Usage analytics (anonymised)
• Betting affiliate partners — We may display advertisements from regulated betting operators including bet365, Betway, and similar platforms. These partners have their own privacy policies.

We are not responsible for the privacy practices of third-party websites linked from our platform.`
                    },
                    {
                        title: "5. Cookies",
                        content: `We use cookies to:

• Remember your preferences and session
• Analyse site traffic and usage patterns
• Enable premium features for subscribers
• Track affiliate referrals (for commission purposes)

You can control cookies through your browser settings. Disabling cookies may affect some features of the service.`
                    },
                    {
                        title: "6. Data Retention",
                        content: `We retain your personal data for as long as necessary to provide our services. If you cancel your subscription or request deletion, we will remove your data within 30 days, except where retention is required by law.`
                    },
                    {
                        title: "7. Your Rights (GDPR)",
                        content: `If you are located in the European Economic Area (EEA) or UK, you have the following rights:

• Right to access your personal data
• Right to rectification of inaccurate data
• Right to erasure ("right to be forgotten")
• Right to restrict processing
• Right to data portability
• Right to object to processing

To exercise any of these rights, contact us at: emmadi.dev@gmail.com`
                    },
                    {
                        title: "8. Gambling & Responsible Gaming",
                        content: `CricIntelligence displays advertisements from licensed betting operators. We are committed to promoting responsible gambling:

• Our predictions are for entertainment and informational purposes only
• We do not guarantee the accuracy of any prediction
• Gambling should only be undertaken by adults aged 18 or over
• If you have a gambling problem, please visit BeGambleAware.org or call the National Gambling Helpline: 0808 8020 133

We do not accept advertising from unlicensed gambling operators.`
                    },
                    {
                        title: "9. Children's Privacy",
                        content: `CricIntelligence is intended for users aged 18 and over. We do not knowingly collect personal information from children under 18. If you believe a child has provided us with personal information, please contact us immediately.`
                    },
                    {
                        title: "10. Security",
                        content: `We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. All payment processing is handled by Stripe with PCI DSS compliance.`
                    },
                    {
                        title: "11. Changes to This Policy",
                        content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated date. Continued use of the service after changes constitutes acceptance.`
                    },
                    {
                        title: "12. Contact Us",
                        content: `If you have questions about this Privacy Policy, please contact us:

Email: emmadi.dev@gmail.com
Website: cricintelligence.com`
                    },
                ].map(({ title, content }) => (
                    <div key={title} style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 10, paddingBottom: 8, borderBottom: `2px solid ${C.gold}`, display: "inline-block" }}>{title}</h2>
                        <p style={{ fontSize: 14, lineHeight: 1.8, color: "#333", whiteSpace: "pre-line" }}>{content}</p>
                    </div>
                ))}

                {/* Responsible gambling footer */}
                <div style={{ marginTop: 48, padding: "20px 24px", background: "#FFF8F0", border: "1px solid #F59E0B", borderRadius: 12, display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{ fontSize: 28 }}>⚠️</span>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#92400E", marginBottom: 4 }}>Responsible Gambling</div>
                        <div style={{ fontSize: 13, color: "#92400E" }}>18+ only · BeGambleAware.org · National Helpline: 0808 8020 133</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
