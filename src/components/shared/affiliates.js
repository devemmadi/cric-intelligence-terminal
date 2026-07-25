/* eslint-disable */
/*
 * Betting partner definitions — the single source of truth for tracking links.
 *
 * Every affiliate URL on the site is built from here, so a link never has to be
 * pasted into a component twice and a partner can be swapped in one edit.
 * Imported by BetwayBanner, WilliamHillBanner, AffiliateBanner and the mobile
 * sticky bar.
 *
 * `track()` differs per network: William Hill runs Income Access, where the `c`
 * value is substituted into the btag's `c_` slot; SuperPartners uses a plain `a`
 * query param. Both give per-placement attribution in the partner's own reports,
 * which is how we find out which placement actually earns.
 *
 * Offer copy lives here too so the full banner and the sticky bar can never
 * drift apart — a stale or overstated offer claim is grounds for an affiliate
 * account being pulled, so both surfaces must read the same string.
 */

export const AFFILIATES = {
    williamhill: {
        label: "WILLIAM HILL",
        accent: "#FFB300",
        accentText: "#001a3a",
        barBg: "linear-gradient(90deg, #001a3a 0%, #003066 100%)",
        offerLead: "Bet £10 & Get ",
        offerHighlight: "£30 Free Bets",
        // The promo code is not optional — without R30 the customer gets nothing and
        // the click earns nothing, so it has to appear on every surface.
        barNote: "New UK customers · code R30 · T&Cs apply · 18+",
        // Generated in partners.williamhill.com → Marketing Tools → Get your ads,
        // against site profile 215184 (cricintelligence.com).
        // adid 1439 = Text_Link_WilliamHill_Sports_NewRegistrationPage.
        url: "https://campaigns.williamhill.com/C.ashx?btag=a_215184b_1439c_&affid=1745040&siteid=215184&adid=1439&c=",
        track: (url, placement) => url + encodeURIComponent(placement || ""),
    },
    betway: {
        label: "BETWAY",
        accent: "#00A651",
        accentText: "#fff",
        barBg: "linear-gradient(90deg, #00281a 0%, #003d24 100%)",
        offerLead: "Bet £10 & Get ",
        offerHighlight: "£40 Free Bets",
        barNote: "New customers · T&Cs apply · 18+",
        // SuperPartners affiliate id sp53067.
        url: "https://betway.com/bwp/bet10get40/en-gb/?s=sp53067",
        track: (url, placement) => (placement ? `${url}&a=${encodeURIComponent(placement)}` : url),
    },
};

export const AFFILIATE_NAMES = Object.keys(AFFILIATES);

/** Tracked href for a partner + placement, e.g. affiliateHref("betway", "sidebar"). */
export function affiliateHref(name, placement) {
    const a = AFFILIATES[name];
    return a.track(a.url, placement);
}
