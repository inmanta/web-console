import type { AttributeModel } from "@/Core";
import { resolveUnitConfig, UnitConfig } from "./resolveUnitConfig";
import { UnitBounds } from "./validate";

const VALID_UNIT_SCALES = new Set(["metric", "iec", "both"]);

/**
 * Narrows the raw `web_unit_scales` annotation string to `resolveUnitConfig`'s expected union,
 * dropping anything else (a typo'd value is ignored — falls back to the default scales — rather
 * than degrading the whole field, since it's a narrower annotation-quality issue than a bad
 * `web_unit`).
 */
function parseUnitScales(value: string | undefined): "metric" | "iec" | "both" | undefined {
  return value && VALID_UNIT_SCALES.has(value) ? (value as "metric" | "iec" | "both") : undefined;
}

/**
 * Reads `ge`/`gt`/`le`/`lt` off an attribute's `validation_parameters`, regardless of
 * `validation_type` — the modeled `AttributeValidation` union only has bounds on
 * `pydantic.conint*`, but the backend can equally send `pydantic.confloat*` bounds for a `float`
 * attribute (not currently modeled anywhere in this union), and the parameter shape is identical.
 * `ParsedNumber` (`number | bigint`) values are narrowed to `number` — `UnitBounds` doesn't carry
 * bigint precision, which matches its current scope (bounds this large aren't a modeled concern
 * yet, only entered values are).
 */
function extractUnitBounds(attribute: AttributeModel): UnitBounds | undefined {
  const params = attribute.validation_parameters as
    Record<string, number | bigint | undefined> | null | undefined;

  if (!params || typeof params !== "object") {
    return undefined;
  }

  const bounds: UnitBounds = {};

  (["ge", "gt", "le", "lt"] as const).forEach((key) => {
    const value = params[key];

    if (typeof value === "number" || typeof value === "bigint") {
      bounds[key] = Number(value);
    }
  });

  return Object.keys(bounds).length > 0 ? bounds : undefined;
}

export type ResolveUnitFieldResult =
  { ok: true; config: UnitConfig; bounds?: UnitBounds } | { ok: false; reason: string };

/**
 * Resolves an attribute's `web_unit*` annotations (issue #7022) into a `UnitConfig` + bounds.
 * Returns `null` when the attribute never opted in (`web_presentation !== "unit"`) — the one case
 * that's silent rather than `{ ok: false }`, since it isn't an error, just "not a unit field".
 *
 * Shared between form creation (#7133, `FieldCreator`) and read-only table formatting (#7132) so
 * the annotation-parsing/bounds-extraction logic isn't duplicated between the two call sites.
 */
export function resolveUnitField(attribute: AttributeModel): ResolveUnitFieldResult | null {
  const annotations = attribute.attribute_annotations;

  if (annotations?.web_presentation !== "unit") {
    return null;
  }

  if (!annotations.web_unit) {
    return {
      ok: false,
      reason: `Attribute "${attribute.name}" has web_presentation: "unit" but no web_unit annotation.`,
    };
  }

  const result = resolveUnitConfig(
    {
      web_unit: annotations.web_unit,
      web_unit_scales: parseUnitScales(annotations.web_unit_scales),
      web_unit_display: annotations.web_unit_display,
    },
    attribute.type
  );

  if (!result.ok) {
    return { ok: false, reason: `Attribute "${attribute.name}": ${result.reason}` };
  }

  return { ok: true, config: result.config, bounds: extractUnitBounds(attribute) };
}
