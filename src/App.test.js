/* eslint-disable */
/**
 * CricIntelligence — Basic smoke tests
 * Run: npm test -- --watchAll=false
 */
import { render, screen } from '@testing-library/react';
import { isMatchEnded, cleanTeam, getLeague } from './components/shared/constants';

// ── cleanTeam ────────────────────────────────────────────────────────────────
test('cleanTeam shortens long names to initials', () => {
    expect(cleanTeam("Namibia Cricket Ground")).toBe("NCG");
});

test('cleanTeam returns known shorts', () => {
    expect(cleanTeam("South Africa")).toBe("SA");
    expect(cleanTeam("New Zealand")).toBe("NZ");
    expect(cleanTeam("West Indies")).toBe("WI");
    expect(cleanTeam("Sri Lanka")).toBe("SL");
});

test('cleanTeam uppercases short names', () => {
    expect(cleanTeam("nam")).toBe("NAM");
    expect(cleanTeam("RCB")).toBe("RCB");
});

test('cleanTeam handles comma-separated names', () => {
    // Cricbuzz sometimes returns "Namibia, Cricket Board"
    expect(cleanTeam("Namibia, Cricket Board")).toBe("NAMIBIA");
});

test('cleanTeam handles empty/null', () => {
    expect(cleanTeam("")).toBe("");
    expect(cleanTeam(null)).toBe("");
});

// ── isMatchEnded ─────────────────────────────────────────────────────────────
test('isMatchEnded detects won', () => {
    expect(isMatchEnded("Namibia won by 45 runs")).toBe(true);
});

test('isMatchEnded detects draw/abandoned', () => {
    expect(isMatchEnded("Match drawn")).toBe(true);
    expect(isMatchEnded("Match abandoned")).toBe(true);
    expect(isMatchEnded("No result")).toBe(true);
});

test('isMatchEnded returns false for live status', () => {
    expect(isMatchEnded("Need 42 runs off 30 balls")).toBe(false);
    expect(isMatchEnded("Batting")).toBe(false);
    expect(isMatchEnded("")).toBe(false);
});

// ── getLeague ─────────────────────────────────────────────────────────────────
test('getLeague detects IPL from team names', () => {
    const m = { t1: "RCB", t2: "MI", matchType: "T20", name: "" };
    expect(getLeague(m).key).toBe("IPL");
});

test('getLeague detects PSL', () => {
    const m = { t1: "KRK", t2: "ISL", matchType: "T20", name: "" };
    expect(getLeague(m).key).toBe("PSL");
});

test('getLeague detects ODI from matchType', () => {
    const m = { t1: "NAM", t2: "SCO", matchType: "ODI", name: "" };
    expect(getLeague(m).label).toBe("ODI");
});

test('getLeague detects TEST', () => {
    const m = { t1: "IND", t2: "AUS", matchType: "TEST", name: "" };
    expect(getLeague(m).label).toBe("TEST");
});
