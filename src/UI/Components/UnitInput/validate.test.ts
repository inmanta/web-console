import { resolveUnitConfig } from "./resolveUnitConfig";
import { validateUnitInput } from "./validate";
import type { UnitConfig } from "./resolveUnitConfig";

function configFor(webUnit: string, type: string, scales?: "metric" | "iec" | "both"): UnitConfig {
  const result = resolveUnitConfig({ web_unit: webUnit, web_unit_scales: scales }, type);

  if (!result.ok) {
    throw new Error(`test fixture unit config could not be resolved: ${result.reason}`);
  }

  return result.config;
}

describe("validateUnitInput", () => {
  test("GIVEN an empty entry WHEN validated THEN is valid with a null apiValue", () => {
    expect(validateUnitInput("", "MB", configFor("MB", "int"))).toEqual({
      valid: true,
      apiValue: null,
    });
    expect(validateUnitInput("   ", "MB", configFor("MB", "int?"))).toEqual({
      valid: true,
      apiValue: null,
    });
  });

  test("GIVEN an unparsable entry WHEN validated THEN fails with not-a-number", () => {
    const result = validateUnitInput("not a number", "MB", configFor("MB", "int"));

    expect(result).toEqual({ valid: false, error: { kind: "not-a-number" } });
  });

  test("GIVEN 2.0001 GB with web_unit MB on an int attribute WHEN validated THEN fails exactness with the issue's worked numbers", () => {
    const result = validateUnitInput("2.0001", "GB", configFor("MB", "int"));

    expect(result.valid).toBe(false);
    if (!result.valid && result.error.kind === "not-exact") {
      expect(result.error.entered).toBe("2.0001");
      expect(result.error.unit).toBe("GB");
      expect(result.error.apiUnit).toBe("MB");
      expect(result.error.apiValue.toFixed()).toBe("2000.1");
    } else {
      throw new Error("expected a not-exact error");
    }
  });

  test("GIVEN 2.5 GB with web_unit MB on an int attribute WHEN validated THEN passes since 2500 MB is whole", () => {
    const result = validateUnitInput("2.5", "GB", configFor("MB", "int"));

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.apiValue?.toFixed()).toBe("2500");
    }
  });

  test("GIVEN 2.0001 GB with web_unit MB on a float attribute WHEN validated THEN exactness is skipped", () => {
    const result = validateUnitInput("2.0001", "GB", configFor("MB", "float"));

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.apiValue?.toFixed()).toBe("2000.1");
    }
  });

  test("GIVEN a le bound in API units WHEN the entry exceeds it THEN fails with the limit converted to the current display unit", () => {
    const config = configFor("kbit/s", "int");
    const result = validateUnitInput("2000", "Mbit/s", config, { le: 1000000 });

    expect(result.valid).toBe(false);
    if (!result.valid && result.error.kind === "bound") {
      expect(result.error.op).toBe("le");
      expect(result.error.unit).toBe("Mbit/s");
      expect(result.error.limit.toFixed()).toBe("1000000");
      expect(result.error.limitInUnit.toFixed()).toBe("1000");
    } else {
      throw new Error("expected a bound error");
    }
  });

  test("GIVEN a le bound WHEN the entry is within it THEN passes", () => {
    const result = validateUnitInput("150", "Mbit/s", configFor("kbit/s", "int"), { le: 1000000 });

    expect(result.valid).toBe(true);
  });

  test.each([
    ["ge", { ge: 100 }, "50", false],
    ["ge", { ge: 100 }, "100", true],
    ["gt", { gt: 100 }, "100", false],
    ["gt", { gt: 100 }, "101", true],
    ["lt", { lt: 100 }, "100", false],
    ["lt", { lt: 100 }, "99", true],
  ] as const)(
    "GIVEN a %s bound of 100 WHEN entry (in the API unit) is %s THEN valid=%s",
    (op, bounds, entered, expectedValid) => {
      const result = validateUnitInput(entered, "B", configFor("B", "int", "both"), bounds);

      expect(result.valid).toBe(expectedValid);
      if (!result.valid) {
        expect(result.error.kind).toBe("bound");
        if (result.error.kind === "bound") {
          expect(result.error.op).toBe(op);
        }
      }
    }
  );
});
