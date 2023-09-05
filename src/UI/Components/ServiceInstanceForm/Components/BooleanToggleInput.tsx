import React from "react";
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Switch,
} from "@patternfly/react-core";

interface Props {
  isChecked: boolean | undefined;
  attributeName: string;
  description?: string;
  handleInputChange: (value, event) => void;
  shouldBeDisabled?: boolean;
}

export const BooleanToggleInput: React.FC<Props> = ({
  isChecked,
  attributeName,
  description,
  handleInputChange,
  shouldBeDisabled = false,
  ...props
}) => {
  return (
    <FormGroup
      {...props}
      fieldId={attributeName}
      key={attributeName}
      label={attributeName}
      isRequired={true}
    >
      <FormHelperText>
        <HelperText>
          <HelperTextItem>{description}</HelperTextItem>
        </HelperText>
      </FormHelperText>
      <Switch
        isChecked={isChecked}
        onChange={handleInputChange}
        aria-label={`Toggle-${attributeName}`}
        isDisabled={shouldBeDisabled}
      />
    </FormGroup>
  );
};
