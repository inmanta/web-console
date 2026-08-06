import type { AttributeModel } from "@/Core";
import { resolveUnitField } from "./resolveUnitField";

function attribute(overrides: Partial<AttributeModel> = {}): AttributeModel {
  return {
    name: "bandwidth",
    description: "description",
    modifier: "rw+",
    type: "int",
    default_value: null,
    default_value_set: false,
    validation_type: "pydantic.conint",
    validation_parameters: {},
    ...overrides,
  } as AttributeModel;
}

describe("resolveUnitField", () => {
  test("GIVEN an attribute without web_presentation WHEN resolved THEN returns null", () => {
    expect(resolveUnitField(attribute())).toBeNull();
  });

  test("GIVEN web_presentation is something other than 'unit' WHEN resolved THEN returns null", () => {
    expect(
      resolveUnitField(attribute({ attribute_annotations: { web_presentation: "documentation" } }))
    ).toBeNull();
  });

  test("GIVEN a valid web_unit annotation WHEN resolved THEN returns the resolved config and bounds", () => {
    const result = resolveUnitField(
      attribute({
        attribute_annotations: { web_presentation: "unit", web_unit: "kbit/s" },
        validation_parameters: { le: 1000000 },
      })
    );

    expect(result?.ok).toBe(true);
    if (result?.ok) {
      expect(result.config.kind).toBe("bitrate");
      expect(result.config.apiUnit).toBe("kbit/s");
      expect(result.bounds).toEqual({ le: 1000000 });
    }
  });

  test("GIVEN web_presentation: 'unit' with no web_unit WHEN resolved THEN returns a not-ok result naming the attribute", () => {
    const result = resolveUnitField(
      attribute({ name: "my_attr", attribute_annotations: { web_presentation: "unit" } })
    );

    expect(result).toEqual({
      ok: false,
      reason: 'Attribute "my_attr" has web_presentation: "unit" but no web_unit annotation.',
    });
  });

  test("GIVEN an unrecognized web_unit WHEN resolved THEN returns a not-ok result naming the attribute and reason", () => {
    const result = resolveUnitField(
      attribute({
        name: "my_attr",
        attribute_annotations: { web_presentation: "unit", web_unit: "parsecs" },
      })
    );

    expect(result).toEqual({
      ok: false,
      reason: 'Attribute "my_attr": Unrecognized web_unit "parsecs".',
    });
  });

  test("GIVEN a confloat-shaped validation_parameters (validation_type not modeled) WHEN resolved THEN bounds are still extracted", () => {
    // `pydantic.confloat` isn't a validation_type the AttributeValidation union models at all
    // (see resolveUnitField.ts's comment) — cast past the union to simulate what the backend can
    // still send at runtime.
    const confloatAttribute = {
      ...attribute({ type: "float" }),
      attribute_annotations: { web_presentation: "unit", web_unit: "B" },
      validation_type: "pydantic.confloat",
      validation_parameters: { ge: 0.5 },
    } as unknown as AttributeModel;

    const result = resolveUnitField(confloatAttribute);

    expect(result?.ok).toBe(true);
    if (result?.ok) {
      expect(result.bounds).toEqual({ ge: 0.5 });
    }
  });
});
