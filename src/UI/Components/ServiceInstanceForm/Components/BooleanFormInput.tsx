import React from "react";
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Radio,
} from "@patternfly/react-core";
import { words } from "@/UI/words";

interface Props {
  isChecked: boolean | null;
  isOptional: boolean;
  attributeName: string;
  description?: string;
  handleInputChange: (value, event) => void;
  shouldBeDisabled?: boolean;
}

export const BooleanFormInput: React.FC<Props> = ({
  isChecked,
  isOptional,
  attributeName,
  description,
  handleInputChange,
  shouldBeDisabled = false,
  ...props
}) => {
  return (
    <>
      <FormGroup
        {...props}
        fieldId={attributeName}
        key={attributeName}
        label={attributeName}
        isRequired={!isOptional}
      >
        <FormHelperText>
          <HelperText>
            <HelperTextItem>{description}</HelperTextItem>
          </HelperText>
        </FormHelperText>
        <Radio
          isDisabled={shouldBeDisabled}
          isChecked={isChecked === true}
          onChange={handleInputChange}
          label={words("true")}
          name={`${attributeName}`}
          id={`${attributeName}-true`}
          data-testid={`${attributeName}-true`}
          value={"true"}
        />
        <Radio
          isDisabled={shouldBeDisabled}
          isChecked={isChecked === false}
          onChange={(event) => handleInputChange(false, event)}
          label={words("false")}
          name={`${attributeName}`}
          id={`${attributeName}-false`}
          data-testid={`${attributeName}-false`}
          value={"false"}
        />
        {isOptional && (
          <Radio
            isDisabled={shouldBeDisabled}
            isChecked={isChecked === null}
            onChange={handleInputChange}
            label={words("null")}
            name={`${attributeName}`}
            id={`${attributeName}-none`}
            data-testid={`${attributeName}-none`}
            value={""}
          />
        )}
      </FormGroup>
    </>
  );
};
