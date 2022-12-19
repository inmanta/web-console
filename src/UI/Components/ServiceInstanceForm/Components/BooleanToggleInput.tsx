import React from "react";
import { FormGroup, Switch } from "@patternfly/react-core";

interface Props {
  isChecked: boolean | undefined;
  attributeName: string;
  description?: string;
  handleInputChange: (value, event) => void;
}

export const BooleanToggleInput: React.FC<Props> = ({
  isChecked,
  attributeName,
  description,
  handleInputChange,
  ...props
}) => {
  return (
    <FormGroup
      {...props}
      fieldId={attributeName}
      key={attributeName}
      label={attributeName}
      helperText={description}
      isRequired={true}
    >
      <Switch
        isChecked={isChecked}
        onChange={handleInputChange}
        aria-label={`Toggle-${attributeName}`}
      />
    </FormGroup>
  );
};
