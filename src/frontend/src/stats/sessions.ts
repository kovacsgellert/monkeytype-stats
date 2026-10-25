import type { TestResult } from "./normalize";

export const SESSION_GAP_MINUTES = 30;

export interface Session {
  index: number;
  results: TestResult[];
}

/** Splits date-sorted results into sessions separated by gaps longer than `gapMinutes`. */
export function splitSessions(
  results: TestResult[],
  gapMinutes = SESSION_GAP_MINUTES,
): Session[] {
  const sessions: Session[] = [];
  let current: TestResult[] = [];
  for (const r of results) {
    const last = current[current.length - 1];
    if (last && r.date.getTime() - last.date.getTime() > gapMinutes * 60_000) {
      sessions.push({ index: sessions.length, results: current });
      current = [];
    }
    current.push(r);
  }
  if (current.length > 0) sessions.push({ index: sessions.length, results: current });
  return sessions;
}

/** 0-based position of each result within its session, keyed by result id. */
export function sessionPositions(sessions: Session[]): Map<string, { position: number; size: number }> {
  const positions = new Map<string, { position: number; size: number }>();
  for (const session of sessions) {
    session.results.forEach((r, position) =>
      positions.set(r.id, { position, size: session.results.length }),
    );
  }
  return positions;
}
