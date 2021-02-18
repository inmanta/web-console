import {
  AttributeModel,
  InstanceAttributeModel,
  ServiceInstanceModel,
} from "@/Core";
import { TextInputTypes } from "@patternfly/react-core";
import _ from "lodash";
import { FormAttributeResult } from "./ServiceInstanceForm";

export class AttributeConverter {
  getInputType(attributeModel: AttributeModel): TextInputTypes | "bool" {
    return attributeModel.type.includes("bool")
      ? "bool"
      : this.matchTextInputWithPatternflyInput(
          attributeModel.name,
          attributeModel.type
        );
  }

  getFormDefaultValue(
    inputType: TextInputTypes | "bool",
    defaultValueSet: boolean,
    defaultValue?: string
  ): string | null | undefined {
    if (defaultValueSet && defaultValue !== null) {
      return defaultValue;
    } else if (inputType === "bool") {
      return null;
    } else {
      return "";
    }
  }

  private matchTextInputWithPatternflyInput(
    attributeName: string,
    type: string
  ): TextInputTypes {
    if (this.isNumberType(type)) {
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

  isNumberType(type: string): boolean {
    return (
      ["double", "float", "int", "integer", "number"].filter((numberLike) =>
        type.includes(numberLike)
      ).length > 0
    );
  }

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
      } else if (this.isNumberType(type) && value === "") {
        parsedValue = null;
      } else if (this.isNumberType(type)) {
        parsedValue = Number(value);
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

  getCurrentAttributes(
    instance: Pick<
      ServiceInstanceModel,
      "candidate_attributes" | "active_attributes"
    >
  ): InstanceAttributeModel | null {
    return instance.candidate_attributes &&
      !_.isEmpty(instance.candidate_attributes)
      ? instance.candidate_attributes
      : instance.active_attributes;
  }

  calculateDiff(
    attributesAfterChanges: InstanceAttributeModel,
    originalAttributes: InstanceAttributeModel | null
  ): InstanceAttributeModel {
    if (!originalAttributes) {
      return attributesAfterChanges;
    }
    // Don't include changes from undefined to null, but allow setting a value explicitly to null
    const changedAttributeNames = Object.keys(attributesAfterChanges).filter(
      (attributeName) =>
        !(
          originalAttributes[attributeName] === undefined &&
          attributesAfterChanges[attributeName] === null
        ) &&
        !_.isEqual(
          attributesAfterChanges[attributeName],
          originalAttributes[attributeName]
        )
    );
    const updatedAttributes = {};
    for (const attribute of changedAttributeNames) {
      updatedAttributes[attribute] = attributesAfterChanges[attribute];
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
