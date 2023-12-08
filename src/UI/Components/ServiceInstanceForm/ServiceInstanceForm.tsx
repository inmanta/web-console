import React, { useCallback, useEffect, useState } from "react";
import { ActionGroup, Alert, Button, Form } from "@patternfly/react-core";
import { set } from "lodash-es";
import styled from "styled-components";
import { InstanceAttributeModel, Field } from "@/Core";
import { ActionDisabledTooltip } from "@/UI/Components/ActionDisabledTooltip";
import { usePrompt } from "@/UI/Utils/usePrompt";
import { words } from "@/UI/words";
import { FieldInput } from "./Components";
import {
  createDuplicateFormState,
  createEditFormState,
  createFormState,
} from "./Helpers";

interface Props {
  fields: Field[];
  onSubmit(
    formState: InstanceAttributeModel,
    callback: (value: boolean) => void,
  ): void;
  onCancel(): void;
  originalAttributes?: InstanceAttributeModel;
  isSubmitDisabled?: boolean;
  apiVersion?: "v1" | "v2";
  isEdit?: boolean;
}

const getFormState = (
  fields,
  apiVersion,
  originalAttributes,
  isEdit = false,
) => {
  if (isEdit) {
    return createEditFormState(fields, apiVersion, originalAttributes);
  } else if (originalAttributes) {
    return createDuplicateFormState(fields, originalAttributes);
  } else {
    return createFormState(fields);
  }
};

export const ServiceInstanceForm: React.FC<Props> = ({
  fields,
  onSubmit,
  onCancel,
  originalAttributes,
  isSubmitDisabled,
  apiVersion = "v1",
  isEdit = false,
}) => {
  const [formState, setFormState] = useState(
    getFormState(fields, apiVersion, originalAttributes, isEdit),
  );
  //originalState is created to make possible to differentiate newly created attributes to keep track on which inputs should be disabled
  const [originalState] = useState(
    getFormState(fields, apiVersion, originalAttributes, isEdit),
  );

  const [dirtyInputs, setDirtyInputs] = useState(false);
  const [shouldPerformCancel, setShouldCancel] = useState(false);

  usePrompt(words("notification.instanceForm.prompt"), dirtyInputs);

  //callback was used to avoid re-render in useEffect used in SelectFormInput inside FieldInput
  const getUpdate = useCallback(
    (path: string, value: unknown, multi = false): void => {
      if (!dirtyInputs) {
        setDirtyInputs(true);
      }
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
    },
    [dirtyInputs],
  );

  const preventDefault = (event: React.FormEvent) => {
    event.preventDefault();
  };

  const onConfirm = () =>
    onSubmit(formState, (value: boolean) => setDirtyInputs(value));

  useEffect(() => {
    if (shouldPerformCancel) {
      onCancel();
    }
  }, [shouldPerformCancel, onCancel]);

  return (
    <StyledForm onSubmit={preventDefault}>
      {fields.map((field) => (
        <FieldInput
          key={field.name}
          field={field}
          formState={formState}
          originalState={originalState}
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

        <Button
          variant="link"
          onClick={() => {
            if (dirtyInputs) {
              setDirtyInputs(false);
            }
            setShouldCancel(true);
          }}
        >
          {words("cancel")}
        </Button>
      </ActionGroup>
    </StyledForm>
  );
};

const StyledForm = styled(Form)`
  min-height: 0;
`;
