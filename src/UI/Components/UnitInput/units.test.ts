import {
  baseUnitOf,
  defaultDisplay,
  defaultScales,
  factorOf,
  familyOf,
  findUnit,
  isBaseUnit,
  unitsOfKind,
} from "./units";

describe("units catalogue", () => {
  test("GIVEN unitsOfKind WHEN called for size THEN returns every metric and IEC size code once", () => {
    expect(unitsOfKind("size").sort()).toEqual(
      ["B", "kB", "MB", "GB", "TB", "PB", "KiB", "MiB", "GiB", "TiB", "PiB"].sort()
    );
  });

  test("GIVEN unitsOfKind WHEN called for bitrate THEN returns every metric and IEC bit-rate code once", () => {
    expect(unitsOfKind("bitrate").sort()).toEqual(
      ["bit/s", "kbit/s", "Mbit/s", "Gbit/s", "Tbit/s", "Kibit/s", "Mibit/s", "Gibit/s", "Tibit/s"].sort()
    );
  });

  test("GIVEN unitsOfKind WHEN called for byterate THEN returns every metric and IEC byte-rate code once", () => {
    expect(unitsOfKind("byterate").sort()).toEqual(
      ["B/s", "kB/s", "MB/s", "GB/s", "TB/s", "KiB/s", "MiB/s", "GiB/s", "TiB/s"].sort()
    );
  });

  test("GIVEN unitsOfKind WHEN called for duration THEN returns the mixed-radix ladder", () => {
    expect(unitsOfKind("duration")).toEqual(["ns", "us", "ms", "s", "min", "h", "d"]);
  });

  test.each([
    ["size", "B", 1],
    ["size", "kB", 1e3],
    ["size", "MB", 1e6],
    ["size", "GB", 1e9],
    ["size", "TB", 1e12],
    ["size", "PB", 1e15],
    ["size", "KiB", 1024],
    ["size", "MiB", 1024 ** 2],
    ["size", "GiB", 1024 ** 3],
    ["size", "TiB", 1024 ** 4],
    ["size", "PiB", 1024 ** 5],
    ["bitrate", "bit/s", 1],
    ["bitrate", "kbit/s", 1e3],
    ["bitrate", "Tbit/s", 1e12],
    ["bitrate", "Kibit/s", 1024],
    ["bitrate", "Tibit/s", 1024 ** 4],
    ["byterate", "B/s", 1],
    ["byterate", "TB/s", 1e12],
    ["byterate", "TiB/s", 1024 ** 4],
    ["duration", "ns", 1],
    ["duration", "us", 1e3],
    ["duration", "ms", 1e6],
    ["duration", "s", 1e9],
    ["duration", "min", 6e10],
    ["duration", "h", 3.6e12],
    ["duration", "d", 8.64e13],
  ] as const)(
    "GIVEN factorOf WHEN called with kind=%s code=%s THEN returns %d",
    (kind, code, expected) => {
      expect(factorOf(kind, code)).toBe(expected);
    }
  );

  test("GIVEN factorOf WHEN code does not belong to kind THEN returns undefined", () => {
    expect(factorOf("size", "kbit/s")).toBeUndefined();
    expect(factorOf("bitrate", "GiB")).toBeUndefined();
    expect(factorOf("duration", "GB")).toBeUndefined();
  });

  test.each([
    ["size", "B", "base"],
    ["size", "kB", "metric"],
    ["size", "GB", "metric"],
    ["size", "KiB", "iec"],
    ["size", "GiB", "iec"],
    ["bitrate", "bit/s", "base"],
    ["bitrate", "kbit/s", "metric"],
    ["bitrate", "Kibit/s", "iec"],
    ["byterate", "B/s", "base"],
    ["byterate", "kB/s", "metric"],
    ["byterate", "KiB/s", "iec"],
  ] as const)(
    "GIVEN familyOf WHEN called with kind=%s code=%s THEN returns %s",
    (kind, code, expected) => {
      expect(familyOf(kind, code)).toBe(expected);
    }
  );

  test("GIVEN familyOf WHEN kind is duration THEN every code has no family", () => {
    for (const code of unitsOfKind("duration")) {
      expect(familyOf("duration", code)).toBeUndefined();
    }
  });

  test("GIVEN familyOf WHEN code is unrecognized for the kind THEN returns undefined", () => {
    expect(familyOf("size", "notAUnit")).toBeUndefined();
  });

  test("GIVEN isBaseUnit WHEN called THEN only the base code matches per kind", () => {
    expect(isBaseUnit("size", "B")).toBe(true);
    expect(isBaseUnit("size", "MiB")).toBe(false);
    expect(isBaseUnit("bitrate", "bit/s")).toBe(true);
    expect(isBaseUnit("byterate", "B/s")).toBe(true);
    expect(isBaseUnit("duration", "s")).toBe(true);
    expect(isBaseUnit("duration", "min")).toBe(false);
  });

  test("GIVEN baseUnitOf WHEN called for each kind THEN returns the documented base unit", () => {
    expect(baseUnitOf("size")).toBe("B");
    expect(baseUnitOf("bitrate")).toBe("bit/s");
    expect(baseUnitOf("byterate")).toBe("B/s");
    expect(baseUnitOf("duration")).toBe("s");
  });

  describe("findUnit", () => {
    test("GIVEN a recognized code WHEN it is a base unit THEN resolves with family base", () => {
      expect(findUnit("B")).toEqual({ kind: "size", code: "B", family: "base", factor: 1 });
      expect(findUnit("bit/s")).toEqual({ kind: "bitrate", code: "bit/s", family: "base", factor: 1 });
    });

    test("GIVEN a recognized code WHEN it is a metric or IEC unit THEN resolves with the matching family", () => {
      expect(findUnit("GB")).toEqual({ kind: "size", code: "GB", family: "metric", factor: 1e9 });
      expect(findUnit("GiB")).toEqual({ kind: "size", code: "GiB", family: "iec", factor: 1024 ** 3 });
    });

    test("GIVEN a duration code WHEN resolved THEN family is base regardless of ladder position", () => {
      expect(findUnit("h")).toEqual({ kind: "duration", code: "h", family: "base", factor: 3.6e12 });
    });

    test("GIVEN an unrecognized code WHEN resolved THEN returns undefined", () => {
      expect(findUnit("XB")).toBeUndefined();
    });
  });

  describe("defaultScales", () => {
    test("GIVEN web_unit is a kind's base unit WHEN defaulted THEN scales default to both", () => {
      expect(defaultScales("size", "B")).toBe("both");
      expect(defaultScales("bitrate", "bit/s")).toBe("both");
      expect(defaultScales("byterate", "B/s")).toBe("both");
    });

    test("GIVEN web_unit is a non-base metric unit WHEN defaulted THEN scales default to metric", () => {
      expect(defaultScales("size", "MB")).toBe("metric");
    });

    test("GIVEN web_unit is a non-base IEC unit WHEN defaulted THEN scales default to iec", () => {
      expect(defaultScales("size", "MiB")).toBe("iec");
    });

    test("GIVEN kind is duration WHEN defaulted THEN scales are null regardless of web_unit", () => {
      expect(defaultScales("duration", "s")).toBeNull();
      expect(defaultScales("duration", "min")).toBeNull();
    });

    test("GIVEN web_unit is unrecognized for the kind WHEN defaulted THEN scales are null", () => {
      expect(defaultScales("size", "notAUnit")).toBeNull();
    });
  });

  describe("defaultDisplay", () => {
    test("GIVEN web_unit WHEN defaulted THEN web_unit_display defaults to web_unit itself", () => {
      expect(defaultDisplay("MiB")).toBe("MiB");
      expect(defaultDisplay("kbit/s")).toBe("kbit/s");
    });
  });
});
