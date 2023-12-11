import React, { useState } from "react";
import { FormGroup } from "@patternfly/react-core";
import { Either } from "@/Core";
import { SingleTextSelect } from "../SingleTextSelect";
import { InlinePlainAlert } from "./InlinePlainAlert";

interface Props {
  label: string;
  value: string;
  options: string[];
  isRequired?: boolean;
  withLabel?: boolean;
  onCreate: (name: string) => Promise<Either.Type<string, unknown>>;
  onSelect: (value: string) => void;
}

export const CreatableSelectInput: React.FC<Props> = ({
  label,
  value,
  options,
  isRequired,
  withLabel,
  onCreate,
  onSelect,
}) => {
  const [submitError, setSubmitError] = useState("");
  const onCreateOption = async (newValue: string) => {
    const result = await onCreate(newValue);
    if (Either.isLeft(result)) {
      setSubmitError(result.value);
      onSelect("");
    } else {
      onSelect(newValue);
    }
  };
  const onCloseAlert = () => setSubmitError("");

  const errorView = submitError && (
    <InlinePlainAlert
      aria-label={`${label}-error-message`}
      errorMessage={submitError}
      closeButtonAriaLabel={`${label}-close-error`}
      onCloseAlert={onCloseAlert}
    />
  );

  const inputView = (
    <SingleTextSelect
      toggleAriaLabel={`${label}-select-toggle`}
      selected={value}
      setSelected={onSelect}
      hasCreation
      onCreate={onCreateOption}
      options={options.map((option) => {
        return {
          value: option,
          children: option,
          isSelected: option === value,
        };
      })}
    />
  );

  const fieldView = withLabel ? (
    <FormGroup fieldId={label} label={label} isRequired={isRequired}>
      {inputView}
    </FormGroup>
  ) : (
    inputView
  );

  return (
    <>
      {errorView}
      {fieldView}
    </>
  );
};
