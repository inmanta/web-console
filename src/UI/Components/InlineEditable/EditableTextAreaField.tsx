import React from "react";
import { HelperText, HelperTextItem, TextArea } from "@patternfly/react-core";
import styled from "styled-components";
import {
  EditableField,
  EditViewComponent,
  FieldProps,
  StaticViewComponent,
} from "./EditableField";
import { InlineAreaValue } from "./InlineFillers";

export const EditableTextAreaField: React.FC<FieldProps> = ({
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
    EditView={EditView}
    StaticView={StaticView}
  />
);

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
