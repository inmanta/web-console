import { resolveUnitConfig } from "./resolveUnitConfig";
import type { UnitConfig } from "./resolveUnitConfig";

/** Resolves a UnitConfig for tests, throwing if the fixture itself is invalid. */
export function configFor(
  webUnit: string,
  type = "int",
  scales?: "metric" | "iec" | "both"
): UnitConfig {
  const result = resolveUnitConfig({ web_unit: webUnit, web_unit_scales: scales }, type);

  if (!result.ok) {
    throw new Error(`test fixture unit config could not be resolved: ${result.reason}`);
  }

  return result.config;
}
