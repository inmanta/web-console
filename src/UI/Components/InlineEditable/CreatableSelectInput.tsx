import React, { useEffect, useState } from "react";
import { FormGroup } from "@patternfly/react-core";
import { UseMutationResult } from "@tanstack/react-query";
import {
  CreateProjectParams,
  CreateProjectResponse,
} from "@/Data/Managers/V2/Project/CreateProject";
import { SingleTextSelect } from "../SingleTextSelect";
import { InlinePlainAlert } from "./InlinePlainAlert";

interface Props {
  label: string;
  value: string;
  options: string[];
  isRequired?: boolean;
  withLabel?: boolean;
  mutation: UseMutationResult<CreateProjectResponse, Error, CreateProjectParams>;
  onSelect: (value: string) => void;
}

/**
 * CreatableSelectInput component
 *
 * @props {Props} props - The component props
 * @prop {string} label - The label for the input
 * @prop {string} value - The value of the input
 * @prop {string[]} options - The options for the input
 * @prop {boolean} isRequired - Whether the input is required
 * @prop {boolean} withLabel - Whether to show the label
 * @prop {UseMutationResult<CreateProjectResponse, Error, CreateProjectParams>} mutation - The mutation for the input
 * @prop {(value: string) => void} onSelect - The function to call when the input is selected
 */
export const CreatableSelectInput: React.FC<Props> = ({
  label,
  value,
  options,
  isRequired,
  withLabel,
  mutation,
  onSelect,
}) => {
  const [submitError, setSubmitError] = useState("");
  const onCreateOption = (newValue: string) => {
    mutation.mutate({ name: newValue });
  };
  const onCloseAlert = () => setSubmitError("");

  useEffect(() => {
    if (mutation.isError) {
      setSubmitError(mutation.error.message);
      onSelect("");
    }
    if (mutation.isSuccess) {
      const response = mutation.data;
      onSelect(response.data.name);
    }
  }, [mutation.isError, mutation.isSuccess, mutation.data, mutation.error]);

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
