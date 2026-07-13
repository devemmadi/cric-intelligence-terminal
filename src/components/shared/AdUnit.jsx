/* eslint-disable */
import { useEffect, useRef } from "react";

// Explicit AdSense ad unit — works in React SPAs where auto-ads fail
// Requires: AdSense script in index.html (already present)
export default function AdUnit({ style = {} }) {
    const ref = useRef(null);
    const pushed = useRef(false);

    useEffect(() => {
        if (pushed.current || !ref.current) return;
        pushed.current = true;
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {}
    }, []);

    return (
        <ins
            ref={ref}
            className="adsbygoogle"
            style={{ display: "block", minHeight: 90, overflow: "hidden", ...style }}
            data-ad-client="ca-pub-5447761777263695"
            data-ad-format="auto"
            data-full-width-responsive="true"
        />
    );
}
