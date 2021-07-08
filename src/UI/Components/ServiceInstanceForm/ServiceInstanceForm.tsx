import React, { useState } from "react";
import { set } from "lodash";
import { ActionGroup, Button, Form } from "@patternfly/react-core";
import { words } from "@/UI/words";
import { InstanceAttributeModel, Field } from "@/Core";
import { createFormState } from "./Helpers";
import { FieldInput } from "./Components";

interface Props {
  fields: Field[];
  onSubmit(fields: Field[], formState: InstanceAttributeModel): void;
  onCancel(): void;
}

export const ServiceInstanceForm: React.FC<Props> = ({
  fields,
  onSubmit,
  onCancel,
}) => {
  const [formState, setFormState] = useState(createFormState(fields));

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
          <Button variant="primary" onClick={() => onSubmit(fields, formState)}>
            {words("confirm")}
          </Button>
          <Button variant="link" onClick={onCancel}>
            {words("cancel")}
          </Button>
        </ActionGroup>
      </Form>
    </>
  );
};
