import React, { useEffect, useRef, useState } from "react";
import {
  Button,
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
import { SuggestionValue } from "@/Core";
import { SuggestionsPopover } from "./SuggestionsPopover";
import { resolveLabel, resolveValue } from "./suggestionResolvers";

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
  suggestions?: SuggestionValue[] | null;
}

/**
 * A text/textarea form input. With suggestions it behaves as a typeahead: the
 * field shows a suggestion's `label` but submits its `value`, free typing still
 * works, and a stored value is mapped back to its label on load.
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const hasSuggestions = !!(suggestions && suggestions.length > 0);
  const editedRef = useRef(false);
  const [displayValue, setDisplayValue] = useState<string>(() =>
    resolveLabel(suggestions, attributeValue)
  );

  const handleType = (text: string) => {
    editedRef.current = true;
    setDisplayValue(text);

    if (!hasSuggestions && type === "number") {
      // Plain number field: convert the input to a number (empty -> null) right here.
      handleInputChange(text === "" ? null : Number(text), null);
    } else {
      // Suggestion fields submit a string; sanitizeAttributes applies the
      // attribute's real (e.g. numeric) type at submit.
      handleInputChange(resolveValue(suggestions, text), null);
    }
  };

  // Selecting a suggestion shows its label and submits its value.
  const handleSelect = (value: string) => {
    editedRef.current = true;
    setDisplayValue(resolveLabel(suggestions, value));
    handleInputChange(value, null);
  };

  // Leaving the field is its "commit" point: resolve the value to its label,
  // Plain (non-suggestion) fields are left alone so their typed text isn't normalized.
  const handleBlur = () => {
    editedRef.current = false;
    if (!hasSuggestions) {
      return;
    }
    setDisplayValue(resolveLabel(suggestions, attributeValue));
  };

  useEffect(() => {
    // Show the label for the controlled value: on mount, on an edit round-trip,
    // and once async suggestions arrive. Skipped while the user is editing
    // (editedRef) so what they type is never overwritten by a resolved label.
    if (!editedRef.current) {
      setDisplayValue(resolveLabel(suggestions, attributeValue));
    }
  }, [attributeValue, suggestions]);

  return (
    <FormGroup
      {...props}
      isRequired={!isOptional}
      fieldId={attributeName}
      label={attributeName}
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
      {isTextarea ? (
        <TextArea
          value={displayValue || ""}
          onChange={(_event, value) => handleType(value)}
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
            // Rendered as text so a non-numeric label coupled to a numeric
            // value can show (e.g. "10 Gbps" + 10000).
            type={hasSuggestions ? TextInputTypes.text : type}
            id={attributeName}
            name={attributeName}
            placeholder={placeholder}
            aria-describedby={`${attributeName}-helper`}
            aria-label={`TextInput-${attributeName}`}
            value={displayValue}
            onChange={(_event, value) => handleType(value)}
            isDisabled={shouldBeDisabled}
            onFocus={() => hasSuggestions && setIsOpen(true)}
            onBlur={handleBlur}
          />
          {hasSuggestions && (
            <SuggestionsPopover
              suggestions={suggestions}
              filter={displayValue}
              handleSuggestionClick={handleSelect}
              ref={inputRef}
              isOpen={isOpen}
              close={() => setIsOpen(false)}
            />
          )}
        </>
      )}
    </FormGroup>
  );
};
