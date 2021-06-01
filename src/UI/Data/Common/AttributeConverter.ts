import {
  AttributeModel,
  FormAttributeResult,
  InstanceAttributeModel,
} from "@/Core";
import { TextInputTypes } from "@patternfly/react-core";

export interface AttributeInputConverter {
  /**
   * Determines what kind of input should be used for a Service Attribute
   */
  getInputType(attributeModel: AttributeModel): TextInputTypes | "bool";

  /**
   * Determines the default value for an attribute, taking into account the form input that will be rendered
   */
  getFormDefaultValue(
    inputType: TextInputTypes | "bool",
    defaultValueSet: boolean,
    defaultValue: string | null
  ): string | null | undefined;
}

export interface AttributeResultConverter {
  /**
   * Parses a value to the expected inmanta type. Validation errors are handled by the backend for now
   * @param value The value of an attribute
   * @param type The expected inmanta type
   */
  ensureAttributeType(
    /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */
    value: any,
    type: string
  ): unknown;

  /**
   * Creates a type-correct object from the attribute list, that can be used for communication with the backend
   * @param attributes The results from a form
   */
  parseAttributesToCorrectTypes(
    attributes: FormAttributeResult[]
  ): InstanceAttributeModel;

  /**
   * Calculates the difference between the current attributes of an instance versus the updates (from a form)
   * This is required because in the PATCH update instance method, only the changed attributes should be sent
   * @param attributesAfterChanges The attributes with the changes
   * @param originalAttributes The attributes to compare to
   */
  calculateDiff(
    attributesAfterChanges: InstanceAttributeModel,
    originalAttributes: InstanceAttributeModel | null
  ): InstanceAttributeModel;
}
