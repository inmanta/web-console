import { IAttributeModel } from "@app/Models/LsmModels";
import { TextInputTypes, FormGroup, Checkbox, TextInput } from "@patternfly/react-core";
import React from "react";

const InstanceFormInput: React.FunctionComponent<{ attributeModels: IAttributeModel[], attributeName: string, attributes, handleInputChange: (value, event) => void }> = props => {

  const { attributeModels, attributeName, attributes, handleInputChange } = props;

  const attributeWithMatchingName = attributeModels.find(({ name }) => name === attributeName);
  if (attributeWithMatchingName) {
    const description = getDescription(attributeModels, attributeName);
    if (attributeWithMatchingName.type === "bool") {
      return (
        <FormGroup fieldId={attributeWithMatchingName.name} key={attributeName}>
          <Checkbox id={attributeWithMatchingName.name} label={description} isChecked={!!attributes[attributeName]} onChange={handleInputChange} />
        </FormGroup>);
    } else {
      return <FormGroup
        label={attributeName}
        fieldId={attributeName}
        helperText={attributeName === description ? '' : description}
        key={attributeName}
      >
        <TextInput
          type={matchTextInputWithPatternflyInput(attributeName)}
          id={attributeName}
          name={attributeName}
          aria-describedby={`${attributeName}-helper`}
          value={attributes[attributeName]}
          onChange={handleInputChange}
        />
      </FormGroup>;
    }
  }
  return <div key={attributeName} />;
}

function getDescription(attributes: IAttributeModel[], name: string): string {
  const attributeWithMatchingName = attributes.find((attribute) => attribute.name === name);
  if (attributeWithMatchingName && attributeWithMatchingName.description) {
    return attributeWithMatchingName.description;
  }
  return name;
}

function matchTextInputWithPatternflyInput(attributeName: string) {
  const pfInputTypeNames = Object.keys(TextInputTypes);
  for (const inputType of pfInputTypeNames) {
    if (attributeName.includes(inputType)) {
      return TextInputTypes[inputType];
    }
  }
  return TextInputTypes.text;
}

export { InstanceFormInput };