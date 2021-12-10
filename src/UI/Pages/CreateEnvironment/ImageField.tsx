import React from "react";
import { FormGroup } from "@patternfly/react-core";
import { ImageUpload } from "@/UI/Components";

interface Props {
  label: string;
  isRequired?: boolean;
  value: string;
  onChange: (value: string) => void;
}

export const ImageField: React.FC<Props> = ({
  label,
  isRequired,
  value,
  onChange,
}) => {
  return (
    <FormGroup fieldId={label} label={label} isRequired={isRequired}>
      <ImageUpload onComplete={onChange} initial={value} />
    </FormGroup>
  );
};
