import React, { useState } from "react";
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
} from "@patternfly/react-core";
import {
  Select,
  SelectOption,
  SelectVariant,
} from "@patternfly/react-core/deprecated";
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
  attributeValue: string | string[];
  description?: string;
  isOptional: boolean;
  shouldBeDisabled?: boolean;
  handleInputChange: (value, event) => void;
  onSearchTextChanged: (value: string) => void;
  multi?: boolean;
}
export const AutoCompleteInput: React.FC<Props> = ({
  options,
  serviceEntity,
  attributeName,
  attributeValue,
  description,
  isOptional,
  shouldBeDisabled = false,
  handleInputChange,
  onSearchTextChanged,
  multi,
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
    >
      <Select
        aria-label={`${attributeName}-select-input`}
        toggleAriaLabel={`${attributeName}-select-toggle`}
        variant={multi ? SelectVariant.typeaheadMulti : SelectVariant.typeahead}
        onFilter={() => selectOptions}
        onToggle={() => {
          setIsOpen(!isOpen);
        }}
        isOpen={isOpen}
        isDisabled={shouldBeDisabled}
        onSelect={onSelect}
        selections={attributeValue}
        placeholderText={words("common.serviceInstance.relation")}
        onTypeaheadInputChanged={onSearchTextChanged}
      >
        {selectOptions}
      </Select>
      <FormHelperText>
        <HelperText>
          <HelperTextItem>{description}</HelperTextItem>
        </HelperText>
      </FormHelperText>
    </FormGroup>
  );
};
