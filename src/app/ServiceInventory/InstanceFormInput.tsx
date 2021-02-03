import { AttributeModel } from "@/Core";
import {
  TextInputTypes,
  FormGroup,
  TextInput,
  Radio,
} from "@patternfly/react-core";
import React from "react";

const InstanceFormInput: React.FunctionComponent<{
  attributeModels: AttributeModel[];
  attributeName: string;
  attributes;
  handleInputChange: (value, event) => void;
}> = (props) => {
  const {
    attributeModels,
    attributeName,
    attributes,
    handleInputChange,
  } = props;

  const attributeWithMatchingName = attributeModels.find(
    ({ name }) => name === attributeName
  );
  if (attributeWithMatchingName) {
    const description = getDescription(attributeModels, attributeName);
    if (attributeWithMatchingName.type.toLowerCase().includes("bool")) {
      return (
        <FormGroup
          fieldId={attributeWithMatchingName.name}
          key={attributeName}
          label={attributeName}
        >
          {description}
          <Radio
            isChecked={attributes[attributeName] === true}
            onChange={handleInputChange}
            label="True"
            name={`${attributeWithMatchingName.name}`}
            id={`${attributeWithMatchingName.name}-true`}
            data-testid={`${attributeWithMatchingName.name}-true`}
            value={"true"}
          />
          <Radio
            isChecked={attributes[attributeName] === false}
            onChange={handleInputChange}
            label="False"
            name={`${attributeWithMatchingName.name}`}
            id={`${attributeWithMatchingName.name}-false`}
            value={"false"}
          />
          {attributeWithMatchingName.type.toLowerCase().includes("?") && (
            <Radio
              isChecked={
                attributes[attributeName] === undefined ||
                attributes[attributeName] === null ||
                attributes[attributeName] === ""
              }
              onChange={handleInputChange}
              label="Null"
              name={`${attributeWithMatchingName.name}`}
              id={`${attributeWithMatchingName.name}-none`}
              value={""}
            />
          )}
        </FormGroup>
      );
    } else {
      return (
        <FormGroup
          label={attributeName}
          fieldId={attributeName}
          helperText={attributeName === description ? "" : description}
          key={attributeName}
        >
          <TextInput
            type={matchTextInputWithPatternflyInput(
              attributeName,
              attributeWithMatchingName.type
            )}
            id={attributeName}
            name={attributeName}
            aria-describedby={`${attributeName}-helper`}
            value={attributes[attributeName]}
            onChange={handleInputChange}
          />
        </FormGroup>
      );
    }
  }
  return <div key={attributeName} />;
};

function getDescription(attributes: AttributeModel[], name: string): string {
  const attributeWithMatchingName = attributes.find(
    (attribute) => attribute.name === name
  );
  if (attributeWithMatchingName && attributeWithMatchingName.description) {
    return attributeWithMatchingName.description;
  }
  return name;
}

function matchTextInputWithPatternflyInput(
  attributeName: string,
  type: string
) {
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

function isNumberType(type: string): boolean {
  return (
    ["double", "float", "int", "integer", "number"].filter((numberLike) =>
      type.includes(numberLike)
    ).length > 0
  );
}

export { InstanceFormInput, isNumberType };
