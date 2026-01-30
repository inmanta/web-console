import React, { useId, useState } from "react";
import { Button, FormGroup, InputGroup, InputGroupItem, TextInput } from "@patternfly/react-core";

export interface AddableTextInputProps {
  label: string;
  placeholder: string;
  onAdd: (value: string) => void;
  buttonLabel?: string;
}

/**
 * The AddableTextInput component.
 *
 * Provides a text input paired with a control button to append values to a filter category.
 *
 * @Props {AddableTextInputProps} - Component props.
 *  @prop {string} label - Label shown above the input field.
 *  @prop {string} placeholder - Placeholder text displayed within the input.
 *  @prop {(value: string) => void} onAdd - Callback executed with the trimmed value when the add action is triggered.
 *  @prop {string} [buttonLabel] - Optional custom text for the add button (defaults to "+").
 *
 * @returns {React.ReactElement} The rendered addable text input.
 */
export const AddableTextInput: React.FC<AddableTextInputProps> = ({
  label,
  placeholder,
  onAdd,
  buttonLabel = "+",
}) => {
  const [value, setValue] = useState("");
  const inputId = useId();

  const handleAdd = () => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return;
    }
    onAdd(trimmedValue);
    setValue("");
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAdd();
    }
  };

  return (
    <FormGroup label={label} fieldId={inputId}>
      <InputGroup>
        <InputGroupItem isFill>
          <TextInput
            id={inputId}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(_, nextValue) => setValue(nextValue)}
            onKeyPress={handleKeyPress}
            aria-label={label}
          />
        </InputGroupItem>
        <InputGroupItem>
          <Button variant="control" onClick={handleAdd}>
            {buttonLabel}
          </Button>
        </InputGroupItem>
      </InputGroup>
    </FormGroup>
  );
};
