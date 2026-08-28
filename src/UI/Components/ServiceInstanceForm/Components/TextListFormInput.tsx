import React, { useEffect, useRef } from "react";
import {
  Label,
  LabelGroup,
  Button,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Popover,
  Spinner,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  TextInputTypes,
  Truncate,
} from "@patternfly/react-core";

import { HelpIcon, TimesIcon } from "@patternfly/react-icons";
import { SuggestionValue } from "@/Core";
import { words } from "@/UI/words";
import { SuggestionsPopover } from "./SuggestionsPopover";
import { resolveLabel, resolveValue } from "./suggestionResolvers";

/**
 * Props for the TextListFormInput component.
 */
interface Props {
  attributeName: string;
  attributeValue: string[];
  description?: string | null;
  shouldBeDisabled?: boolean;
  type: TextInputTypes;
  typeHint?: string;
  placeholder?: string;
  handleInputChange: (value: string[], event: React.FormEvent<HTMLInputElement> | null) => void;
  suggestions?: SuggestionValue[] | null;
  warningMessage?: string | null;
  hint?: string | null;
  loading?: boolean;
}

/**
 * A form input component for managing a list of text values.
 *
 * When suggestions are provided, the field behaves as a typeahead: each chip
 * displays the suggestion's `label` while the stored/submitted value is its
 * `value`. Free typing still works (the typed text is both shown and stored).
 *
 * @props {Props} props - The props for the TextListFormInput component.
 *  @prop {string} attributeName - The name of the attribute.
 *  @prop {string[]} attributeValue - The submitted values of the attribute.
 *  @prop {string | null} description - The description of the attribute.
 *  @prop {boolean} shouldBeDisabled - Whether the attribute should be disabled. Default is false.
 *  @prop {string} typeHint - The type hint for the attribute.
 *  @prop {string} placeholder - The placeholder for the input field.
 *  @prop {function} handleInputChange - The callback for handling input changes.
 *  @prop {SuggestionValue[]} suggestions - The suggestions for the input field; selecting one stores its `value` and displays its `label`.
 *
 *  @returns {React.FC<Props>} The TextListFormInput component.
 */
export const TextListFormInput: React.FC<Props> = ({
  attributeName,
  attributeValue,
  description,
  shouldBeDisabled = false,
  typeHint,
  placeholder,
  handleInputChange,
  suggestions = [],
  warningMessage,
  hint,
  loading = false,
  ...props
}) => {
  const [inputValue, setInputValue] = React.useState("");
  const [currentChips, setCurrentChips] = React.useState<string[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasSuggestions = !!(suggestions && suggestions.length > 0);

  /**
   * Callback for removing a chip from the chip selections.
   * @param chipToDelete - The chip value to be removed.
   */
  const deleteChip = (chipToDelete: string) => {
    const newChips = currentChips.filter((chip) => !Object.is(chip, chipToDelete));

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
  const handleChangeInput = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setInputValue(value);
  };

  /**
   * Adds a new chip. When the input text matches a suggestion label (whether
   * picked from the list or typed), that suggestion's value is stored; otherwise
   * the typed text is stored as-is.
   *
   * @returns {void}
   */
  const addChip = () => {
    const trimmed = inputValue.trim();

    if (!trimmed) {
      return;
    }

    const newChips = [...currentChips, resolveValue(suggestions, trimmed)];

    setCurrentChips(newChips);
    handleInputChange(newChips, null);
    setInputValue("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      // Enter commits the pending text and keeps the field focused so more chips
      // can be added;
      event.preventDefault();
      addChip();
    } else if (event.key === "Tab") {
      // Tab commits any pending text as well, but must NOT preventDefault: doing so
      // trapped keyboard focus on the field and blocked tab navigation to the next
      // input.
      addChip();
    }
  };

  const clearChipsAndInput = () => {
    setCurrentChips([]);
    handleInputChange([], null);
    setInputValue("");
  };

  useEffect(() => {
    // Fully controlled by the stored value: syncing on every change (not only a non-empty one)
    // lets a cascade-cleared source empty the chips instead of leaving stale ones displayed.
    // The stored value can momentarily be a non-array (e.g. a cleared scalar), so guard it.
    setCurrentChips(Array.isArray(attributeValue) ? attributeValue : []);
  }, [attributeValue]);

  return (
    <FormGroup
      {...props}
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
        {hasSuggestions && (
          <SuggestionsPopover
            suggestions={suggestions}
            filter={inputValue}
            handleSuggestionClick={(value) => {
              setInputValue(resolveLabel(suggestions, value));
            }}
            ref={inputRef}
            isOpen={isOpen}
            close={() => setIsOpen(false)}
          />
        )}
        <TextInputGroupMain
          ref={inputRef}
          value={inputValue}
          placeholder={placeholder}
          onChange={handleChangeInput}
          onFocus={() => hasSuggestions && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          // With suggestions this is a custom typeahead, so suppress the browser's own autofill
          // dropdown - it overlaps and competes with the suggestions popover. `inputProps` targets
          // the real <input>; a bare `autoComplete` would land on the wrapping element instead.
          inputProps={hasSuggestions ? { autoComplete: "off" } : undefined}
        >
          <LabelGroup>
            {currentChips.map((currentChip) => (
              <Label
                variant="outline"
                key={currentChip}
                onClose={() => deleteChip(currentChip)}
                disabled={shouldBeDisabled}
                closeBtnAriaLabel={`Close ${resolveLabel(suggestions, currentChip)}`}
              >
                <Truncate content={resolveLabel(suggestions, currentChip)} />
              </Label>
            ))}
          </LabelGroup>
        </TextInputGroupMain>
        <TextInputGroupUtilities>
          {loading && <Spinner isInline aria-label={words("inventory.form.suggestions.loading")} />}
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
      {(warningMessage || hint) && (
        <FormHelperText>
          <HelperText>
            {warningMessage && <HelperTextItem variant="warning">{warningMessage}</HelperTextItem>}
            {hint && <HelperTextItem>{hint}</HelperTextItem>}
          </HelperText>
        </FormHelperText>
      )}
    </FormGroup>
  );
};
