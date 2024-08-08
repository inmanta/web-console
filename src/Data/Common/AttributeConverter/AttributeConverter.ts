import { TextInputTypes } from "@patternfly/react-core";
import {
  AttributeModel,
  FormAttributeResult,
  InstanceAttributeModel,
  ServiceInstanceModel,
} from "@/Core";

export type InputType = TextInputTypes | "bool";

export interface AttributeInputConverter {
  /**
   * Determines what kind of input should be used for a Service Attribute
   */
  getInputType(attributeModel: AttributeModel): InputType;

  /**
   * Determines the default value for an attribute, taking into account the form input that will be rendered
   */
  getFormDefaultValue(
    inputType: InputType,
    defaultValueSet: boolean,
    defaultValue:
      | string
      | null
      | boolean
      | string[]
      | { [x: string]: string | null | boolean | string[] },
  ):
    | string
    | null
    | boolean
    | string[]
    | { [x: string]: string | null | boolean | string[] }
    | undefined;

  /**
   * Updates to an instance should be applied (compared) to the candidate attribute set, if it's not empty,
   * and to the active attribute set otherwise
   */
  getCurrentAttributes(
    instance: Pick<
      ServiceInstanceModel,
      "candidate_attributes" | "active_attributes"
    >,
  ): InstanceAttributeModel | null;
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
    type: string,
  ): unknown;

  /**
   * Creates a type-correct object from the attribute list, that can be used for communication with the backend
   * @param attributes The results from a form
   */
  parseAttributesToCorrectTypes(
    attributes: FormAttributeResult[],
  ): InstanceAttributeModel;

  /**
   * Calculates the difference between the current attributes of an instance versus the updates (from a form)
   * This is required because in the PATCH update instance method, only the changed attributes should be sent
   * @param attributesAfterChanges The attributes with the changes
   * @param originalAttributes The attributes to compare to
   */
  calculateDiff(
    attributesAfterChanges: InstanceAttributeModel,
    originalAttributes: InstanceAttributeModel | null,
  ): InstanceAttributeModel;
}
