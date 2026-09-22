import { complianceAttributes, complianceMutators, complianceReferences } from "./Mock";
import { extractMutators, extractReferences } from "./extract";

describe("extractReferences / extractMutators", () => {
  test("pull the arrays off a resource's attributes", () => {
    expect(extractReferences(complianceAttributes)).toBe(complianceReferences);
    expect(extractMutators(complianceAttributes)).toBe(complianceMutators);
  });

  test.each([
    { label: "an absent key", attributes: {} },
    { label: "a non-array value", attributes: { references: 42, mutators: "x" } },
  ])("return empty arrays for $label", ({ attributes }) => {
    expect(extractReferences(attributes)).toEqual([]);
    expect(extractMutators(attributes)).toEqual([]);
  });
});
