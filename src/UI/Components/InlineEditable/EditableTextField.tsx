import React from "react";
import { TextInput } from "@patternfly/react-core";
import {
  EditableField,
  EditViewComponent,
  FieldProps,
  StaticViewComponent,
} from "./EditableField";
import { InlineValue } from "./InlineFillers";

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
    EditView={EditView}
    StaticView={StaticView}
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
  <InlineValue {...props}>{value}</InlineValue>
);
