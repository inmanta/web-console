import React, { useEffect, useState } from "react";
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectOption,
} from "@patternfly/react-core";
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

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsOpen((value) => !value)}
      isExpanded={isOpen}
      isDisabled={shouldBeDisabled}
      aria-label={`${attributeName}-select-toggle`}
    >
      {attributeValue === "" ? undefined : attributeValue}
    </MenuToggle>
  );

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
    >
      <FormHelperText>
        <HelperText>
          <HelperTextItem>{description}</HelperTextItem>
        </HelperText>
      </FormHelperText>
      <Select
        aria-label={`${attributeName}-select-input`}
        toggle={toggle}
        isOpen={isOpen}
        onSelect={onSelect}
        selected={attributeValue === "" ? undefined : attributeValue}
        placeholder={words("common.serviceInstance.select")(attributeName)}
      >
        {selectOptions}
      </Select>
    </FormGroup>
  );
};
