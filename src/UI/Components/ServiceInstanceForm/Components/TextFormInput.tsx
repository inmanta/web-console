import React, { useEffect } from "react";
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Popover,
  TextArea,
  TextInput,
  TextInputTypes,
} from "@patternfly/react-core";
import { HelpIcon } from "@patternfly/react-icons";
import { SuggestionsPopover } from "./SuggestionsPopover";

interface Props {
  attributeName: string;
  attributeValue: string;
  description?: string | null;
  isOptional: boolean;
  type: TextInputTypes;
  typeHint?: string;
  placeholder?: string;
  shouldBeDisabled?: boolean;
  isTextarea?: boolean;
  handleInputChange: (value, event) => void;
  suggestions?: string[] | null;
}

/**
 * A form input component for text-based input fields.
 *
 * @component
 * @param {Props} props - The props for the TextListFormInput component.
 *  @prop {string} attributeName - The name of the attribute.
 *  @prop {string} attributeValue - The value of the attribute.
 *  @prop {string | null} description - The description of the attribute.
 *  @prop {boolean} isOptional - Whether the attribute is optional.
 *  @prop {boolean} shouldBeDisabled - Whether the attribute should be disabled. Default is false.
 *  @prop {string} typeHint - The type hint for the attribute.
 *  @prop {string} typeHint - The type hint for the attribute.
 *  @prop {string} placeholder - The placeholder for the input field.
 *  @prop {function} handleInputChange - The callback for handling input changes.
 *  @prop {string[]} suggestions - The suggestions for the input field.
 */
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
  suggestions = [],
  ...props
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(attributeValue);

  /**
   * Handles the input change.
   *
   * @param {string} value - The new value of the input field.
   *
   * @returns {void}
   */
  const handleChange = (value) => {
    setInputValue(value);
  };

  useEffect(() => {
    if (attributeValue !== inputValue) {
      handleInputChange(inputValue, null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attributeValue, inputValue]);

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
              className="pf-v5-c-form__group-label-help"
            >
              <HelpIcon />
            </button>
          </Popover>
        ) : (
          <></>
        )
      }
    >
      {isTextarea ? (
        <TextArea
          value={inputValue || ""}
          onChange={(_event, value) => handleChange(value)}
          id={attributeName}
          name={attributeName}
          placeholder={placeholder}
          isRequired={!isOptional}
          isDisabled={shouldBeDisabled}
          aria-describedby={`${attributeName}-helper`}
          aria-label={`TextareaInput-${attributeName}`}
        />
      ) : (
        <>
          <TextInput
            ref={inputRef}
            isRequired={!isOptional}
            type={type}
            id={attributeName}
            name={attributeName}
            placeholder={placeholder}
            aria-describedby={`${attributeName}-helper`}
            aria-label={`TextInput-${attributeName}`}
            value={inputValue}
            onChange={(_event, value) => handleChange(value)}
            isDisabled={shouldBeDisabled}
            onFocus={() => setIsOpen(true)}
          />
          {suggestions && suggestions.length > 0 && (
            <SuggestionsPopover
              suggestions={suggestions}
              filter={inputRef.current?.value || ""}
              handleSuggestionClick={(suggestion) => {
                if (inputRef.current) {
                  handleChange(suggestion);
                }
              }}
              ref={inputRef}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
            />
          )}
        </>
      )}
      <FormHelperText>
        <HelperText>
          <HelperTextItem>{description}</HelperTextItem>
        </HelperText>
      </FormHelperText>
    </FormGroup>
  );
};
