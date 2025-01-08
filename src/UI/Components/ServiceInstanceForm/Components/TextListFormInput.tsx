/**
 * A form input component for managing a list of text values.
 */
import React, { useEffect } from "react";
import {
  Label,
  LabelGroup,
  Button,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Popover,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  TextInputTypes,
  Truncate,
} from "@patternfly/react-core";

import { HelpIcon, TimesIcon } from "@patternfly/react-icons";
import { words } from "@/UI/words";
import { SuggestionsPopover } from "./SuggestionsPopover";

/**
 * Props for the TextListFormInput component.
 */
interface Props {
  attributeName: string;
  attributeValue: string[];
  description?: string | null;
  isOptional: boolean;
  shouldBeDisabled?: boolean;
  type: TextInputTypes;
  typeHint?: string;
  placeholder?: string;
  handleInputChange: (
    value: string[],
    event: React.FormEvent<HTMLInputElement> | null,
  ) => void;
  suggestions?: string[] | null;
}

/**
 * A form input component for managing a list of text values.
 *
 * @props {Props} props - The props for the TextListFormInput component.
 *  @prop {string} attributeName - The name of the attribute.
 *  @prop {string[]} attributeValue - The value of the attribute.
 *  @prop {string | null} description - The description of the attribute.
 *  @prop {boolean} isOptional - Whether the attribute is optional.
 *  @prop {boolean} shouldBeDisabled - Whether the attribute should be disabled. Default is false.
 *  @prop {string} typeHint - The type hint for the attribute.
 *  @prop {string} typeHint - The type hint for the attribute.
 *  @prop {string} placeholder - The placeholder for the input field.
 *  @prop {function} handleInputChange - The callback for handling input changes.
 *  @prop {string[]} suggestions - The suggestions for the input field.
 *
 *  @returns {React.FC<Props>} The TextListFormInput component.
 */
export const TextListFormInput: React.FC<Props> = ({
  attributeName,
  attributeValue,
  description,
  isOptional,
  shouldBeDisabled = false,
  typeHint,
  placeholder,
  handleInputChange,
  suggestions = [],
  ...props
}) => {
  const [inputValue, setInputValue] = React.useState("");
  const [currentChips, setCurrentChips] = React.useState<string[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  /**
   * Callback for removing a chip from the chip selections.
   * @param chipToDelete - The chip to be removed.
   */
  const deleteChip = (chipToDelete: string) => {
    const newChips = currentChips.filter(
      (chip) => !Object.is(chip, chipToDelete),
    );

    setCurrentChips(newChips);
    handleInputChange(newChips, null);
  };

  /**
   * Handles the change event of the input element.
   * @param _event - The form event.
   * @param value - The new value of the input element.
   *
   * @returns {void}
   */
  const handleChangeInput = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string,
  ) => {
    setInputValue(value);
  };

  /**
   * Adds a new chip to the chip selections.
   *
   * @returns {void}
   */
  const addChip = () => {
    if (inputValue) {
      currentChips.push(inputValue);
      setCurrentChips(currentChips);
      handleInputChange(currentChips, null);
      setInputValue("");
    }
  };

  /**
   * Callback for clearing all selected chips and the text input.
   */
  const clearChipsAndInput = () => {
    setCurrentChips([]);
    handleInputChange([], null);
    setInputValue("");
  };

  useEffect(() => {
    if (attributeValue && attributeValue.length) {
      setCurrentChips(attributeValue);
    }
  }, [attributeValue]);

  return (
    <FormGroup
      {...props}
      isRequired={!isOptional}
      fieldId={attributeName}
      label={attributeName}
      className={shouldBeDisabled ? "is-disabled" : ""}
      labelHelp={
        typeHint ? (
          <Popover bodyContent={<div>{typeHint}</div>}>
            <Button
              variant="control"
              type="button"
              icon={<HelpIcon />}
              aria-label={`More info for ${attributeName} field`}
              onClick={(e) => e.preventDefault()}
            />
          </Popover>
        ) : (
          <></>
        )
      }
    >
      <FormHelperText>
        <HelperText>
          <HelperTextItem>{description}</HelperTextItem>
        </HelperText>
      </FormHelperText>
      <TextInputGroup isDisabled={shouldBeDisabled}>
        {suggestions && suggestions.length > 0 && (
          <SuggestionsPopover
            suggestions={suggestions}
            filter={inputValue}
            handleSuggestionClick={(suggestion) => {
              setInputValue(suggestion);
            }}
            ref={inputRef}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
          />
        )}
        <TextInputGroupMain
          ref={inputRef}
          value={inputValue}
          placeholder={placeholder}
          onChange={handleChangeInput}
          onFocus={() => setIsOpen(true)}
        >
          <LabelGroup>
            {currentChips.map((currentChip) => (
              <Label
                variant="outline"
                key={currentChip}
                onClose={() => deleteChip(currentChip)}
                disabled={shouldBeDisabled}
                aria-label={`Close ${currentChip}`}
              >
                <Truncate content={currentChip} />
              </Label>
            ))}
          </LabelGroup>
        </TextInputGroupMain>
        <TextInputGroupUtilities>
          <Button
            icon={words("catalog.callbacks.add")}
            variant="plain"
            onClick={addChip}
            isDisabled={shouldBeDisabled}
          />
          <Button
            icon={<TimesIcon />}
            variant="plain"
            onClick={clearChipsAndInput}
            aria-label="Clear button and input"
            isDisabled={shouldBeDisabled}
          />
        </TextInputGroupUtilities>
      </TextInputGroup>
    </FormGroup>
  );
};
