import React, { useState } from "react";
import { FormGroup, Select, SelectOption } from "@patternfly/react-core";
import { words } from "@/UI/words";

interface Option {
  displayName: string;
  value: string;
  alreadySelected?: boolean;
}

interface Props {
  options: Option[];
  serviceEntity: string;
  attributeName: string;
  attributeValue: string;
  description?: string;
  isOptional: boolean;
  handleInputChange: (value, event) => void;
  onSearchTextChanged: (value: string) => void;
}
export const AutoCompleteInput: React.FC<Props> = ({
  options,
  serviceEntity,
  attributeName,
  attributeValue,
  description,
  isOptional,
  handleInputChange,
  onSearchTextChanged,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const onSelect = (event, value) => {
    setIsOpen(false);
    handleInputChange(value, event);
  };

  const selectOptions = options
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
    .map(({ displayName, value, alreadySelected }) => (
      <SelectOption key={value} value={value} isDisabled={alreadySelected}>
        {displayName}
      </SelectOption>
    ));

  return (
    <FormGroup
      {...props}
      isRequired={!isOptional}
      fieldId={attributeName}
      label={`An instance of ${serviceEntity}`}
      helperText={description}
    >
      <Select
        aria-label={`${attributeName}-select-input`}
        toggleAriaLabel={`${attributeName}-select-toggle`}
        variant="typeahead"
        onFilter={() => selectOptions}
        onToggle={() => {
          setIsOpen(!isOpen);
        }}
        isOpen={isOpen}
        onSelect={onSelect}
        selections={attributeValue === "" ? undefined : attributeValue}
        placeholderText={words("common.serviceInstance.relation")}
        onTypeaheadInputChanged={onSearchTextChanged}
      >
        {selectOptions}
      </Select>
    </FormGroup>
  );
};
