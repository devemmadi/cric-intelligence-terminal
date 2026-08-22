/* eslint-disable */
import React, { useState } from "react";
import { API_BASE } from "./constants";

/**
 * An always-available "something's wrong" box, in the site-wide footer.
 *
 * WHY THIS EXISTS
 * ---------------
 * FeedbackPrompt.jsx already asks what looked wrong, but only once a match is
 * SELECTED, still LIVE, and the visitor has stayed four minutes. That covers the
 * narrowest case and misses the moments people actually want to complain.
 *
 * On 21-22 Aug 2026 a visitor emailed twice: first that the site "isn't working"
 * (the data feed had run out, so there were no matches at all — the prompt could
 * never have appeared), then that the live score was two overs behind. Both were
 * real defects, the second had been shipping for a month, and he only reached us
 * because he went hunting for the address on the About page. Almost nobody does
 * that; they leave.
 *
 * So this asks for nothing, gates on nothing, and sits on every page including
 * the ones that render when the feed is down.
 *
 * DESIGN NOTES, deliberate:
 * - One free-text box, no rating. A star tells you nothing you can act on; "the
 *   score is stuck two overs behind" names a defect. Same reasoning as
 *   FeedbackPrompt's "what looked wrong" question.
 * - No email field. Asking for one costs more reports than the replies are worth,
 *   and it is optional to type in anyway.
 * - Fire and forget POST to the same /feedback endpoint. A failed report must
 *   never show an error to someone already annoyed — it thanks them regardless.
 */
export default function ReportProblem() {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [sent, setSent] = useState(false);

    const send = () => {
        const body = text.trim();
        if (!body) return;
        try {
            fetch(`${API_BASE}/feedback`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rating: "down",
                    moment: body,
                    matchId: "",
                    teams: "",
                    page: typeof window !== "undefined" ? window.location.pathname : "",
                    source: "footer",
                }),
            }).catch(() => { });
        } catch (e) { }
        setSent(true);
        setText("");
    };

    const linkStyle = {
        fontSize: 12, color: "#C8961E", fontWeight: 700,
        background: "none", border: "none", padding: 0, cursor: "pointer",
        fontFamily: "Inter, system-ui",
    };

    if (sent) {
        return (
            <div style={{ fontSize: 12, color: "#10B981", fontWeight: 600, marginTop: 12 }}>
                Thanks — that goes straight to the person who builds this.
            </div>
        );
    }

    if (!open) {
        return (
            <button style={{ ...linkStyle, marginTop: 12 }} onClick={() => setOpen(true)}>
                Something look wrong? Tell us
            </button>
        );
    }

    return (
        <div style={{ marginTop: 12, maxWidth: 460 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginBottom: 7, lineHeight: 1.5 }}>
                What looked wrong? A rough note is fine &mdash; &ldquo;score stuck two overs
                behind&rdquo; is more useful than a rating.
            </div>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder="What happened?"
                style={{
                    width: "100%", boxSizing: "border-box", resize: "vertical",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 8, padding: "8px 10px",
                    color: "#E2E8F0", fontSize: 13, fontFamily: "Inter, system-ui",
                }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                    onClick={send}
                    disabled={!text.trim()}
                    style={{
                        background: text.trim() ? "#C8961E" : "rgba(255,255,255,0.1)",
                        color: text.trim() ? "#fff" : "rgba(255,255,255,0.4)",
                        border: "none", borderRadius: 8, padding: "7px 16px",
                        fontSize: 12, fontWeight: 700,
                        cursor: text.trim() ? "pointer" : "default",
                        fontFamily: "Inter, system-ui",
                    }}
                >Send</button>
                <button onClick={() => setOpen(false)} style={{ ...linkStyle, color: "rgba(255,255,255,0.45)" }}>
                    Cancel
                </button>
            </div>
        </div>
    );
}
