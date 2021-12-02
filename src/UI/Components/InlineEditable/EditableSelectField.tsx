import React from "react";
import { Maybe } from "@/Core";
import { CreatableSelectInput } from "./CreatableSelectInput";
import { EditableField, FieldProps } from "./EditableField";

interface Props extends FieldProps {
  options: string[];
  onCreate: (value: string) => Promise<Maybe.Type<string>>;
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
      Input={({ value, onChange, label }) => (
        <CreatableSelectInput
          value={value}
          label={label}
          options={options}
          onCreate={onCreate}
          onSelect={onChange}
        />
      )}
    />
  );
};
