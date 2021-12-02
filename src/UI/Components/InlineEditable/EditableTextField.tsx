import React from "react";
import { TextInput } from "@patternfly/react-core";
import { EditableField, FieldProps, InputComponent } from "./EditableField";

export const EditableTextField: React.FC<FieldProps> = ({
  isRequired,
  label,
  initialValue,
  initiallyEditable,
  onSubmit,
}) => (
  <EditableField
    isRequired={isRequired}
    initiallyEditable={initiallyEditable}
    label={label}
    initialValue={initialValue}
    onSubmit={onSubmit}
    Input={Input}
  />
);

const Input: InputComponent = ({ value, onChange, onSubmit, label }) => (
  <TextInput
    aria-label={`${label}-input`}
    value={value}
    onChange={onChange}
    onKeyDown={(event) => {
      if (event.key && event.key !== "Enter") return;
      onSubmit();
    }}
  />
);
