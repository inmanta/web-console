import { Reference } from "@/Core/Domain";
import { complianceMutators, environmentMutators } from "./Mock";
import { collectReplacements } from "./collectReplacements";

describe("collectReplacements", () => {
  test("turns a whole-attribute mutator into one replacement", () => {
    const { replacements, undisplayedCount } = collectReplacements(complianceMutators);

    expect(undisplayedCount).toBe(0);
    expect(replacements).toEqual([
      {
        destination: "value",
        attributeKey: "value",
        isWholeAttribute: true,
        referenceId: "b5d776d4-f3c4-358e-a102-2d1b2fc28a18",
      },
    ]);
  });

  test("keeps a nested destination partial and keyed on its attribute", () => {
    const { replacements } = collectReplacements(environmentMutators);

    expect(replacements).toEqual([
      {
        destination: "api.'api_token'",
        attributeKey: "api",
        isWholeAttribute: false,
        referenceId: "342e665e-1ff9-3037-adf1-9c1cbc154fed",
      },
    ]);
  });

  test("collects several replacements that target one attribute", () => {
    const mutators: Reference.RawMutator[] = [
      {
        type: "core::Replace",
        args: [
          { name: "value", type: "reference", id: "ref-user" },
          { name: "destination", type: "literal", value: "creds.'username'" },
        ],
      },
      {
        type: "core::Replace",
        args: [
          { name: "value", type: "reference", id: "ref-pass" },
          { name: "destination", type: "literal", value: "creds.'password'" },
        ],
      },
    ];

    const { replacements, undisplayedCount } = collectReplacements(mutators);

    expect(undisplayedCount).toBe(0);
    expect(replacements.map((replacement) => replacement.attributeKey)).toEqual(["creds", "creds"]);
    expect(replacements.map((replacement) => replacement.referenceId)).toEqual([
      "ref-user",
      "ref-pass",
    ]);
  });

  test("counts, but does not render, mutators it cannot interpret", () => {
    const mutators: Reference.RawMutator[] = [
      // not a core::Replace
      { type: "core::Something", args: [] },
      // core::Replace whose value is a literal, not a reference
      {
        type: "core::Replace",
        args: [
          { name: "value", type: "literal", value: "a-plain-value" },
          { name: "destination", type: "literal", value: "field" },
        ],
      },
      // core::Replace missing its destination
      {
        type: "core::Replace",
        args: [{ name: "value", type: "reference", id: "ref-1" }],
      },
    ];

    const { replacements, undisplayedCount } = collectReplacements(mutators);

    expect(replacements).toHaveLength(0);
    expect(undisplayedCount).toBe(3);
  });
});
