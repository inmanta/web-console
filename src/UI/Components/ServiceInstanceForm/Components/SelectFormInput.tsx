import React from "react";
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
} from "@patternfly/react-core";
import { ParsedNumber } from "@/Core";
import { words } from "@/UI/words";
import { SingleTextSelect } from "../../SingleTextSelect";

interface Props {
  options: Record<string, string | ParsedNumber>;
  attributeName: string;
  attributeValue: string;
  description?: string;
  isOptional: boolean;
  shouldBeDisabled?: boolean;
  handleInputChange: (value) => void;
}
export const SelectFormInput: React.FC<Props> = ({
  options,
  attributeName,
  attributeValue,
  description,
  isOptional,
  shouldBeDisabled = false,
  handleInputChange,
  ...props
}) => {
  const selectOptions = Object.keys(options).sort();
  const formattedOptions = selectOptions.map((option) => {
    return {
      value: option,
      children: option,
      isSelected: selectOptions.length === 1 || option === attributeValue,
    };
  });

  return (
    <FormGroup
      {...props}
      isRequired={!isOptional}
      fieldId={attributeName}
      label={attributeName}
    >
      <FormHelperText>
        <HelperText>
          <HelperTextItem>{description}</HelperTextItem>
        </HelperText>
      </FormHelperText>
      <SingleTextSelect
        options={formattedOptions}
        toggleAriaLabel={`${attributeName}-select`}
        setSelected={handleInputChange}
        selected={
          selectOptions.length === 1 ? selectOptions[0] : attributeValue
        }
        isDisabled={shouldBeDisabled}
        placeholderText={words("common.serviceInstance.select")(attributeName)}
      />
    </FormGroup>
  );
};
