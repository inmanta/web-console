import { formatReadOnly, otherScaleCandidates, selectDisplayUnit } from "./display";
import { configFor } from "./testUtils";

describe("selectDisplayUnit", () => {
  test.each([
    [2048, "GiB", "2"],
    [1536, "GiB", "1.5"],
    [1023, "MiB", "1023"],
  ] as const)(
    "GIVEN web_unit MiB and raw %d WHEN auto-selected THEN picks %s = %s (the issue's worked examples)",
    (raw, expectedUnit, expectedValue) => {
      const { unit, value } = selectDisplayUnit(raw, configFor("MiB"));

      expect(unit).toBe(expectedUnit);
      expect(value.toFixed()).toBe(expectedValue);
    }
  );

  test("GIVEN web_unit MB and raw 2500 WHEN auto-selected THEN picks GB = 2.5", () => {
    const { unit, value } = selectDisplayUnit(2500, configFor("MB"));

    expect(unit).toBe("GB");
    expect(value.toFixed()).toBe("2.5");
  });

  test("GIVEN a value smaller than any non-API unit WHEN auto-selected THEN falls back to the API unit", () => {
    const { unit, value } = selectDisplayUnit(500, configFor("B", "int", "iec"));

    expect(unit).toBe("B");
    expect(value.toFixed()).toBe("500");
  });

  test("GIVEN the API unit is reached as the fallback WHEN its own value has more than 3 decimals THEN it is still accepted unconditionally", () => {
    const { unit, value } = selectDisplayUnit("1.23456", configFor("B", "float", "iec"));

    expect(unit).toBe("B");
    expect(value.toFixed()).toBe("1.23456");
  });
});

describe("otherScaleCandidates", () => {
  test("GIVEN scales=both and an IEC current unit WHEN queried THEN returns the metric family plus the base unit", () => {
    expect(otherScaleCandidates(configFor("B", "int", "both"), "GiB")).toEqual([
      "B",
      "kB",
      "MB",
      "GB",
      "TB",
      "PB",
    ]);
  });

  test("GIVEN scales=both and a metric current unit WHEN queried THEN returns the IEC family plus the base unit", () => {
    expect(otherScaleCandidates(configFor("B", "int", "both"), "GB")).toEqual([
      "B",
      "KiB",
      "MiB",
      "GiB",
      "TiB",
      "PiB",
    ]);
  });

  test("GIVEN a single-scale config WHEN queried THEN returns no other-scale candidates", () => {
    expect(otherScaleCandidates(configFor("B", "int", "iec"), "GiB")).toEqual([]);
  });

  test("GIVEN a duration config WHEN queried THEN returns no other-scale candidates", () => {
    expect(otherScaleCandidates(configFor("s"), "min")).toEqual([]);
  });
});

describe("formatReadOnly", () => {
  test("GIVEN an API value WHEN formatted THEN returns the auto-selected display plus the raw API value/unit for a tooltip", () => {
    const result = formatReadOnly(2048, configFor("MiB"));

    expect(result.unit).toBe("GiB");
    expect(result.value.toFixed()).toBe("2");
    expect(result.apiValue.toFixed()).toBe("2048");
    expect(result.apiUnit).toBe("MiB");
  });
});
