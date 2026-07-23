import BigNumber from "bignumber.js";
import { factorOf } from "./units";
import type { UnitConfig } from "./resolveUnitConfig";

/**
 * BigInt-safe conversion between a display unit and the API unit. `factorOf` values are exact
 * safe integers (see units.ts), and every unit in `config.offeredUnits` is, by construction, a
 * positive integer multiple of the API unit — so the conversion factor `k` itself is always a
 * plain, exact integer. The only precision risk is the *product* of a large typed value and a
 * large `k` (e.g. "100" PB in bytes = 1e17, well past `Number.MAX_SAFE_INTEGER`), which is why the
 * multiplication itself goes through `bignumber.js` rather than native arithmetic.
 */

const DECIMAL_PATTERN = /^-?\d+(\.\d+)?$/;

/** `factor(unit) / factor(config.apiUnit)`, exact since both factors are safe integers. */
export function conversionFactor(config: UnitConfig, unit: string): number {
  return factorOf(config.kind, unit)! / factorOf(config.kind, config.apiUnit)!;
}

/**
 * Parses a plain decimal string (optional leading `-`, no exponents/thousands separators — those
 * are a text-input-formatting concern, not this module's). Returns `null` if `entered` isn't one.
 */
export function parseDecimal(entered: string): BigNumber | null {
  if (!DECIMAL_PATTERN.test(entered)) {
    return null;
  }

  return new BigNumber(entered);
}

/** Converts a value typed in `unit` into the equivalent value in API units. `null` if unparsable. */
export function toApiValue(entered: string, unit: string, config: UnitConfig): BigNumber | null {
  const parsed = parseDecimal(entered);

  if (parsed === null) {
    return null;
  }

  return parsed.times(conversionFactor(config, unit));
}

/** Converts an API-unit value into the equivalent value in `unit`. */
export function toDisplayValue(
  apiValue: BigNumber.Value,
  unit: string,
  config: UnitConfig
): BigNumber {
  return new BigNumber(apiValue).dividedBy(conversionFactor(config, unit));
}

/**
 * Downgrades an exact integer `BigNumber` to the JS representation the rest of the app expects:
 * a plain `number` when safe, else a `bigint` — mirroring `parseNumberWithType`'s convention
 * (docs/big-int.md). Non-integer values stay `number` (floats never get promoted to `bigint`).
 */
export function toSubmittableNumber(value: BigNumber): number | bigint {
  if (!value.isInteger()) {
    return value.toNumber();
  }
  if (value.abs().isLessThanOrEqualTo(Number.MAX_SAFE_INTEGER)) {
    return value.toNumber();
  }

  return BigInt(value.toFixed(0));
}
