import { defaultDisplay, defaultScales, factorOf, familyOf, findUnit, isBaseUnit, unitsOfKind } from "./units";
import type { UnitKind, UnitScales } from "./units";

/**
 * The `web_unit`/`web_unit_scales`/`web_unit_display` annotation triple from issue #7022, already
 * narrowed to valid shapes. Turning the raw, untyped `__annotations` dict into this shape (and
 * validating `web_presentation === "unit"` is even set) is the wiring layer's job — see #7133.
 */
export interface UnitAnnotations {
  web_unit: string;
  web_unit_scales?: UnitScales;
  web_unit_display?: string;
}

export interface UnitConfig {
  kind: UnitKind;
  apiUnit: string;
  isInt: boolean;
  isOptional: boolean;

  /** `null` for `duration`, where scale families don't apply. */
  scales: UnitScales | null;

  /** Ascending by magnitude; always includes `apiUnit`. */
  offeredUnits: string[];
  displayUnit: string;
}

export type ResolveUnitConfigResult =
  | { ok: true; config: UnitConfig }
  | { ok: false; reason: string };

function isArrayType(type: string): boolean {
  return type.includes("[]");
}

export function isNumericAttributeType(type: string): boolean {
  return (type.includes("int") || type.includes("float")) && !isArrayType(type);
}

export function isIntAttributeType(type: string): boolean {
  return type.includes("int") && !isArrayType(type);
}

export function isOptionalAttributeType(type: string): boolean {
  return type.endsWith("?");
}

/**
 * `web_unit_scales` resolution: an explicit override is only honored when `apiUnit` is the kind's
 * base unit — for a non-base `apiUnit` the family is fully determined by its magnitude, so any
 * provided value is ignored (per the spec's "web_unit_scales has no effect here").
 */
function resolveScales(kind: UnitKind, apiUnit: string, provided?: UnitScales): UnitScales | null {
  if (kind === "duration") {
    return null;
  }
  if (isBaseUnit(kind, apiUnit) && provided) {
    return provided;
  }

  return defaultScales(kind, apiUnit);
}

/** The "integer rule": a unit is offered iff its factor is a positive integer multiple of the API unit's, and its family is within `scales`. */
function computeOfferedUnits(kind: UnitKind, apiUnit: string, scales: UnitScales | null): string[] {
  const apiFactor = factorOf(kind, apiUnit)!;

  return unitsOfKind(kind)
    .filter((code) => {
      const ratio = factorOf(kind, code)! / apiFactor;

      if (!Number.isInteger(ratio) || ratio <= 0) {
        return false;
      }
      if (kind === "duration") {
        return true;
      }

      const family = familyOf(kind, code);

      return family === "base" || scales === "both" || family === scales;
    })
    .sort((a, b) => factorOf(kind, a)! - factorOf(kind, b)!);
}

/** Falls back to `web_unit` (always offered) when the provided display unit isn't offered. */
function resolveDisplayUnit(apiUnit: string, offeredUnits: string[], provided?: string): string {
  if (provided && offeredUnits.includes(provided)) {
    return provided;
  }

  return defaultDisplay(apiUnit);
}

/**
 * Resolves the annotation contract into a `UnitConfig`, or a human-readable reason the field
 * should gracefully degrade to a plain number field (per the spec, this is never a thrown error).
 */
export function resolveUnitConfig(
  annotations: UnitAnnotations,
  attributeType: string
): ResolveUnitConfigResult {
  if (!isNumericAttributeType(attributeType)) {
    return {
      ok: false,
      reason: `web_presentation: "unit" is only supported on int/float attributes (got "${attributeType}").`,
    };
  }

  const resolved = findUnit(annotations.web_unit);

  if (!resolved) {
    return { ok: false, reason: `Unrecognized web_unit "${annotations.web_unit}".` };
  }

  const { kind, code: apiUnit } = resolved;
  const scales = resolveScales(kind, apiUnit, annotations.web_unit_scales);
  const offeredUnits = computeOfferedUnits(kind, apiUnit, scales);
  const displayUnit = resolveDisplayUnit(apiUnit, offeredUnits, annotations.web_unit_display);

  return {
    ok: true,
    config: {
      kind,
      apiUnit,
      isInt: isIntAttributeType(attributeType),
      isOptional: isOptionalAttributeType(attributeType),
      scales,
      offeredUnits,
      displayUnit,
    },
  };
}
