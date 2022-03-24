import { TextInputTypes } from "@patternfly/react-core";
import { cloneDeep, isEmpty, isEqual, merge } from "lodash-es";
import {
  AttributeModel,
  FormAttributeResult,
  InstanceAttributeModel,
  ServiceInstanceModel,
} from "@/Core";
import {
  AttributeInputConverter,
  AttributeResultConverter,
  InputType,
} from "./AttributeConverter";
import { parseNumberWithType } from "./parseNumberWithType";

function isNumberArray(type: string): boolean {
  return (
    ["float", "int"].filter((numberLike) => type.includes(`${numberLike}[]`))
      .length > 0
  );
}

function isNumberType(type: string): boolean {
  return (
    ["float", "int"].filter((numberLike) => type.includes(numberLike)).length >
      0 && !isNumberArray(type)
  );
}

export class AttributeInputConverterImpl implements AttributeInputConverter {
  /**
   * Determines what kind of input should be used for a Service Attribute
   */
  getInputType(attributeModel: AttributeModel): InputType {
    if (attributeModel.type.includes("bool")) return "bool";
    return this.matchTextInputWithPatternflyInput(
      attributeModel.name,
      attributeModel.type
    );
  }

  /**
   * Determines the default value for an attribute, taking into account the form input that will be rendered
   */
  getFormDefaultValue(
    inputType: InputType,
    defaultValueSet: boolean,
    defaultValue: string | null
  ): string | null | undefined {
    if (defaultValueSet && defaultValue !== null) {
      return defaultValue;
    } else if (inputType === "bool") {
      return null;
    } else {
      // Use empty string for the empty state when it's not a boolean, for booleans it's handled differently
      return "";
    }
  }

  private matchTextInputWithPatternflyInput(
    attributeName: string,
    type: string
  ): TextInputTypes {
    if (isNumberType(type)) {
      return TextInputTypes.number;
    }
    const pfInputTypeNames = Object.keys(TextInputTypes);
    for (const inputType of pfInputTypeNames) {
      if (attributeName.includes(inputType)) {
        return TextInputTypes[inputType];
      }
    }
    return TextInputTypes.text;
  }
  /**
   * Updates to an instance should be applied (compared) to the candidate attribute set, if it's not empty,
   * and to the active attribute set otherwise
   */
  getCurrentAttributes(
    instance: Pick<
      ServiceInstanceModel,
      "candidate_attributes" | "active_attributes"
    >
  ): InstanceAttributeModel | null {
    return instance.candidate_attributes &&
      !isEmpty(instance.candidate_attributes)
      ? instance.candidate_attributes
      : instance.active_attributes;
  }
}

export class AttributeResultConverterImpl implements AttributeResultConverter {
  /**
   * Parses a value to the expected inmanta type. Validation errors are handled by the backend for now
   * @param value The value of an attribute
   * @param type The expected inmanta type
   */
  ensureAttributeType(
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */
    value: any,
    type: string
  ): unknown {
    let parsedValue = value;
    try {
      if (type.includes("bool")) {
        parsedValue = toOptionalBoolean(value);
      } else if (type.includes("?") && value === "") {
        parsedValue = null;
      } else if ((isNumberType(type) || isNumberArray(type)) && value === "") {
        parsedValue = null;
      } else if (isNumberArray(type)) {
        const parts = value.split(",").map((piece) => {
          const trimmed = piece.trim();
          const converted = Number(trimmed);
          if (Number.isFinite(converted)) {
            return converted;
          }
          return trimmed;
        });
        parsedValue = parts;
      } else if (isNumberType(type)) {
        parsedValue = parseNumberWithType(type, value);
      } else if (type.includes("[]")) {
        const parts = value.split(",").map((piece) => piece.trim());
        parsedValue = parts;
      } else if (type.includes("dict")) {
        parsedValue = JSON.parse(value);
      }
    } catch (error) {
      // Let the backend validate for now
      parsedValue = value;
    }
    return parsedValue;
  }

  /**
   * Creates a type-correct object from the attribute list, that can be used for communication with the backend
   * @param attributes The results from a form
   */
  parseAttributesToCorrectTypes(
    attributes: FormAttributeResult[]
  ): InstanceAttributeModel {
    const attributesTypeCorrect = Object.assign(
      {},
      ...attributes.map((attribute) => {
        return {
          [attribute.name]: this.ensureAttributeType(
            attribute.value,
            attribute.type
          ),
        };
      })
    );
    return attributesTypeCorrect;
  }

  /**
   * Calculates the difference between the current attributes of an instance versus the updates (from a form)
   * This is required because in the PATCH update instance method, only the changed attributes should be sent
   * @param attributesAfterChanges The attributes with the changes
   * @param originalAttributes The attributes to compare to
   */
  calculateDiff(
    attributesAfterChanges: InstanceAttributeModel,
    originalAttributes: InstanceAttributeModel | null
  ): InstanceAttributeModel {
    if (!originalAttributes) {
      return attributesAfterChanges;
    }
    // Make sure that we include values of nested embedded entities when checking the difference if only a part of them has changed
    // Otherwise a partial update might not be valid or might remove previously set nested attributes
    const richDiff = cloneDeep(originalAttributes);
    merge(richDiff, attributesAfterChanges);
    // Don't include changes from undefined to null, but allow setting a value explicitly to null
    const changedAttributeNames = Object.keys(richDiff).filter(
      (attributeName) =>
        !(
          originalAttributes[attributeName] === undefined &&
          richDiff[attributeName] === null
        ) &&
        !isEqual(richDiff[attributeName], originalAttributes[attributeName])
    );
    const updatedAttributes = {};
    for (const attribute of changedAttributeNames) {
      updatedAttributes[attribute] = richDiff[attribute];
    }
    return updatedAttributes;
  }
}

export function toOptionalBoolean(
  value?: string | null | boolean
): boolean | null {
  if (typeof value === "boolean") {
    return value;
  }
  if (value?.toLocaleLowerCase() === "true") {
    return true;
  } else if (value?.toLocaleLowerCase() === "false") {
    return false;
  } else {
    return null;
  }
}
