import React, { useEffect, useState } from "react";
import { FormGroup, Select, SelectOption } from "@patternfly/react-core";
import { ParsedNumber } from "@/Core";
import { words } from "@/UI/words";

interface Props {
  options: Record<string, string | ParsedNumber>;
  attributeName: string;
  attributeValue: string;
  description?: string;
  isOptional: boolean;
  shouldBeDisabled?: boolean;
  handleInputChange: (value, event) => void;
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
  const [isOpen, setIsOpen] = useState(false);
  const onSelect = (event, value) => {
    setIsOpen(false);
    handleInputChange(options[value], event);
  };

  const selectOptions = Object.keys(options)
    .sort()
    .map((key) => <SelectOption key={key} value={key} />);

  useEffect(() => {
    const optionsArray = Object.keys(options);
    if (optionsArray.length === 1) {
      handleInputChange(options[optionsArray[0]], null);
    }
  }, [handleInputChange, options]);
  return (
    <FormGroup
      {...props}
      isRequired={!isOptional}
      fieldId={attributeName}
      label={attributeName}
      helperText={description}
    >
      <Select
        aria-label={`${attributeName}-select-input`}
        toggleAriaLabel={`${attributeName}-select-toggle`}
        variant="single"
        onToggle={() => {
          setIsOpen(!isOpen);
        }}
        isOpen={isOpen}
        onSelect={onSelect}
        selections={attributeValue === "" ? undefined : attributeValue}
        placeholderText={words("common.serviceInstance.select")(attributeName)}
        isDisabled={shouldBeDisabled}
      >
        {selectOptions}
      </Select>
    </FormGroup>
  );
};
