import React from "react";
import { Either } from "@/Core";
import { CreatableSelectInput } from "./CreatableSelectInput";
import {
  EditableField,
  FieldProps,
  StaticViewComponent,
} from "./EditableField";
import { InlineValue } from "./InlineFillers";

interface Props extends FieldProps {
  options: string[];
  onCreate: (value: string) => Promise<Either.Type<string, unknown>>;
}

export const EditableSelectField: React.FC<Props> = ({
  isRequired,
  label,
  initialValue,
  options,
  initiallyEditable,
  onCreate,
  onSubmit,
}) => {
  return (
    <EditableField
      isRequired={isRequired}
      initiallyEditable={initiallyEditable}
      label={label}
      initialValue={initialValue}
      onSubmit={onSubmit}
      EditView={({ value, onChange, label }) => (
        <CreatableSelectInput
          value={value}
          label={label}
          options={options}
          onCreate={onCreate}
          onSelect={onChange}
        />
      )}
      StaticView={StaticView}
    />
  );
};

const StaticView: StaticViewComponent = ({ value, ...props }) => (
  <InlineValue {...props}>{value}</InlineValue>
);
