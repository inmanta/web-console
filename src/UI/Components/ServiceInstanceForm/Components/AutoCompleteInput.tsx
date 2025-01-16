import React from "react";
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
} from "@patternfly/react-core";
import { words } from "@/UI/words";
import { MultiTextSelect } from "../../MultiTextSelect";
import { SingleTextSelect } from "../../SingleTextSelect";

/**
 * The option interface, based on the expected format for PF-select elements.
 */
interface Option {
  displayName: string;
  value: string;
  isSelected?: boolean;
}

interface Props {
  options: Option[];
  selected: string | string[] | null;
  serviceEntity: string;
  attributeName: string;
  description?: string | null;
  isOptional: boolean;
  shouldBeDisabled?: boolean;
  handleInputChange: (value) => void;
  onSearchTextChanged?: (value: string) => void;
  multi?: boolean;
}

/**
 * Component that renders an autocomplete input.
 *
 * @param props - The props of the component.
 *  @prop {Option[]} options - The options to be displayed in the autocomplete.
 *  @prop {string | string[] | null} selected - The selected value.
 *  @prop {string} serviceEntity - The entity that the autocomplete is related to.
 *  @prop {string} attributeName - The name of the attribute.
 *  @prop {string | null} description - The description of the attribute.
 *  @prop {boolean} isOptional - Whether the attribute is optional.
 *  @prop {boolean} shouldBeDisabled - Whether the input should be disabled.
 *  @prop {(value): void} handleInputChange - The function to be called when the input changes.
 *  @prop {(value: string): void} onSearchTextChanged - The function to be called when the search text changes.
 *  @prop {boolean} multi - Whether the input should allow multiple selections.
 *
 * @returns The rendered component.
 */
export const AutoCompleteInput: React.FC<Props> = ({
  options,
  selected,
  serviceEntity,
  attributeName,
  description,
  isOptional,
  shouldBeDisabled = false,
  handleInputChange,
  onSearchTextChanged,
  multi,
  ...props
}) => {
  const initialOptions = options.map((option) => {
    return {
      value: option.value,
      children: option.displayName,
      isSelected: option.isSelected,
    };
  });

  return (
    <FormGroup
      {...props}
      isRequired={!isOptional}
      fieldId={attributeName}
      label={attributeName}
      aria-label={`${attributeName}-select-input`}
    >
      <FormHelperText>
        <HelperText>
          <HelperTextItem>{description}</HelperTextItem>
        </HelperText>
      </FormHelperText>
      {multi ? (
        <MultiTextSelect
          options={initialOptions}
          toggleAriaLabel={`${attributeName}-select-toggle`}
          isDisabled={shouldBeDisabled}
          setSelected={handleInputChange}
          selected={selected as string[]}
          placeholderText={words("common.serviceInstance.relations")(
            serviceEntity,
          )}
          onSearchTextChanged={onSearchTextChanged}
          hasChips
        />
      ) : (
        <SingleTextSelect
          options={initialOptions}
          toggleAriaLabel={`${attributeName}-select-toggle`}
          isDisabled={shouldBeDisabled}
          setSelected={handleInputChange}
          selected={selected as string | null}
          placeholderText={words("common.serviceInstance.relation")(
            serviceEntity,
          )}
          onSearchTextChanged={onSearchTextChanged}
        />
      )}
    </FormGroup>
  );
};
