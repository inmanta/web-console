import React from "react";
import { FormGroup, Radio } from "@patternfly/react-core";
import { words } from "@/UI/words";

interface Props {
  isChecked: boolean | null;
  isOptional: boolean;
  attributeName: string;
  description?: string;
  handleInputChange: (value, event) => void;
}

export const BooleanFormInput: React.FC<Props> = ({
  isChecked,
  isOptional,
  attributeName,
  description,
  handleInputChange,
  ...props
}) => {
  return (
    <>
      <FormGroup
        {...props}
        fieldId={attributeName}
        key={attributeName}
        label={attributeName}
        helperText={description}
        isRequired={!isOptional}
      >
        <Radio
          isChecked={isChecked === true}
          onChange={handleInputChange}
          label={words("true")}
          name={`${attributeName}`}
          id={`${attributeName}-true`}
          data-testid={`${attributeName}-true`}
          value={"true"}
        />
        <Radio
          isChecked={isChecked === false}
          onChange={(event) => handleInputChange(false, event)}
          label={words("false")}
          name={`${attributeName}`}
          id={`${attributeName}-false`}
          value={"false"}
        />
        {isOptional && (
          <Radio
            isChecked={isChecked === null}
            onChange={handleInputChange}
            label={words("null")}
            name={`${attributeName}`}
            id={`${attributeName}-none`}
            value={""}
          />
        )}
      </FormGroup>
    </>
  );
};
