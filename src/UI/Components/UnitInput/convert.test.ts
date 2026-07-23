import BigNumber from "bignumber.js";
import {
  conversionFactor,
  parseDecimal,
  toApiValue,
  toDisplayValue,
  toSubmittableNumber,
} from "./convert";
import { resolveUnitConfig } from "./resolveUnitConfig";
import type { UnitConfig } from "./resolveUnitConfig";

function configFor(webUnit: string, scales?: "metric" | "iec" | "both", type = "int"): UnitConfig {
  const result = resolveUnitConfig({ web_unit: webUnit, web_unit_scales: scales }, type);

  if (!result.ok) {
    throw new Error(`test fixture unit config could not be resolved: ${result.reason}`);
  }

  return result.config;
}

describe("conversionFactor", () => {
  test("GIVEN web_unit MB WHEN asked for GB's factor THEN returns the exact integer 1000", () => {
    expect(conversionFactor(configFor("MB"), "GB")).toBe(1000);
  });

  test("GIVEN web_unit MB WHEN asked for MB's own factor THEN returns 1", () => {
    expect(conversionFactor(configFor("MB"), "MB")).toBe(1);
  });

  test("GIVEN web_unit B with iec scales WHEN asked for GiB's factor THEN returns 1024^3", () => {
    expect(conversionFactor(configFor("B", "iec"), "GiB")).toBe(1024 ** 3);
  });
});

describe("parseDecimal", () => {
  test.each(["2.5", "-3", "1000", "0.001", "0", "-0.5"])(
    "GIVEN a plain decimal string %s WHEN parsed THEN returns the equal BigNumber",
    (input) => {
      expect(parseDecimal(input)?.isEqualTo(input)).toBe(true);
    }
  );

  test.each(["", "abc", "1.2.3", "1e5", "1,000", "--1", "1.", "."])(
    "GIVEN an invalid decimal string %s WHEN parsed THEN returns null",
    (input) => {
      expect(parseDecimal(input)).toBeNull();
    }
  );
});

describe("toApiValue", () => {
  test("GIVEN 2.5 GB with web_unit MB WHEN converted THEN yields exactly 2500", () => {
    const value = toApiValue("2.5", "GB", configFor("MB"));

    expect(value?.toFixed()).toBe("2500");
  });

  test("GIVEN 2.0001 GB with web_unit MB WHEN converted THEN yields exactly 2000.1, not a float-rounding artifact", () => {
    const value = toApiValue("2.0001", "GB", configFor("MB"));

    expect(value?.toFixed()).toBe("2000.1");
    // Sanity check this test is actually meaningful: naive float multiplication does NOT
    // reproduce the exact decimal, which is precisely why this module uses BigNumber.
    expect(2.0001 * 1000).not.toBe(2000.1);
  });

  test("GIVEN 100 PB with web_unit B WHEN converted THEN yields the exact value beyond MAX_SAFE_INTEGER", () => {
    const value = toApiValue("100", "PB", configFor("B", "both"));

    expect(value?.toFixed()).toBe("100000000000000000");
    expect(Number.isSafeInteger(Number(value!.toFixed()))).toBe(false);
  });

  test("GIVEN an unparsable entry WHEN converted THEN returns null", () => {
    expect(toApiValue("not a number", "MB", configFor("MB"))).toBeNull();
  });
});

describe("toDisplayValue", () => {
  test("GIVEN 1 GiB in bytes WHEN converted to GiB THEN yields exactly 1", () => {
    const value = toDisplayValue(1024 ** 3, "GiB", configFor("B", "iec"));

    expect(value.toFixed()).toBe("1");
  });

  test("GIVEN an API value WHEN round-tripped through toApiValue then toDisplayValue THEN returns the original entry", () => {
    const config = configFor("MB");
    const apiValue = toApiValue("2.5", "GB", config)!;

    expect(toDisplayValue(apiValue, "GB", config).toFixed()).toBe("2.5");
  });
});

describe("toSubmittableNumber", () => {
  test("GIVEN a safe integer WHEN downgraded THEN returns a plain number", () => {
    const result = toSubmittableNumber(new BigNumber(2500));

    expect(result).toBe(2500);
    expect(typeof result).toBe("number");
  });

  test("GIVEN an integer beyond MAX_SAFE_INTEGER WHEN downgraded THEN returns a bigint", () => {
    const result = toSubmittableNumber(new BigNumber("100000000000000000"));

    expect(result).toBe(100000000000000000n);
    expect(typeof result).toBe("bigint");
  });

  test("GIVEN a non-integer value WHEN downgraded THEN stays a plain number even if large", () => {
    const result = toSubmittableNumber(new BigNumber("2000.1"));

    expect(result).toBe(2000.1);
    expect(typeof result).toBe("number");
  });
});
