import React from "react";
import { TextInput } from "@patternfly/react-core";
import { EditableField, EditViewComponent, FieldProps, StaticViewComponent } from "./EditableField";
import { InlineValue } from "./InlineFillers";

/**
 * EditableTextField component
 *
 * @props {FieldProps} props - The component props
 * @prop {boolean} isRequired - Whether the field is required
 * @prop {string} label - The label of the field
 * @prop {string} initialValue - The initial value of the field
 * @prop {boolean} initiallyEditable - Whether the field is initially editable
 * @prop {Function} onSubmit - The function to call when the form is submitted
 * @prop {string | null} error - The error message of the field
 * @prop {Function} setError - The function to call when the error message is set
 *
 * @returns {React.FC<FieldProps>} - The EditableTextField component
 */
export const EditableTextField: React.FC<FieldProps> = ({
  isRequired,
  label,
  initialValue,
  initiallyEditable,
  onSubmit,
  error,
  setError,
}) => (
  <EditableField
    isRequired={isRequired}
    initiallyEditable={initiallyEditable}
    label={label}
    initialValue={initialValue}
    onSubmit={onSubmit}
    EditView={EditView}
    StaticView={StaticView}
    error={error}
    setError={setError}
  />
);

const EditView: EditViewComponent = ({ value, onChange, onSubmit, label }) => (
  <TextInput
    aria-label={`${label}-input`}
    value={value}
    onChange={(_event, value) => onChange(value)}
    onKeyDown={(event) => {
      if (event.key && event.key !== "Enter") return;

      onSubmit();
    }}
  />
);

const StaticView: StaticViewComponent = ({ value, ...props }) => (
  <InlineValue role="textbox" {...props}>
    {value}
  </InlineValue>
);
