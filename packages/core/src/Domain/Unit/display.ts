import BigNumber from "bignumber.js";
import { conversionFactor, toDisplayValue } from "./convert";
import { familyOf } from "./units";
import type { UnitConfig } from "./resolveUnitConfig";

export interface DisplayUnit {
  unit: string;
  value: BigNumber;
}

export interface ReadOnlyDisplay extends DisplayUnit {
  apiValue: BigNumber;
  apiUnit: string;
}

/**
 * Picks the unit to show an API value in when there's no live-typed display unit to defer to
 * (initial render of an existing value, and read-only views): the largest offered unit for which
 * the converted value is exact to at most 3 decimals and >= 1, falling back to the API unit
 * itself — which is always accepted unconditionally, since it's guaranteed to be offered and is
 * the one representation that's always exact by definition.
 */
export function selectDisplayUnit(apiValue: BigNumber.Value, config: UnitConfig): DisplayUnit {
  const apiValueBN = new BigNumber(apiValue);
  const candidates = [...config.offeredUnits].sort(
    (a, b) => conversionFactor(config, b) - conversionFactor(config, a)
  );

  for (const unit of candidates) {
    const value = toDisplayValue(apiValueBN, unit, config);

    if (
      unit === config.apiUnit ||
      (value.isGreaterThanOrEqualTo(1) && (value.decimalPlaces() ?? Infinity) <= 3)
    ) {
      return { unit, value };
    }
  }

  // Unreachable: `config.apiUnit` is always a member of `config.offeredUnits`.
  return { unit: config.apiUnit, value: apiValueBN };
}

/**
 * Read-only formatting for TreeTable/inventory/diff views: the auto-selected display unit, plus
 * the raw API value and unit for a tooltip. Rendering the final localized string (thousands
 * separators, decimal formatting) is left to the caller.
 */
export function formatReadOnly(apiValue: BigNumber.Value, config: UnitConfig): ReadOnlyDisplay {
  const apiValueBN = new BigNumber(apiValue);
  const { unit, value } = selectDisplayUnit(apiValueBN, config);

  return { unit, value, apiValue: apiValueBN, apiUnit: config.apiUnit };
}

/**
 * Offered units in the family opposite `currentUnit`'s, for the live field's secondary
 * "≈ ... (metric/binary)" helper line — only meaningful when both scales are offered. Empty for
 * `duration` (no families) or when `config.scales` restricts to a single family. When
 * `currentUnit` is the base unit itself (belongs to neither family), the metric family is shown by
 * default — an arbitrary but reasonable tie-break, since the base unit is equally "in" both.
 */
export function otherScaleCandidates(config: UnitConfig, currentUnit: string): string[] {
  if (config.scales !== "both") {
    return [];
  }

  const currentFamily = familyOf(config.kind, currentUnit);
  const otherFamily = currentFamily === "iec" ? "metric" : "iec";

  return config.offeredUnits.filter((unit) => {
    const family = familyOf(config.kind, unit);

    return family === otherFamily || family === "base";
  });
}
