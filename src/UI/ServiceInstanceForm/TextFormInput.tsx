import { FormGroup, TextInput, TextInputTypes } from "@patternfly/react-core";
import React from "react";

interface Props {
  attributeName: string;
  attributeValue: string;
  description?: string;
  isOptional: boolean;
  type: TextInputTypes;
  handleInputChange: (value, event) => void;
}
export const TextFormInput: React.FC<Props> = ({
  attributeName,
  attributeValue,
  description,
  isOptional,
  type,
  handleInputChange,
}) => {
  return (
    <FormGroup
      isRequired={!isOptional}
      fieldId={attributeName}
      label={attributeName}
      helperText={description}
    >
      <TextInput
        isRequired={!isOptional}
        type={type}
        id={attributeName}
        name={attributeName}
        aria-describedby={`${attributeName}-helper`}
        value={attributeValue}
        onChange={handleInputChange}
      />
    </FormGroup>
  );
};
