/**
 * Unit catalogue for the UnitInputField family of components (issue #7022).
 *
 * Every quantity kind is stored as a table of canonical, case-sensitive unit codes mapped to a
 * `factor`: how many of the kind's smallest representable unit one of that code is worth. Factors
 * are always exact (safe) integers, including for `duration` (expressed in nanoseconds) — later
 * phases that compare or divide factors can use plain integer arithmetic instead of tolerance
 * checks on floats.
 */

export type UnitKind = "size" | "bitrate" | "byterate" | "duration";

export type ScaleFamily = "metric" | "iec";

/** The `web_unit_scales` annotation value: one scale family, or both. */
export type UnitScales = ScaleFamily | "both";

/** A unit's family within its kind. `duration` units have no family (scales don't apply). */
export type UnitFamily = "base" | ScaleFamily;

export interface ResolvedUnit {
  kind: UnitKind;
  code: string;
  family: UnitFamily;
  factor: number;
}

interface UnitTable {
  base: string;
  metric?: Record<string, number>;
  iec?: Record<string, number>;
  ladder?: Record<string, number>;
}

function toFactors(codes: string[], factors: number[]): Record<string, number> {
  return Object.fromEntries(codes.map((code, index) => [code, factors[index]]));
}

const CATALOGUE: Record<UnitKind, UnitTable> = {
  size: {
    base: "B",
    metric: toFactors(["B", "kB", "MB", "GB", "TB", "PB"], [1, 1e3, 1e6, 1e9, 1e12, 1e15]),
    iec: toFactors(
      ["B", "KiB", "MiB", "GiB", "TiB", "PiB"],
      [1, 1024, 1024 ** 2, 1024 ** 3, 1024 ** 4, 1024 ** 5]
    ),
  },
  bitrate: {
    base: "bit/s",
    metric: toFactors(["bit/s", "kbit/s", "Mbit/s", "Gbit/s", "Tbit/s"], [1, 1e3, 1e6, 1e9, 1e12]),
    iec: toFactors(
      ["bit/s", "Kibit/s", "Mibit/s", "Gibit/s", "Tibit/s"],
      [1, 1024, 1024 ** 2, 1024 ** 3, 1024 ** 4]
    ),
  },
  byterate: {
    base: "B/s",
    metric: toFactors(["B/s", "kB/s", "MB/s", "GB/s", "TB/s"], [1, 1e3, 1e6, 1e9, 1e12]),
    iec: toFactors(
      ["B/s", "KiB/s", "MiB/s", "GiB/s", "TiB/s"],
      [1, 1024, 1024 ** 2, 1024 ** 3, 1024 ** 4]
    ),
  },
  duration: {
    base: "s",
    // Expressed in nanoseconds so every factor is an exact integer; the mixed-radix ladder has
    // no metric/IEC split, so `web_unit_scales` is never consulted for this kind.
    ladder: toFactors(
      ["ns", "us", "ms", "s", "min", "h", "d"],
      [1, 1e3, 1e6, 1e9, 6e10, 3.6e12, 8.64e13]
    ),
  },
};

/** All canonical codes for a kind, across both scale families (or the duration ladder). */
export function unitsOfKind(kind: UnitKind): string[] {
  const table = CATALOGUE[kind];

  if (table.ladder) {
    return Object.keys(table.ladder);
  }

  return Array.from(new Set([...Object.keys(table.metric!), ...Object.keys(table.iec!)]));
}

/** The canonical unit a bare API value is expressed in when no annotation is present. */
export function baseUnitOf(kind: UnitKind): string {
  return CATALOGUE[kind].base;
}

/** The unit's magnitude, or `undefined` if `code` doesn't belong to `kind`. */
export function factorOf(kind: UnitKind, code: string): number | undefined {
  const table = CATALOGUE[kind];

  if (table.ladder) {
    return table.ladder[code];
  }

  return table.metric![code] ?? table.iec![code];
}

/** The unit's scale family, or `undefined` if `code` doesn't belong to `kind`. */
export function familyOf(kind: UnitKind, code: string): UnitFamily | undefined {
  const table = CATALOGUE[kind];

  if (table.ladder) {
    return undefined; // duration units have no family — scales don't apply to this kind
  }
  if (code === table.base) {
    return "base";
  }
  if (table.metric![code] !== undefined) {
    return "metric";
  }
  if (table.iec![code] !== undefined) {
    return "iec";
  }

  return undefined;
}

export function isBaseUnit(kind: UnitKind, code: string): boolean {
  return code === CATALOGUE[kind].base;
}

/**
 * Looks up a unit code across every kind. Codes are unique across the whole catalogue, so the
 * result is unambiguous. Returns `undefined` for an unrecognized code — the caller (Phase 1-b's
 * `resolveUnitConfig`) is responsible for the graceful-degradation fallback the spec requires.
 */
export function findUnit(code: string): ResolvedUnit | undefined {
  const kinds: UnitKind[] = ["size", "bitrate", "byterate", "duration"];

  for (const kind of kinds) {
    const factor = factorOf(kind, code);

    if (factor === undefined) {
      continue;
    }

    // Duration units have no family (`familyOf` returns undefined) — treat them as "base"
    // since scales don't restrict anything for this kind.
    const family: UnitFamily = kind === "duration" ? "base" : (familyOf(kind, code) ?? "base");

    return { kind, code, family, factor };
  }

  return undefined;
}

/**
 * `web_unit_scales` defaulting rule: `"both"` when `webUnit` is the kind's base unit, otherwise
 * the family of `webUnit`. Returns `null` for `duration` (scales don't apply) and for an
 * unrecognized `webUnit`.
 */
export function defaultScales(kind: UnitKind, webUnit: string): UnitScales | null {
  if (kind === "duration") {
    return null;
  }
  if (isBaseUnit(kind, webUnit)) {
    return "both";
  }

  const family = familyOf(kind, webUnit);

  return family === "metric" || family === "iec" ? family : null;
}
