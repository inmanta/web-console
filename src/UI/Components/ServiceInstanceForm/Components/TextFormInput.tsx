import React from "react";
import {
  FormGroup,
  Popover,
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
    </FormGroup>
  );
};
