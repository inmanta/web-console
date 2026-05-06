import React, { useId, useState } from "react";
import {
  Button,
  Content,
  FormGroup,
  FormGroupLabelHelp,
  InputGroup,
  InputGroupItem,
  Popover,
  TextInput,
} from "@patternfly/react-core";
import { PlusIcon } from "@patternfly/react-icons";
import { words } from "@/UI";

export interface AddableTextInputProps {
  label: string;
  placeholder: string;
  onAdd: (value: string) => void;
  hint?: string;
  onToggleInputMode?: (event: React.MouseEvent<HTMLButtonElement>) => void;
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
 *  @prop {string} hint - Hint displayed on hover of the help label.
 *  @prop {(event) => React.MouseEvent<HTMLButtonElement>} onToggleInputMode
 *  - Callback executed whenever we press on the labelInfo of the FormGroup
 * @returns {React.ReactElement} The rendered addable text input.
 */

export const AddableTextInput: React.FC<AddableTextInputProps> = ({
  label,
  placeholder,
  onAdd,
  hint,
  onToggleInputMode,
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
    <FormGroup
      label={label}
      fieldId={inputId}
      labelHelp={
        hint ? (
          <Popover
            bodyContent={<Content component="p">{hint}</Content>}
            triggerAction="hover"
            position="right"
          >
            <FormGroupLabelHelp aria-label="help" />
          </Popover>
        ) : undefined
      }
      labelInfo={
        onToggleInputMode && (
          <Button variant="link" isInline onClick={onToggleInputMode}>
            {words("resources.filters.resource.agent.textInfoLabel")}
          </Button>
        )
      }
    >
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
          <Button
            variant="control"
            onClick={handleAdd}
            data-testid="add-button"
            aria-label={`${words("resources.filters.filter")}-${label}`}
          >
            <PlusIcon />
          </Button>
        </InputGroupItem>
      </InputGroup>
    </FormGroup>
  );
};
