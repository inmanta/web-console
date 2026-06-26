import { SuggestionValue } from "@/Core";
import { normalizeSuggestions } from "./useSuggestions";

describe("normalizeSuggestions", () => {
  it("normalizes a bare string to a { label, value } pair where label === value", () => {
    expect(normalizeSuggestions(["10 Gbps", "1 Gbps"])).toEqual([
      { label: "10 Gbps", value: "10 Gbps" },
      { label: "1 Gbps", value: "1 Gbps" },
    ]);
  });

  it("keeps a { label, value } pair as-is", () => {
    const pair: SuggestionValue = { label: "Production network", value: "9f3c1b2a" };

    expect(normalizeSuggestions([pair])).toEqual([pair]);
  });

  it("normalizes a mix of strings and pairs into a single shape", () => {
    expect(normalizeSuggestions(["plain", { label: "10 Gbps", value: "10000" }])).toEqual([
      { label: "plain", value: "plain" },
      { label: "10 Gbps", value: "10000" },
    ]);
  });

  it("coerces numeric scalars and pair fields to strings", () => {
    expect(
      normalizeSuggestions([100, { label: "10 Gbps", value: 10000 }, { label: 1, value: 2 }])
    ).toEqual([
      { label: "100", value: "100" },
      { label: "10 Gbps", value: "10000" },
      { label: "1", value: "2" },
    ]);
  });

  it("drops entries that are neither a scalar nor a valid { label, value } pair", () => {
    expect(
      normalizeSuggestions([
        "ok",
        { label: "missing value" },
        { value: "missing label" },
        { label: "x", value: true },
        { label: {}, value: "y" },
        null,
        undefined,
        true,
      ])
    ).toEqual([{ label: "ok", value: "ok" }]);
  });

  it("returns null when the input is not an array", () => {
    expect(normalizeSuggestions(undefined)).toBeNull();
    expect(normalizeSuggestions(null)).toBeNull();
    expect(normalizeSuggestions("not-an-array")).toBeNull();
  });
});
