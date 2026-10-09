/**
 * End-to-end walkthroughs of the issue #7022 worked examples, chaining resolveUnitConfig ->
 * convert -> validate the way the real component will. Complements the per-function unit tests
 * in resolveUnitConfig.test.ts / convert.test.ts / validate.test.ts with scenario-level coverage.
 */
import { toApiValue, toSubmittableNumber } from "./convert";
import { resolveUnitConfig } from "./resolveUnitConfig";
import { validateUnitInput } from "./validate";

describe("UnitInputField worked examples", () => {
  test("memory_limit (web_unit B, scales iec): switching the unit re-interprets the typed digits", () => {
    const result = resolveUnitConfig({ web_unit: "B", web_unit_scales: "iec" }, "int");

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    const typed = "512";

    const inMiB = validateUnitInput(typed, "MiB", result.config);
    const inGiB = validateUnitInput(typed, "GiB", result.config);

    expect(inMiB.valid && inMiB.apiValue?.toFixed()).toBe("536870912");
    // Same digits, different unit -> a completely different stored value, not a converted one.
    expect(inGiB.valid && inGiB.apiValue?.toFixed()).toBe("549755813888");
  });

  test("bandwidth (web_unit kbit/s, bound le 1 Gbit/s): a value entered in Gbit/s over the bound is rejected", () => {
    const result = resolveUnitConfig({ web_unit: "kbit/s" }, "int");

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    const withinBound = validateUnitInput("0.5", "Gbit/s", result.config, { le: 1000000 });
    const overBound = validateUnitInput("2", "Gbit/s", result.config, { le: 1000000 });

    expect(withinBound.valid).toBe(true);
    expect(overBound.valid).toBe(false);
    if (!overBound.valid && overBound.error.kind === "bound") {
      expect(overBound.error.limitInUnit.toFixed()).toBe("1");
    }
  });

  test("disk_quota (web_unit B, scales both): 100 PB round-trips exactly and downgrades to bigint on submit", () => {
    const result = resolveUnitConfig({ web_unit: "B", web_unit_scales: "both" }, "int");

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    const apiValue = toApiValue("100", "PB", result.config)!;
    const submittable = toSubmittableNumber(apiValue);

    expect(apiValue.toFixed()).toBe("100000000000000000");
    expect(typeof submittable).toBe("bigint");
    expect(submittable).toBe(100000000000000000n);
  });

  test("timeout (web_unit s, duration): 2 days validates and converts to whole seconds", () => {
    const result = resolveUnitConfig({ web_unit: "s" }, "int?");

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    const validated = validateUnitInput("2", "d", result.config);

    expect(validated.valid).toBe(true);
    expect(validated.valid && validated.apiValue?.toFixed()).toBe("172800");
  });

  test("timeout (optional, duration): clearing the field yields null, not an error", () => {
    const result = resolveUnitConfig({ web_unit: "s" }, "int?");

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(validateUnitInput("", "s", result.config)).toEqual({ valid: true, apiValue: null });
  });

  test("an unrecognized web_unit degrades gracefully instead of the pipeline throwing", () => {
    const result = resolveUnitConfig({ web_unit: "parsecs" }, "int");

    expect(result).toEqual({ ok: false, reason: 'Unrecognized web_unit "parsecs".' });
  });
});
