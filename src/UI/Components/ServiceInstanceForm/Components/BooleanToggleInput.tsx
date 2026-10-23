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
  description?: string | null;
  handleInputChange: (value, event) => void;
  shouldBeDisabled?: boolean;
  validationError?: string;
}

export const BooleanToggleInput: React.FC<Props> = ({
  isChecked,
  attributeName,
  description,
  handleInputChange,
  shouldBeDisabled = false,
  validationError,
  ...props
}) => {
  return (
    <FormGroup {...props} fieldId={attributeName} key={attributeName} label={attributeName}>
      <FormHelperText>
        <HelperText>
          <HelperTextItem>{description}</HelperTextItem>
        </HelperText>
      </FormHelperText>
      <Switch
        isChecked={isChecked}
        onChange={(event, value) => handleInputChange(value, event)}
        aria-label={`Toggle-${attributeName}`}
        isDisabled={shouldBeDisabled}
      />
      {validationError && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem variant="error">{validationError}</HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </FormGroup>
  );
};
