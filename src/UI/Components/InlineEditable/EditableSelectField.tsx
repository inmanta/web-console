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
  mutation: UseMutationResult<CreateProjectResponse, Error, CreateProjectParams>;
}

export const EditableSelectField: React.FC<Props> = ({
  isRequired,
  label,
  initialValue,
  options,
  initiallyEditable,
  mutation,
  onSubmit,
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
          mutation={mutation}
          onSelect={onChange}
        />
      )}
      StaticView={StaticView}
    />
  );
};

const StaticView: StaticViewComponent = ({ value, ...props }) => (
  <InlineValue {...props}>{value}</InlineValue>
);
