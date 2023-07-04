import React from "react";
import {
  FormGroup,
  Popover,
  TextArea,
  TextInput,
  TextInputTypes,
} from "@patternfly/react-core";
import { HelpIcon } from "@patternfly/react-icons";

interface Props {
  attributeName: string;
  attributeValue: string;
  description?: string;
  isOptional: boolean;
  type: TextInputTypes;
  typeHint?: string;
  placeholder?: string;
  shouldBeDisabled?: boolean;
  isTextarea?: boolean;
  handleInputChange: (value, event) => void;
}
export const TextFormInput: React.FC<Props> = ({
  attributeName,
  attributeValue,
  description,
  isOptional,
  type,
  typeHint,
  placeholder,
  handleInputChange,
  isTextarea = false,
  shouldBeDisabled = false,
  ...props
}) => {
  return (
    <FormGroup
      {...props}
      isRequired={!isOptional}
      fieldId={attributeName}
      label={attributeName}
      labelIcon={
        typeHint ? (
          <Popover bodyContent={<div>{typeHint}</div>}>
            <button
              type="button"
              aria-label={`More info for ${attributeName} field`}
              onClick={(e) => e.preventDefault()}
              className="pf-c-form__group-label-help"
            >
              <HelpIcon noVerticalAlign />
            </button>
          </Popover>
        ) : (
          <></>
        )
      }
      helperText={description}
    >
      {isTextarea ? (
        <TextArea
          value={attributeValue || ""}
          onChange={handleInputChange}
          id={attributeName}
          name={attributeName}
          placeholder={placeholder}
          isRequired={!isOptional}
          isDisabled={shouldBeDisabled}
          aria-describedby={`${attributeName}-helper`}
          aria-label={`TextareaInput-${attributeName}`}
        />
      ) : (
        <TextInput
          isRequired={!isOptional}
          type={type}
          id={attributeName}
          name={attributeName}
          placeholder={placeholder}
          aria-describedby={`${attributeName}-helper`}
          aria-label={`TextInput-${attributeName}`}
          value={attributeValue || ""}
          onChange={handleInputChange}
          isDisabled={shouldBeDisabled}
        />
      )}
    </FormGroup>
  );
};
