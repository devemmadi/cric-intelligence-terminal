/* eslint-disable */
import React from "react";
import BetwayBanner from "./BetwayBanner";
import WilliamHillBanner from "./WilliamHillBanner";
import { AFFILIATES } from "./shared/affiliates";

/*
 * The primary betting partner — the one that gets the prominent slots.
 *
 * Stacking every partner banner on top of each other reads as ad spam and costs
 * more in trust than it gains in clicks, so the prominent placements (sidebar
 * card, mobile card, sticky bottom bar) all render ONE partner, read from here
 * via `useAffiliateBrand()`. Secondary partners get a small slot lower down the
 * page instead — see `BetwayBanner compact` in PredictionsTab.
 *
 * Primary is William Hill as of Jul 25 2026: Betway ran for two months and
 * produced 14 clicks and zero signups, and William Hill pays a better rate
 * (30% revenue share), so it gets the traffic that actually converts. Betway
 * stays live in the small slot rather than being dropped, so there is still a
 * comparison to read if William Hill also fails to convert.
 *
 * To change which partner is prominent, change PRIMARY — every surface follows.
 */

const PRIMARY = "williamhill";

/*
 * Both offers are UK-only: "new UK customers", £ denominated, and William Hill
 * verifies identity against UK records. A visitor outside the UK who clicks gets
 * as far as "Unable to create an account" — confirmed by walking it through.
 * Those clicks cannot convert, so showing the banner to them costs trust and
 * returns nothing.
 *
 * It also matters for the Play Store wrapper: Google scrutinises gambling
 * affiliate links, and geo-restricting them is what the large cricket apps
 * already do. Not showing them outside the UK removes most of that risk.
 *
 * Detection is the browser's own timezone — no API call, no IP lookup, nothing
 * that leaves the device and nothing to consent to. It is approximate: a UK user
 * on a VPN sees nothing, someone abroad with their clock on London time sees the
 * banner. Both are acceptable; over-showing a UK-only offer is the failure worth
 * avoiding, and this errs toward showing less.
 *
 * ?geo=uk forces it on for testing, ?geo=off forces it off.
 */
const UK_ZONES = ["Europe/London", "Europe/Belfast", "GB", "GB-Eire"];

export function isUkVisitor() {
    try {
        const q = typeof window !== "undefined" ? window.location.search : "";
        if (q.indexOf("geo=uk") > -1) return true;
        if (q.indexOf("geo=off") > -1) return false;
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        if (UK_ZONES.indexOf(tz) > -1) return true;
        // Fallback for browsers that report no timezone at all.
        return /^en-GB$/i.test((navigator.language || ""));
    } catch (e) {
        return false;   // can't tell -> don't show a UK-only offer
    }
}

/** The partner that owns the prominent placements. */
export function useAffiliateBrand() {
    return { name: PRIMARY, ...AFFILIATES[PRIMARY] };
}

export default function AffiliateBanner({ style = {}, placement = "" }) {
    if (!isUkVisitor()) return null;
    return PRIMARY === "williamhill"
        ? <WilliamHillBanner style={style} placement={placement} />
        : <BetwayBanner style={style} placement={placement} />;
}
