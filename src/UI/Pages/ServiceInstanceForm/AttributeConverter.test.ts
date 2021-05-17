import { TextInputTypes } from "@patternfly/react-core";
import { AttributeConverter } from "./AttributeConverter";

describe("AttributeConverter", () => {
  const attributeConverter = new AttributeConverter();
  describe("Extracts updated values correctly", () => {
    it("With a single difference", () => {
      const originalAttributes = { name: "inmanta", bool_param: false };
      const afterChanges = { name: "inmanta", bool_param: true };
      const diff = attributeConverter.calculateDiff(
        afterChanges,
        originalAttributes
      );
      expect(diff).toEqual({ bool_param: true });
    });
    it("With no difference", () => {
      const originalAttributes = { name: "inmanta", bool_param: true };
      const afterChanges = { name: "inmanta", bool_param: true };
      const diff = attributeConverter.calculateDiff(
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
      const diff = attributeConverter.calculateDiff(
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
      const diff = attributeConverter.calculateDiff(
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
      const diff = attributeConverter.calculateDiff(
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
      const diff = attributeConverter.calculateDiff(
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
      const diff = attributeConverter.calculateDiff(
        afterChanges,
        originalAttributes
      );
      expect(diff).toEqual({ name: "inmanta2", another_attribute: null });
    });
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
          attributeConverter.getInputType({
            name: "name",
            type: inmantaType,
            description: "name",
            modifier: "rw+",
            default_value_set: false,
          })
        ).toEqual(inputType);
      }
    );
    it("For a url attribute chooses url input", () => {
      expect(
        attributeConverter.getInputType({
          name: "base_url",
          type: "string",
          description: "name",
          modifier: "rw+",
          default_value_set: false,
        })
      ).toEqual(TextInputTypes.url);
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
          attributeConverter.getFormDefaultValue(
            inputType,
            defaultValueSet,
            defaultValue
          )
        ).toEqual(expectedDefaultValue);
      }
    );
  });

  describe("Converts attributes to proper types ", () => {
    it.each`
      value               | type          | parsedValue
      ${"5"}              | ${"number"}   | ${5}
      ${"5oooo"}          | ${"number"}   | ${NaN}
      ${'{"key": "val"}'} | ${"dict"}     | ${{ key: "val" }}
      ${'{"key: "val"}'}  | ${"dict"}     | ${'{"key: "val"}'}
      ${"first, "}        | ${"string[]"} | ${["first", ""]}
      ${""}               | ${"string[]"} | ${[""]}
      ${""}               | ${"int?"}     | ${null}
      ${""}               | ${"int"}      | ${null}
      ${"50"}             | ${"int?"}     | ${50}
      ${""}               | ${"bool?"}    | ${null}
      ${"true"}           | ${"bool?"}    | ${true}
      ${"false"}          | ${"bool?"}    | ${false}
      ${"false"}          | ${"bool"}     | ${false}
      ${"randomValue"}    | ${"bool"}     | ${null}
      ${true}             | ${"bool"}     | ${true}
      ${"1,2"}            | ${"int[]"}    | ${[1, 2]}
      ${"1, 2 ,a"}        | ${"int[]"}    | ${[1, 2, "a"]}
      ${"1.2,3.4"}        | ${"float[]"}  | ${[1.2, 3.4]}
    `(
      "converts $value of type $type to $parsedValue",
      ({ value, type, parsedValue }) => {
        const result = attributeConverter.ensureAttributeType(value, type);
        expect(result).toEqual(parsedValue);
      }
    );
    it("Converts an empty array of attributes to correct types", () => {
      const attributes = [];
      const result = attributeConverter.parseAttributesToCorrectTypes(
        attributes
      );
      expect(result).toEqual({});
    });
    it("Converts a filled array of attributes to correct types", () => {
      const attributes = [
        { name: "attribute1", value: "42", type: "int" },
        { name: "attribute2", value: "hi", type: "string" },
        { name: "attribute3", value: "true", type: "bool?" },
      ];
      const result = attributeConverter.parseAttributesToCorrectTypes(
        attributes
      );
      expect(result).toEqual({
        attribute1: 42,
        attribute2: "hi",
        attribute3: true,
      });
    });
  });
  describe("Chooses the correct attribute set", () => {
    it("When candidate set is null", () => {
      const instance = {
        candidate_attributes: null,
        active_attributes: { attribute1: 1 },
      };
      const result = attributeConverter.getCurrentAttributes(instance);
      expect(result).toEqual(instance.active_attributes);
    });
    it("When active set is null", () => {
      const instance = {
        candidate_attributes: { attribute1: 1 },
        active_attributes: null,
      };
      const result = attributeConverter.getCurrentAttributes(instance);
      expect(result).toEqual(instance.candidate_attributes);
    });
    it("When candidate set is empty", () => {
      const instance = {
        candidate_attributes: {},
        active_attributes: { attribute1: 1 },
      };
      const result = attributeConverter.getCurrentAttributes(instance);
      expect(result).toEqual(instance.active_attributes);
    });
    it("When both active and candidate sets are filled", () => {
      const instance = {
        candidate_attributes: { attribute1: 1 },
        active_attributes: { attribute1: 2 },
      };
      const result = attributeConverter.getCurrentAttributes(instance);
      expect(result).toEqual(instance.candidate_attributes);
    });
  });
});
