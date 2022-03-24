import React, { useState } from "react";
import { FormGroup, Select, SelectOption } from "@patternfly/react-core";
import { Either } from "@/Core";
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
  const [isOpen, setIsOpen] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const onSelectOption = (event, selection) => {
    setIsOpen(false);
    onSelect(selection);
  };
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
    <Select
      aria-label={`${label}-select-input`}
      toggleAriaLabel={`${label}-select-toggle`}
      typeAheadAriaLabel={`${label}-typeahead`}
      variant="typeahead"
      onToggle={() => {
        setIsOpen(!isOpen);
      }}
      isOpen={isOpen}
      onSelect={onSelectOption}
      selections={value}
      isCreatable
      onCreateOption={onCreateOption}
    >
      {options.map((option) => (
        <SelectOption key={option} value={option} />
      ))}
    </Select>
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
