import BigNumber from "bignumber.js";
import { toApiValue, toDisplayValue } from "./convert";
import type { UnitConfig } from "./resolveUnitConfig";

/**
 * Bounds from `validation_parameters` (pydantic's `conint`/`confloat` `ge`/`gt`/`le`/`lt`),
 * expressed in API units — same as the stored value.
 */
export interface UnitBounds {
  ge?: number;
  gt?: number;
  le?: number;
  lt?: number;
}

type BoundOp = keyof UnitBounds;

/**
 * A validation failure, structured rather than pre-formatted: the component layer turns this into
 * copy via the `words()` dictionary (see #7022's i18n note), keeping this module UI/i18n-free.
 */
export type UnitValidationError =
  | { kind: "not-a-number" }
  | { kind: "not-exact"; entered: string; unit: string; apiValue: BigNumber; apiUnit: string }
  | { kind: "bound"; op: BoundOp; limit: BigNumber; limitInUnit: BigNumber; unit: string };

export type UnitValidationResult =
  | { valid: true; apiValue: BigNumber | null }
  | { valid: false; error: UnitValidationError };

function firstViolatedBound(
  apiValue: BigNumber,
  bounds: UnitBounds
): { op: BoundOp; limit: BigNumber } | null {
  const checks: Array<[BoundOp, (a: BigNumber, b: BigNumber) => boolean]> = [
    ["ge", (a, b) => a.isGreaterThanOrEqualTo(b)],
    ["gt", (a, b) => a.isGreaterThan(b)],
    ["le", (a, b) => a.isLessThanOrEqualTo(b)],
    ["lt", (a, b) => a.isLessThan(b)],
  ];

  for (const [op, passes] of checks) {
    const limit = bounds[op];

    if (limit === undefined) {
      continue;
    }

    const limitBN = new BigNumber(limit);

    if (!passes(apiValue, limitBN)) {
      return { op, limit: limitBN };
    }
  }

  return null;
}

/**
 * Validates a typed entry against the spec's rules, in order: parseable -> exactness (int types
 * only) -> bounds. An empty entry is always valid (`apiValue: null`) — whether that's acceptable
 * for a required field is the form framework's existing required-field concern, not this
 * component's.
 */
export function validateUnitInput(
  entered: string,
  unit: string,
  config: UnitConfig,
  bounds?: UnitBounds
): UnitValidationResult {
  if (entered.trim() === "") {
    return { valid: true, apiValue: null };
  }

  const apiValue = toApiValue(entered, unit, config);

  if (apiValue === null) {
    return { valid: false, error: { kind: "not-a-number" } };
  }

  if (config.isInt && !apiValue.isInteger()) {
    return {
      valid: false,
      error: {
        kind: "not-exact",
        entered: entered.trim(),
        unit,
        apiValue,
        apiUnit: config.apiUnit,
      },
    };
  }

  const violated = bounds && firstViolatedBound(apiValue, bounds);

  if (violated) {
    return {
      valid: false,
      error: {
        kind: "bound",
        op: violated.op,
        limit: violated.limit,
        limitInUnit: toDisplayValue(violated.limit, unit, config),
        unit,
      },
    };
  }

  return { valid: true, apiValue };
}
