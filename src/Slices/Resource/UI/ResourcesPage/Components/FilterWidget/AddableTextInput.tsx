import React, { useId, useState } from "react";
import { Button, FormGroup, InputGroup, InputGroupItem, TextInput } from "@patternfly/react-core";

/**
 * @interface AddableTextInputProps
 * @desc Props for AddableTextInput.
 * @property {string} label - Label shown above the input field.
 * @property {string} placeholder - Placeholder text displayed within the input.
 * @property {(value: string) => void} onAdd - Callback executed with the trimmed value when the add action is triggered.
 * @property {string} [buttonLabel] - Optional custom text for the add button (defaults to "+").
 */
export interface AddableTextInputProps {
    label: string;
    placeholder: string;
    onAdd: (value: string) => void;
    buttonLabel?: string;
}

/**
 * @component AddableTextInput
 * @desc Provides a text input paired with a control button to append values to a filter category.
 * @param {AddableTextInputProps} props - Component props.
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

