import React from "react";
import { FormGroup, TextArea } from "@patternfly/react-core";

interface Props {
  label: string;
  isRequired?: boolean;
  value: string;
  onChange: (value: string) => void;
}

export const TextAreaField: React.FC<Props> = ({
  label,
  isRequired,
  value,
  onChange,
}) => {
  const helperText = `Characters: (${value.length} / 255)`;

  return (
    <FormGroup
      fieldId={label}
      label={label}
      isRequired={isRequired}
      helperText={helperText}
    >
      <TextArea
        value={value}
        onChange={onChange}
        aria-label={`${label}-input`}
        maxLength={255}
        rows={2}
      />
    </FormGroup>
  );
};
