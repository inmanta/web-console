/**
 * A form input component for managing a list of text values.
 */
import React, { useEffect } from "react";
import {
  Button,
  Chip,
  ChipGroup,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Popover,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  TextInputTypes,
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
  description?: string;
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
 * @component
 * @param {Props} props - The props for the TextListFormInput component.
 *  @prop {string} attributeName - The name of the attribute.
 *  @prop {string[]} attributeValue - The value of the attribute.
 *  @prop {string} description - The description of the attribute.
 *  @prop {boolean} isOptional - Whether the attribute is optional.
 *  @prop {boolean} shouldBeDisabled - Whether the attribute should be disabled. Default is false.
 *  @prop {string} typeHint - The type hint for the attribute.
 *  @prop {string} typeHint - The type hint for the attribute.
 *  @prop {string} placeholder - The placeholder for the input field.
 *  @prop {function} handleInputChange - The callback for handling input changes.
 *  @prop {string[]} suggestions - The suggestions for the input field.
 *
 *  @returns {JSX.Element} The TextListFormInput component.
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
          <ChipGroup>
            {currentChips.map((currentChip) => (
              <Chip
                key={currentChip}
                onClick={() => deleteChip(currentChip)}
                disabled={shouldBeDisabled}
              >
                {currentChip}
              </Chip>
            ))}
          </ChipGroup>
        </TextInputGroupMain>
        <TextInputGroupUtilities>
          <Button
            variant="plain"
            onClick={addChip}
            isDisabled={shouldBeDisabled}
          >
            {words("catalog.callbacks.add")}
          </Button>
          <Button
            variant="plain"
            onClick={clearChipsAndInput}
            aria-label="Clear button and input"
            isDisabled={shouldBeDisabled}
          >
            <TimesIcon />
          </Button>
        </TextInputGroupUtilities>
      </TextInputGroup>
    </FormGroup>
  );
};
