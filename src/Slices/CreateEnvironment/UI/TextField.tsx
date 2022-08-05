import React from "react";
import { FormGroup, TextInput } from "@patternfly/react-core";

interface Props {
  label: string;
  isRequired?: boolean;
  value: string;
  onChange: (value: string) => void;
}

export const TextField: React.FC<Props> = ({
  label,
  isRequired,
  value,
  onChange,
}) => {
  return (
    <FormGroup fieldId={label} label={label} isRequired={isRequired}>
      <TextInput
        aria-label={`${label}-input`}
        value={value}
        onChange={onChange}
      />
    </FormGroup>
  );
};
