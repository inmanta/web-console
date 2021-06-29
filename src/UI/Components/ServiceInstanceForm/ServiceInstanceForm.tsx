import React, { useState } from "react";
import { ActionGroup, Button, Form } from "@patternfly/react-core";
import { words } from "@/UI/words";
import { FormAttributeResult } from "@/Core";
import { toOptionalBoolean } from "@/Data";
import { BooleanFormInput } from "./BooleanFormInput";
import { TextFormInput } from "./TextFormInput";
import { Field, isFlatField } from "./Field";
import { createEmptyFromFields } from "./FieldCreator";

interface Props {
  fields: Field[];
  onSubmit(attributes: FormAttributeResult[]): void;
  onCancel(): void;
}

export const ServiceInstanceForm: React.FC<Props> = ({
  fields: allFields,
  onSubmit,
  onCancel,
}) => {
  const fields = allFields.filter(isFlatField);
  const initialState = createEmptyFromFields(fields);
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
    return fields.map((inputAttribute) => ({
      name: inputAttribute.name,
      type: inputAttribute.type,
      value: state[inputAttribute.name],
    }));
  };
  const getPlaceholderForType = (typeName: string): string | undefined => {
    if (typeName === "int[]") {
      return words("inventory.form.placeholder.intList");
    } else if (typeName === "float[]") {
      return words("inventory.form.placeholder.floatList");
    } else if (typeName.endsWith("[]")) {
      return words("inventory.form.placeholder.stringList");
    } else if (typeName.includes("dict")) {
      return words("inventory.form.placeholder.dict");
    }
    return undefined;
  };

  const getTypeHintForType = (typeName: string): string | undefined => {
    if (typeName.endsWith("[]")) {
      return words("inventory.form.typeHint.list")(
        typeName.substring(0, typeName.indexOf("["))
      );
    } else if (typeName.includes("dict")) {
      return words("inventory.form.typeHint.dict");
    }
    return undefined;
  };
  return (
    <>
      <Form>
        {fields.map((attribute) => {
          if (attribute.inputType === "bool") {
            return (
              <BooleanFormInput
                attributeName={attribute.name}
                isOptional={attribute.isOptional}
                isChecked={formState[attribute.name] as boolean}
                handleInputChange={handleInputChange}
                description={attribute.description}
                key={attribute.name}
              />
            );
          } else {
            return (
              <TextFormInput
                attributeName={attribute.name}
                attributeValue={formState[attribute.name] as string}
                description={attribute.description}
                isOptional={attribute.isOptional}
                type={attribute.inputType}
                handleInputChange={handleInputChange}
                placeholder={getPlaceholderForType(attribute.type)}
                typeHint={getTypeHintForType(attribute.type)}
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
