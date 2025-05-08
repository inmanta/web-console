import React from "react";
import { UseMutationResult } from "@tanstack/react-query";
import {
  CreateProjectParams,
  CreateProjectResponse,
} from "@/Data/Managers/V2/Project/CreateProject";
import { CreatableSelectInput } from "./CreatableSelectInput";
import { EditableField, FieldProps, StaticViewComponent } from "./EditableField";
import { InlineValue } from "./InlineFillers";

interface Props extends FieldProps {
  options: string[];
  onCreate: UseMutationResult<CreateProjectResponse, Error, CreateProjectParams>;
}

/**
 * EditableSelectField component
 *
 * @props {Props} props - The component props
 * @prop {string[]} options - The options to choose from
 * @prop {Function} onCreate - The function to call when the option is created
 * @prop {boolean} isRequired - Whether the field is required
 * @prop {string} label - The label of the field
 * @prop {string} initialValue - The initial value of the field
 * @prop {boolean} initiallyEditable - Whether the field is initially editable
 * @prop {Function} onSubmit - The function to call when the form is submitted
 *
 * @returns {React.FC<Props>} - The EditableSelectField component
 */
export const EditableSelectField: React.FC<Props> = ({
  isRequired,
  label,
  initialValue,
  options,
  initiallyEditable,
  onCreate,
  onSubmit,
  error,
  setError,
}) => {
  return (
    <EditableField
      isRequired={isRequired}
      initiallyEditable={initiallyEditable}
      label={label}
      initialValue={initialValue}
      onSubmit={onSubmit}
      EditView={({ value, onChange, label }) => (
        <CreatableSelectInput
          value={value}
          label={label}
          options={options}
          onCreate={onCreate}
          onSelect={onChange}
        />
      )}
      StaticView={StaticView}
      error={error}
      setError={setError}
    />
  );
};

const StaticView: StaticViewComponent = ({ value, ...props }) => (
  <InlineValue role="textbox" {...props}>
    {value}
  </InlineValue>
);
