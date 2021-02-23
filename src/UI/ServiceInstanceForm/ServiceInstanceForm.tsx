import {
  ActionGroup,
  Button,
  Form,
  TextInputTypes,
} from "@patternfly/react-core";
import React, { useState } from "react";
import { words } from "../words";
import { toOptionalBoolean } from "./AttributeConverter";
import { BooleanFormInput } from "./BooleanFormInput";
import { TextFormInput } from "./TextFormInput";

export interface FormInputAttribute {
  name: string;
  description?: string;
  defaultValue: unknown;
  inputType: TextInputTypes | "bool";
  isOptional: boolean;
  type: string;
}

export interface FormAttributeResult {
  name: string;
  value: unknown;
  type: string;
}

interface Props {
  formInputAttributes: FormInputAttribute[];
  onSubmit(attributes: FormAttributeResult[]): void;
  onCancel(): void;
}

export const ServiceInstanceForm: React.FC<Props> = ({
  formInputAttributes,
  onSubmit,
  onCancel,
}) => {
  const initialState = Object.assign(
    {},
    ...formInputAttributes.map((attribute) => ({
      [attribute.name]: attribute.defaultValue,
    }))
  );
  const [formState, setFormState] = useState(initialState);
  const handleInputChange = (value, event) => {
    const target = event.target;
    const name = event.target.name;
    let val;
    if (target.type === "radio") {
      val = toOptionalBoolean(event.target.value);
    } else {
      val = event.target.value;
    }
    setFormState({
      ...formState,
      [name]: val,
    });
  };
  const formStateToAttributeArray = (state): FormAttributeResult[] => {
    return formInputAttributes.map((inputAttribute) => ({
      name: inputAttribute.name,
      type: inputAttribute.type,
      value: state[inputAttribute.name],
    }));
  };
  return (
    <>
      <Form>
        {formInputAttributes.map((attribute) => {
          if (attribute.inputType === "bool") {
            return (
              <BooleanFormInput
                attributeName={attribute.name}
                isOptional={attribute.isOptional}
                isChecked={formState[attribute.name]}
                handleInputChange={handleInputChange}
                description={attribute.description}
                key={attribute.name}
              />
            );
          } else {
            return (
              <TextFormInput
                attributeName={attribute.name}
                attributeValue={formState[attribute.name]}
                description={attribute.description}
                isOptional={attribute.isOptional}
                type={attribute.inputType}
                handleInputChange={handleInputChange}
                key={attribute.name}
              />
            );
          }
        })}

        <ActionGroup>
          <Button
            variant="primary"
            onClick={() => onSubmit(formStateToAttributeArray(formState))}
          >
            {words("confirm")}
          </Button>
          <Button variant="link" onClick={onCancel}>
            {words("cancel")}
          </Button>
        </ActionGroup>
      </Form>
    </>
  );
};
