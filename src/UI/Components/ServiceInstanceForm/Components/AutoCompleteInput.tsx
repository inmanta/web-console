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

interface Option {
  displayName: string;
  value: string;
  alreadySelected?: boolean;
}

interface Props {
  options: Option[];
  selected: string | string[] | null;
  serviceEntity: string;
  attributeName: string;
  description?: string;
  isOptional: boolean;
  shouldBeDisabled?: boolean;
  handleInputChange: (value) => void;
  onSearchTextChanged: (value: string) => void;
  multi?: boolean;
}
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
    return { value: option.value, children: option.displayName };
  });

  return (
    <FormGroup
      {...props}
      isRequired={!isOptional}
      fieldId={attributeName}
      label={`An instance of ${serviceEntity}`}
      aria-label={`${attributeName}-select-input`}
    >
      {multi ? (
        <MultiTextSelect
          options={initialOptions}
          toggleAriaLabel={`${attributeName}-select-toggle`}
          isDisabled={shouldBeDisabled}
          setSelected={handleInputChange}
          selected={selected as string[]}
          placeholderText={words("common.serviceInstance.relation")}
          onSearchTextChanged={onSearchTextChanged}
        />
      ) : (
        <SingleTextSelect
          options={initialOptions}
          toggleAriaLabel={`${attributeName}-select-toggle`}
          isDisabled={shouldBeDisabled}
          setSelected={handleInputChange}
          selected={selected as string | null}
          placeholderText={words("common.serviceInstance.relation")}
          onSearchTextChanged={onSearchTextChanged}
        />
      )}
      <FormHelperText>
        <HelperText>
          <HelperTextItem>{description}</HelperTextItem>
        </HelperText>
      </FormHelperText>
    </FormGroup>
  );
};
