/* eslint-disable */
import React from "react";

/**
 * ErrorBoundary — wraps any tab/component.
 * If a child throws a render error, shows a clean fallback instead of blank page.
 * Props:
 *   fallback — optional custom fallback element (defaults to built-in card)
 *   label    — section name for the error message (e.g. "Predictions")
 */
export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, errorMsg: "" };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, errorMsg: error?.message || "Unknown error" };
    }

    componentDidCatch(error, info) {
        console.error("[CricIntelligence ErrorBoundary]", error, info?.componentStack);
    }

    render() {
        if (!this.state.hasError) return this.props.children;

        if (this.props.fallback) return this.props.fallback;

        const label = this.props.label || "This section";
        return (
            <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", minHeight: 320, padding: 40, textAlign: "center"
            }}>
                <div style={{
                    background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16,
                    padding: "32px 40px", maxWidth: 440
                }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#0A0A0A", marginBottom: 8 }}>
                        {label} failed to load
                    </div>
                    <div style={{ fontSize: 12, color: "#64748B", marginBottom: 20 }}>
                        {this.state.errorMsg}
                    </div>
                    <button
                        onClick={() => this.setState({ hasError: false, errorMsg: "" })}
                        style={{
                            background: "#1E2D6B", color: "#fff", border: "none",
                            borderRadius: 8, padding: "10px 24px", fontSize: 13,
                            fontWeight: 600, cursor: "pointer"
                        }}
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }
}
