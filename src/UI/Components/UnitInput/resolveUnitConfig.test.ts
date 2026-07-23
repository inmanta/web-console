import { resolveUnitConfig } from "./resolveUnitConfig";

describe("resolveUnitConfig", () => {
  test("GIVEN web_unit is a base unit with no scales annotation WHEN resolved THEN both families are offered, ascending by magnitude", () => {
    const result = resolveUnitConfig({ web_unit: "B" }, "int");

    expect(result).toEqual({
      ok: true,
      config: {
        kind: "size",
        apiUnit: "B",
        isInt: true,
        isOptional: false,
        scales: "both",
        offeredUnits: ["B", "kB", "KiB", "MB", "MiB", "GB", "GiB", "TB", "TiB", "PB", "PiB"],
        displayUnit: "B",
      },
    });
  });

  test("GIVEN web_unit is B restricted to iec WHEN resolved THEN only base + IEC units are offered", () => {
    const result = resolveUnitConfig({ web_unit: "B", web_unit_scales: "iec" }, "int");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.scales).toBe("iec");
      expect(result.config.offeredUnits).toEqual(["B", "KiB", "MiB", "GiB", "TiB", "PiB"]);
      expect(result.config.displayUnit).toBe("B");
    }
  });

  test("GIVEN web_unit_display is a valid offered unit WHEN resolved THEN it becomes the display unit", () => {
    const result = resolveUnitConfig(
      { web_unit: "B", web_unit_scales: "iec", web_unit_display: "MiB" },
      "int"
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.displayUnit).toBe("MiB");
    }
  });

  test("GIVEN web_unit_display is not an offered unit WHEN resolved THEN it falls back to web_unit", () => {
    const result = resolveUnitConfig(
      { web_unit: "B", web_unit_scales: "iec", web_unit_display: "MB" },
      "int"
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.displayUnit).toBe("B");
    }
  });

  test("GIVEN web_unit is a non-base metric unit WHEN resolved THEN only whole-multiple metric units are offered", () => {
    const result = resolveUnitConfig({ web_unit: "MB" }, "int");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.scales).toBe("metric");
      expect(result.config.offeredUnits).toEqual(["MB", "GB", "TB", "PB"]);
    }
  });

  test("GIVEN web_unit is a non-base IEC unit WHEN resolved THEN only whole-multiple IEC units are offered", () => {
    const result = resolveUnitConfig({ web_unit: "MiB" }, "int");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.scales).toBe("iec");
      expect(result.config.offeredUnits).toEqual(["MiB", "GiB", "TiB", "PiB"]);
    }
  });

  test("GIVEN web_unit is a non-base unit WHEN a scales override is provided THEN the override is ignored", () => {
    const result = resolveUnitConfig({ web_unit: "MB", web_unit_scales: "iec" }, "int");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.scales).toBe("metric");
      expect(result.config.offeredUnits).toEqual(["MB", "GB", "TB", "PB"]);
    }
  });

  test("GIVEN a non-base bit-rate unit WHEN resolved THEN sub-unit bit/s is excluded and only whole multiples offered", () => {
    const result = resolveUnitConfig({ web_unit: "kbit/s" }, "int");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.offeredUnits).toEqual(["kbit/s", "Mbit/s", "Gbit/s", "Tbit/s"]);
    }
  });

  test("GIVEN web_unit is s (duration) WHEN resolved THEN scales are null and only whole-second multiples are offered", () => {
    const result = resolveUnitConfig({ web_unit: "s" }, "int");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.kind).toBe("duration");
      expect(result.config.scales).toBeNull();
      expect(result.config.offeredUnits).toEqual(["s", "min", "h", "d"]);
    }
  });

  test.each([
    ["int", true, false],
    ["int?", true, true],
    ["float", false, false],
    ["float?", false, true],
  ] as const)(
    "GIVEN attribute type %s WHEN resolved THEN isInt=%s and isOptional=%s",
    (type, isInt, isOptional) => {
      const result = resolveUnitConfig({ web_unit: "B" }, type);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.config.isInt).toBe(isInt);
        expect(result.config.isOptional).toBe(isOptional);
      }
    }
  );

  test("GIVEN web_unit is unrecognized WHEN resolved THEN degrades gracefully with a reason", () => {
    const result = resolveUnitConfig({ web_unit: "notAUnit" }, "int");

    expect(result).toEqual({ ok: false, reason: 'Unrecognized web_unit "notAUnit".' });
  });

  test.each(["string", "bool", "int[]", "float[]"] as const)(
    "GIVEN attribute type %s WHEN resolved THEN degrades gracefully since it is not a scalar int/float",
    (type) => {
      const result = resolveUnitConfig({ web_unit: "B" }, type);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toContain("int/float");
      }
    }
  );
});
