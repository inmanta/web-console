import React, { useState } from "react";
import { ActionGroup, Alert, Button, Form } from "@patternfly/react-core";
import { set } from "lodash-es";
import styled from "styled-components";
import { InstanceAttributeModel, Field } from "@/Core";
import { ActionDisabledTooltip } from "@/UI/Components/ActionDisabledTooltip";
import { words } from "@/UI/words";
import { FieldInput } from "./Components";
import { createEditFormState, createFormState } from "./Helpers";

interface Props {
  fields: Field[];
  onSubmit(formState: InstanceAttributeModel): void;
  onCancel(): void;
  originalAttributes?: InstanceAttributeModel;
  isSubmitDisabled?: boolean;
}

export const ServiceInstanceForm: React.FC<Props> = ({
  fields,
  onSubmit,
  onCancel,
  originalAttributes,
  isSubmitDisabled,
}) => {
  const [formState, setFormState] = useState(
    originalAttributes
      ? createEditFormState(fields, originalAttributes)
      : createFormState(fields)
  );

  const getUpdate =
    (path: string, multi = false) =>
    (value: unknown): void => {
      if (multi) {
        setFormState((prev) => {
          const clone = { ...prev };
          let selection = (clone[path] as string[]) || [];

          if (selection.includes(value as string)) {
            selection = selection.filter((item) => item !== (value as string));
          } else {
            selection.push(value as string);
          }

          return set(clone, path, selection);
        });
      } else {
        setFormState((prev) => {
          const clone = { ...prev };
          return set(clone, path, value);
        });
      }
    };

  const preventDefault = (event: React.FormEvent) => {
    event.preventDefault();
  };

  const onConfirm = () => onSubmit(formState);

  return (
    <StyledForm onSubmit={preventDefault}>
      {fields.map((field) => (
        <FieldInput
          key={field.name}
          field={field}
          formState={formState}
          getUpdate={getUpdate}
          path={null}
        />
      ))}

      {fields.length <= 0 && (
        <Alert
          variant="info"
          isInline
          title={words("inventory.editInstance.noAttributes")}
        />
      )}

      <ActionGroup>
        <ActionDisabledTooltip
          isDisabled={isSubmitDisabled}
          ariaLabel={words("confirm")}
          tooltipContent={words("environment.halt.tooltip")}
        >
          <Button
            variant="primary"
            onClick={onConfirm}
            isDisabled={isSubmitDisabled}
          >
            {words("confirm")}
          </Button>
        </ActionDisabledTooltip>

        <Button variant="link" onClick={onCancel}>
          {words("cancel")}
        </Button>
      </ActionGroup>
    </StyledForm>
  );
};

const StyledForm = styled(Form)`
  min-height: 0;
`;
