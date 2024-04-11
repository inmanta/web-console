import React, { useState } from "react";
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from "@patternfly/react-core";
import { ParsedNumber } from "@/Core";
import { words } from "@/UI";

interface Props {
  options: Record<string, string | ParsedNumber>;
  attributeName: string;
  attributeValue: string;
  description?: string;
  isOptional: boolean;
  shouldBeDisabled?: boolean;
  handleInputChange: (value) => void;
}
/**
 * A form input component for managing a select input.
 * @component
 *
 * @param {Props} props - The props for the SelectFormInput component.
 *  @prop {Record<string, string | ParsedNumber>} options - The options for the select input.
 *  @prop {string} attributeName - The name of the attribute.
 *  @prop {string} attributeValue - The value of the attribute.
 *  @prop {string} description - The description of the attribute.
 *  @prop {boolean} isOptional - Whether the attribute is optional.
 *  @prop {boolean} shouldBeDisabled - Whether the attribute should be disabled. Default is false.
 *  @prop {function} handleInputChange - The callback for handling input changes.
 *
 * @returns {JSX.Element} The SelectFormInput component.
 */
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

  const selectOptions = Object.keys(options).sort();
  const formattedOptions = selectOptions.map((option) => {
    return {
      value: options[option],
      children: option,
      isSelected:
        selectOptions.length === 1 || options[option] === attributeValue,
    };
  });

  /**
   * Handles the toggle click event.
   */
  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  /**
   * Handles the select event.
   *
   * @param {React.MouseEvent<Element, MouseEvent> | undefined} _event - The event.
   * @param {string | number | undefined} value - The value.
   *
   * @returns {void}
   */
  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    handleInputChange(value);
    setIsOpen(false);
  };

  /**
   * Creates the toggle element.
   *
   * @param {React.Ref<MenuToggleElement>} toggleRef - The toggle reference.
   *
   * @returns {JSX.Element} The toggle element.
   */
  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      data-testid={`${attributeName}-select-toggle`}
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      isDisabled={shouldBeDisabled}
      style={
        {
          width: "100%",
        } as React.CSSProperties
      }
    >
      {selectOptions.length === 1
        ? selectOptions[0]
        : attributeValue ||
          words("common.serviceInstance.select")(attributeName)}
    </MenuToggle>
  );

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
        id={`${attributeName}-select`}
        isOpen={isOpen}
        selected={
          selectOptions.length === 1 ? selectOptions[0] : attributeValue
        }
        onSelect={onSelect}
        onOpenChange={(isOpen) => setIsOpen(isOpen)}
        toggle={toggle}
        shouldFocusToggleOnSelect
        aria-label={`${attributeName}-select`}
      >
        <SelectList>
          {formattedOptions.map((option, index) => (
            <SelectOption
              key={index}
              value={option.value}
              isSelected={option.isSelected}
            >
              {option.children}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
    </FormGroup>
  );
};
