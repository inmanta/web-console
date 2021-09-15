import React, { useState } from "react";
import { set } from "lodash";
import { ActionGroup, Button, Form } from "@patternfly/react-core";
import { words } from "@/UI/words";
import { InstanceAttributeModel, Field } from "@/Core";
import { createEditFormState, createFormState } from "./Helpers";
import { FieldInput } from "./Components";
import { ActionDisabledTooltip } from "@/UI/Components/ActionDisabledTooltip";

interface Props {
  fields: Field[];
  onSubmit(fields: Field[], formState: InstanceAttributeModel): void;
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
    (path: string) =>
    (value: unknown): void =>
      setFormState((prev) => {
        const clone = { ...prev };
        return set(clone, path, value);
      });

  return (
    <>
      <Form>
        {fields.map((field) => (
          <FieldInput
            key={field.name}
            field={field}
            formState={formState}
            getUpdate={getUpdate}
            path={null}
          />
        ))}

        <ActionGroup>
          <ActionDisabledTooltip
            isDisabled={isSubmitDisabled}
            ariaLabel={words("confirm")}
            tooltipContent={words("environment.halt.tooltip")}
          >
            <Button
              variant="primary"
              onClick={() => onSubmit(fields, formState)}
              isDisabled={isSubmitDisabled}
            >
              {words("confirm")}
            </Button>
          </ActionDisabledTooltip>

          <Button variant="link" onClick={onCancel}>
            {words("cancel")}
          </Button>
        </ActionGroup>
      </Form>
    </>
  );
};
