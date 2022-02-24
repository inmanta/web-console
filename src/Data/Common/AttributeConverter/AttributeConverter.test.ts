import { TextInputTypes } from "@patternfly/react-core";
import {
  AttributeInputConverterImpl,
  AttributeResultConverterImpl,
} from "./AttributeConverterImpl";

describe("AttributeResultConverter ", () => {
  const attributeResultConverter = new AttributeResultConverterImpl();
  describe("Extracts updated values correctly", () => {
    it("With a single difference", () => {
      const originalAttributes = { name: "inmanta", bool_param: false };
      const afterChanges = { name: "inmanta", bool_param: true };
      const diff = attributeResultConverter.calculateDiff(
        afterChanges,
        originalAttributes
      );
      expect(diff).toEqual({ bool_param: true });
    });
    it("With no difference", () => {
      const originalAttributes = { name: "inmanta", bool_param: true };
      const afterChanges = { name: "inmanta", bool_param: true };
      const diff = attributeResultConverter.calculateDiff(
        afterChanges,
        originalAttributes
      );
      expect(diff).toEqual({});
    });
    it("With multiple differences", () => {
      const originalAttributes = {
        name: "inmanta",
        bool_param: true,
        another_attribute: "same",
      };
      const afterChanges = {
        name: "inmanta2",
        bool_param: false,
        another_attribute: "same",
      };
      const diff = attributeResultConverter.calculateDiff(
        afterChanges,
        originalAttributes
      );
      expect(diff).toEqual({ name: "inmanta2", bool_param: false });
    });
    it("With no original values to compare to", () => {
      const originalAttributes = {};
      const afterChanges = {
        name: "inmanta2",
        bool_param: false,
        another_attribute: "same",
      };
      const diff = attributeResultConverter.calculateDiff(
        afterChanges,
        originalAttributes
      );
      expect(diff).toEqual(afterChanges);
    });
    it("With no original value set to compare to", () => {
      const originalAttributes = null;
      const afterChanges = {
        name: "inmanta2",
        bool_param: false,
        another_attribute: "same",
      };
      const diff = attributeResultConverter.calculateDiff(
        afterChanges,
        originalAttributes
      );
      expect(diff).toEqual(afterChanges);
    });
    it("Changing from undefined to null", () => {
      const originalAttributes = { name: "inmanta", bool_param: true };
      const afterChanges = {
        name: "inmanta",
        bool_param: false,
        another_attribute: null,
      };
      const diff = attributeResultConverter.calculateDiff(
        afterChanges,
        originalAttributes
      );
      expect(diff).toEqual({ bool_param: false });
    });
    it("Changing from another value to null", () => {
      const originalAttributes = {
        name: "inmanta",
        bool_param: true,
        another_attribute: "same",
      };
      const afterChanges = {
        name: "inmanta2",
        bool_param: true,
        another_attribute: null,
      };
      const diff = attributeResultConverter.calculateDiff(
        afterChanges,
        originalAttributes
      );
      expect(diff).toEqual({ name: "inmanta2", another_attribute: null });
    });
    it("Changing values of embedded entities", () => {
      const originalAttributes = {
        name: "inmanta",
        embedded: [{ a: 1, unchanged: "same" }],
      };
      const afterChanges = {
        name: "inmanta2",
        embedded: [{ a: 2 }, { a: { c: "d" } }],
      };
      const diff = attributeResultConverter.calculateDiff(
        afterChanges,
        originalAttributes
      );
      expect(diff).toEqual({
        name: "inmanta2",
        embedded: [{ a: 2, unchanged: "same" }, { a: { c: "d" } }],
      });
    });
    it("Having embedded entities but only changing the values of the first level attributes", () => {
      const originalAttributes = {
        name: "inmanta",
        embedded: [{ a: 1, unchanged: "same" }],
      };
      const afterChanges = {
        name: "inmanta2",
        embedded: [{ a: 1, unchanged: "same" }],
      };
      const diff = attributeResultConverter.calculateDiff(
        afterChanges,
        originalAttributes
      );
      expect(diff).toEqual({ name: "inmanta2" });
    });
  });

  describe("Converts attributes to proper types ", () => {
    it.each`
      value                    | type          | parsedValue
      ${"5"}                   | ${"int"}      | ${5}
      ${"5oooo"}               | ${"int"}      | ${"5oooo"}
      ${"9223372036854775807"} | ${"int"}      | ${9223372036854775807n}
      ${"9223372036854775807"} | ${"float"}    | ${9223372036854775807n}
      ${'{"key": "val"}'}      | ${"dict"}     | ${{ key: "val" }}
      ${'{"key: "val"}'}       | ${"dict"}     | ${'{"key: "val"}'}
      ${"first, "}             | ${"string[]"} | ${["first", ""]}
      ${""}                    | ${"string[]"} | ${[""]}
      ${""}                    | ${"int?"}     | ${null}
      ${""}                    | ${"int"}      | ${null}
      ${"50"}                  | ${"int?"}     | ${50}
      ${""}                    | ${"bool?"}    | ${null}
      ${"true"}                | ${"bool?"}    | ${true}
      ${"false"}               | ${"bool?"}    | ${false}
      ${"false"}               | ${"bool"}     | ${false}
      ${"randomValue"}         | ${"bool"}     | ${null}
      ${true}                  | ${"bool"}     | ${true}
      ${"1,2"}                 | ${"int[]"}    | ${[1, 2]}
      ${"1, 2 ,a"}             | ${"int[]"}    | ${[1, 2, "a"]}
      ${"1.2,3.4"}             | ${"float[]"}  | ${[1.2, 3.4]}
    `(
      "converts $value of type $type to $parsedValue",
      ({ value, type, parsedValue }) => {
        const result = attributeResultConverter.ensureAttributeType(
          value,
          type
        );
        expect(result).toEqual(parsedValue);
      }
    );
    it("Converts an empty array of attributes to correct types", () => {
      const attributes = [];
      const result =
        attributeResultConverter.parseAttributesToCorrectTypes(attributes);
      expect(result).toEqual({});
    });
    it("Converts a filled array of attributes to correct types", () => {
      const attributes = [
        { name: "attribute1", value: "42", type: "int" },
        { name: "attribute2", value: "hi", type: "string" },
        { name: "attribute3", value: "true", type: "bool?" },
      ];
      const result =
        attributeResultConverter.parseAttributesToCorrectTypes(attributes);
      expect(result).toEqual({
        attribute1: 42,
        attribute2: "hi",
        attribute3: true,
      });
    });
  });
});

describe("AttributeInputConverter", () => {
  const attributeInputConverter = new AttributeInputConverterImpl();
  describe("Chooses the correct attribute set", () => {
    it("When candidate set is null", () => {
      const instance = {
        candidate_attributes: null,
        active_attributes: { attribute1: 1 },
      };
      const result = attributeInputConverter.getCurrentAttributes(instance);
      expect(result).toEqual(instance.active_attributes);
    });
    it("When active set is null", () => {
      const instance = {
        candidate_attributes: { attribute1: 1 },
        active_attributes: null,
      };
      const result = attributeInputConverter.getCurrentAttributes(instance);
      expect(result).toEqual(instance.candidate_attributes);
    });
    it("When candidate set is empty", () => {
      const instance = {
        candidate_attributes: {},
        active_attributes: { attribute1: 1 },
      };
      const result = attributeInputConverter.getCurrentAttributes(instance);
      expect(result).toEqual(instance.active_attributes);
    });
    it("When both active and candidate sets are filled", () => {
      const instance = {
        candidate_attributes: { attribute1: 1 },
        active_attributes: { attribute1: 2 },
      };
      const result = attributeInputConverter.getCurrentAttributes(instance);
      expect(result).toEqual(instance.candidate_attributes);
    });
  });

  describe("Sets default value correctly", () => {
    it.each`
      defaultValueSet | defaultValue | inputType                | expectedDefaultValue
      ${true}         | ${true}      | ${"bool"}                | ${true}
      ${true}         | ${null}      | ${"bool"}                | ${null}
      ${false}        | ${true}      | ${"bool"}                | ${null}
      ${true}         | ${0}         | ${TextInputTypes.number} | ${0}
      ${false}        | ${0}         | ${TextInputTypes.number} | ${""}
      ${true}         | ${"string"}  | ${TextInputTypes.text}   | ${"string"}
      ${true}         | ${null}      | ${TextInputTypes.text}   | ${""}
    `(
      "if default value is set ($defaultValueSet) to $defaultValue, inputType is $inputType sets defaultValue to $expectedDefaultValue",
      ({ defaultValueSet, defaultValue, inputType, expectedDefaultValue }) => {
        expect(
          attributeInputConverter.getFormDefaultValue(
            inputType,
            defaultValueSet,
            defaultValue
          )
        ).toEqual(expectedDefaultValue);
      }
    );
  });
  describe("Determines correct input type ", () => {
    it.each`
      inmantaType  | inputType
      ${"bool"}    | ${"bool"}
      ${"bool?"}   | ${"bool"}
      ${"int"}     | ${TextInputTypes.number}
      ${"int?"}    | ${TextInputTypes.number}
      ${"float?"}  | ${TextInputTypes.number}
      ${"conint"}  | ${TextInputTypes.number}
      ${"conint?"} | ${TextInputTypes.number}
      ${"string"}  | ${TextInputTypes.text}
      ${"int[]"}   | ${TextInputTypes.text}
      ${"float[]"} | ${TextInputTypes.text}
    `(
      "For $inmantaType inmantaType chooses $inputType input",
      ({ inmantaType, inputType }) => {
        expect(
          attributeInputConverter.getInputType({
            name: "name",
            type: inmantaType,
            description: "name",
            modifier: "rw+",
            default_value_set: false,
            default_value: null,
          })
        ).toEqual(inputType);
      }
    );
    it("For a url attribute chooses url input", () => {
      expect(
        attributeInputConverter.getInputType({
          name: "base_url",
          type: "string",
          description: "name",
          modifier: "rw+",
          default_value_set: false,
          default_value: null,
        })
      ).toEqual(TextInputTypes.url);
    });
  });
});
