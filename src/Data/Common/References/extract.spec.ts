import { complianceAttributes, complianceMutators, complianceReferences } from "./Mock";
import { extractMutators, extractReferences } from "./extract";

describe("extractReferences / extractMutators", () => {
  test("pull the arrays off a resource's attributes", () => {
    expect(extractReferences(complianceAttributes)).toEqual(complianceReferences);
    expect(extractMutators(complianceAttributes)).toEqual(complianceMutators);
  });

  test.each([
    { label: "an absent key", attributes: {} },
    { label: "a non-array value", attributes: { references: 42, mutators: "x" } },
  ])("return empty arrays for $label", ({ attributes }) => {
    expect(extractReferences(attributes)).toEqual([]);
    expect(extractMutators(attributes)).toEqual([]);
  });

  test.each([
    { label: "a null entry", entry: null },
    { label: "an entry without args", entry: { id: "a", type: "t" } },
    { label: "an entry with non-array args", entry: { id: "a", type: "t", args: {} } },
  ])("drop $label", ({ entry }) => {
    const attributes = { references: [entry], mutators: [entry] };

    expect(extractReferences(attributes)).toEqual([]);
    expect(extractMutators(attributes)).toEqual([]);
  });

  test("drop a reference without a string id and a mutator without a string type", () => {
    const attributes = { references: [{ type: "t", args: [] }], mutators: [{ args: [] }] };

    expect(extractReferences(attributes)).toEqual([]);
    expect(extractMutators(attributes)).toEqual([]);
  });

  test("keep the well-formed entries next to malformed ones", () => {
    const attributes = {
      references: [...complianceReferences, { type: "t" }],
      mutators: [...complianceMutators, null],
    };

    expect(extractReferences(attributes)).toEqual(complianceReferences);
    expect(extractMutators(attributes)).toEqual(complianceMutators);
  });
});
