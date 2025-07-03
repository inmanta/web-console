import React from "react";
import { HelperText, HelperTextItem, TextArea } from "@patternfly/react-core";
import styled from "styled-components";
import { EditableField, EditViewComponent, FieldProps, StaticViewComponent } from "./EditableField";
import { InlineAreaValue } from "./InlineFillers";

/**
 * EditableTextAreaField component
 *
 * @props {FieldProps} props - The component props
 * @prop {boolean} isRequired - Whether the field is required
 * @prop {string} label - The label of the field
 * @prop {string} initialValue - The initial value of the field
 * @prop {boolean} initiallyEditable - Whether the field is initially editable
 * @prop {Function} onSubmit - The function to call when the form is submitted
 *
 * @returns {React.FC<FieldProps>} - The EditableTextAreaField component
 */
export const EditableTextAreaField: React.FC<FieldProps> = ({
  isRequired,
  label,
  initialValue,
  initiallyEditable,
  onSubmit,
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
    setError={setError}
  />
);

/**
 * EditView component used in the EditableTextAreaField component
 *
 * @props {Props} props - The component props
 * @prop {string} value - The value of the field
 * @prop {Function} onChange - The function to call when the value is changed
 */
const EditView: EditViewComponent = ({ value, onChange, label }) => (
  <>
    <TextArea
      value={value}
      onChange={(_event, value) => onChange(value)}
      aria-label={`${label}-input`}
      maxLength={255}
      rows={2}
    />
    <StyledHelperText>
      <HelperTextItem>Characters: ({value.length} / 255)</HelperTextItem>
    </StyledHelperText>
  </>
);

const StyledHelperText = styled(HelperText)`
  margin-top: 4px;
`;

const StaticView: StaticViewComponent = ({ value, ...props }) => (
  <InlineAreaValue {...props}>{value}</InlineAreaValue>
);
