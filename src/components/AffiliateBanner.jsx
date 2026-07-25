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
 *
 * Geo is deliberately not part of this: both offers are UK (`en-gb`, £
 * denominated), so there is currently nothing to route non-UK visitors to.
 */

const PRIMARY = "williamhill";

/** The partner that owns the prominent placements. */
export function useAffiliateBrand() {
    return { name: PRIMARY, ...AFFILIATES[PRIMARY] };
}

export default function AffiliateBanner({ style = {}, placement = "" }) {
    return PRIMARY === "williamhill"
        ? <WilliamHillBanner style={style} placement={placement} />
        : <BetwayBanner style={style} placement={placement} />;
}
