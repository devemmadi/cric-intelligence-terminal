/* eslint-disable */
import React from "react";
import BetwayBanner from "./BetwayBanner";
import WilliamHillBanner from "./WilliamHillBanner";
import { AFFILIATES, AFFILIATE_NAMES } from "./shared/affiliates";

/*
 * Which betting partner a visitor sees, decided in one place.
 *
 * Stacking every partner banner on top of each other reads as ad spam and costs
 * more in trust than it gains in clicks, so a visitor is assigned ONE brand and
 * sees only that brand everywhere — sidebar card, mobile card and the sticky
 * bottom bar all read from `useAffiliateBrand()`.
 *
 * The assignment is a 50/50 split frozen in localStorage on first visit, so it
 * survives scrolling, tab switches and return visits. That split is also the
 * measurement: with 14 clicks and zero signups there is no basis yet for
 * guessing which partner converts, and an even, stable split plus the
 * per-placement sub-tracker on each link is what produces that answer. Read it
 * in the William Hill and SuperPartners reports — nothing is logged from here.
 *
 * Geo is deliberately not part of the choice: both offers are UK (`en-gb`, £
 * denominated), so there is currently nothing to route non-UK visitors to.
 */

const KEY = "ci_aff_brand";

function pickBrand() {
    try {
        const saved = localStorage.getItem(KEY);
        if (AFFILIATE_NAMES.includes(saved)) return saved;
        const chosen = AFFILIATE_NAMES[Math.floor(Math.random() * AFFILIATE_NAMES.length)];
        localStorage.setItem(KEY, chosen);
        return chosen;
    } catch {
        // Private mode / storage disabled — still show a banner, just unstable.
        return AFFILIATE_NAMES[Math.floor(Math.random() * AFFILIATE_NAMES.length)];
    }
}

/** The partner assigned to this visitor. Stable for the life of the component. */
export function useAffiliateBrand() {
    const [name] = React.useState(pickBrand);
    return { name, ...AFFILIATES[name] };
}

export default function AffiliateBanner({ style = {}, placement = "" }) {
    const { name } = useAffiliateBrand();

    return name === "williamhill"
        ? <WilliamHillBanner style={style} placement={placement} />
        : <BetwayBanner style={style} placement={placement} />;
}
