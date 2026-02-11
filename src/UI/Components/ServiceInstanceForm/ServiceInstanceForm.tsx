import React, { useCallback, useEffect, useState } from "react";
import {
  ActionList,
  ActionListItem,
  Alert,
  Button,
  Form,
  ToggleGroup,
  ToggleGroupItem,
} from "@patternfly/react-core";
import styled from "styled-components";
import { InstanceAttributeModel, Field } from "@/Core";
import { ActionDisabledTooltip } from "@/UI/Components/ActionDisabledTooltip";
import { usePrompt } from "@/UI/Utils/usePrompt";
import { words } from "@/UI/words";
import { JSONEditor } from "../JSONEditor";
import { FieldInput } from "./Components";
import { createDuplicateFormState, createEditFormState, createFormState } from "./Helpers";

interface Props {
  service_entity: string;
  fields: Field[];
  onSubmit(formState: InstanceAttributeModel, callback: (value: boolean) => void): void;
  onCancel(): void;
  originalAttributes?: InstanceAttributeModel;
  isSubmitDisabled?: boolean;
  apiVersion?: "v1" | "v2";
  isEdit?: boolean;
  isDirty: boolean;
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Creates the form state.
 * If the form is not in edit mode but has original attributes, it returns a state for a duplicated instance.
 *
 * @param {Fields} fields - Array of Fields.
 * @param {string} apiVersion - API version ("v1" or "v2").
 * @param {InstanceAttributeModel} originalAttributes - The original state of the attributes.
 * @param {boolean} [isEdit=false] - Whether the form is in edit mode. Default is false.
 * @returns {InstanceAttributeModel} The calculated form state.
 */
const getFormState = (
  fields,
  apiVersion,
  originalAttributes,
  isEdit = false
): InstanceAttributeModel => {
  if (isEdit) {
    return createEditFormState(fields, apiVersion, originalAttributes);
  } else if (originalAttributes) {
    return createDuplicateFormState(fields, originalAttributes);
  } else {
    return createFormState(fields);
  }
};

/**
 * ServiceInstanceForm Component.
 * Supports editing, creating, and duplicating instances.
 *
 * @param {Props} props - Props for the ServiceInstanceForm component.
 *   @prop {Fields[]} fields - Array of Fields.
 *   @prop {function} onSubmit - Callback method to handle form submission.
 *   @prop {function} onCancel - Callback method to handle form cancellation.
 *   @prop {InstanceAttributeModel} originalAttributes - Original state of the attributes.
 *   @prop {boolean} isSubmitDisabled - Indicates whether the submit button is disabled.
 *   @prop {string} [apiVersion="v1"] - API version ("v1" or "v2"). Default is "v1".
 *   @prop {boolean} [isEdit=false] - Whether the form is in edit mode. Default is false.
 * @returns {React.FC<Props>} The rendered ServiceInstanceForm component.
 */
export const ServiceInstanceForm: React.FC<Props> = ({
  service_entity,
  fields,
  onSubmit,
  onCancel,
  originalAttributes,
  isSubmitDisabled,
  apiVersion = "v1",
  isEdit = false,
  isDirty,
  setIsDirty,
}) => {
  const [formState, setFormState] = useState(
    getFormState(fields, apiVersion, originalAttributes, isEdit)
  );
  //originalState is created to make possible to differentiate newly created attributes to keep track on which inputs should be disabled
  const [originalState] = useState(getFormState(fields, apiVersion, originalAttributes, isEdit));

  const [shouldPerformCancel, setShouldCancel] = useState(false);
  const [isForm, setIsForm] = useState(true);
  const [isEditorValid, setIsEditorValid] = useState(true);

  usePrompt(words("notification.instanceForm.prompt"), isDirty);

  /**
   * Get an update for the form state based on the provided path and value.
   *
   * callback was used to avoid re-render in useEffect used in SelectFormInput inside FieldInput
   *
   * @param {string} path - The path within the form state to update.
   * @param {unknown} value - The new value to set at the specified path.
   * @param {boolean} [multi=false] - Optional flag indicating if the update is for multiple values. Default is false.
   * @returns {void}
   */
  const getUpdate = useCallback(
    (path: string, value: unknown, multi = false): void => {
      if (!isDirty) {
        setIsDirty(true);
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

          setAtPath(clone, path, selection);

          return clone;
        });
      } else {
        setFormState((prev) => {
          const clone = { ...prev };

          setAtPath(clone, path, value);

          return clone;
        });
      }
    },
    [isDirty, setIsDirty]
  );

  /**
   * Prevent the default behavior of a React form event.
   *
   * @param {React.FormEvent} event - The React form event.
   * @returns {void}
   */
  const preventDefault = (event: React.FormEvent) => {
    event.preventDefault();
  };

  // The try catch is there to make certain the provided string is parsable to JSON before setting the formstate.
  const onEditorChange = useCallback(
    (value: string, isValid: boolean) => {
      try {
        const parsed = JSON.parse(value);

        setFormState(parsed);
        setIsEditorValid(isValid);
      } catch (_error) {
        setIsEditorValid(false);
      }
    },
    [setFormState, setIsEditorValid]
  );

  /**
   * Handle confirmation action by triggering form submission and updating dirty state.
   *
   * @returns {void}
   */
  const onConfirm = () => onSubmit(formState, (value: boolean) => setIsDirty(value));

  useEffect(() => {
    if (shouldPerformCancel) {
      onCancel();
    }
  }, [shouldPerformCancel, onCancel]);

  return (
    <StyledForm onSubmit={preventDefault}>
      <ToggleGroup aria-label="form-editor-toggle-group">
        <ToggleGroupItem
          text={words("inventory.form.button")}
          key={0}
          buttonId="formButton"
          isSelected={isForm}
          isDisabled={!isEditorValid}
          onChange={() => setIsForm(true)}
        />
        <ToggleGroupItem
          text={words("inventory.editor.button")}
          key={1}
          buttonId="editorButton"
          isSelected={!isForm}
          onChange={() => setIsForm(false)}
        />
      </ToggleGroup>

      {!isForm ? (
        <JSONEditor
          service_entity={service_entity}
          data={JSON.stringify(formState, null, 2)}
          onChange={onEditorChange}
        />
      ) : (
        fields.map((field) => (
          <FieldInput
            key={field.name}
            field={field}
            formState={formState}
            originalState={originalState}
            getUpdate={getUpdate}
            path={null}
            suggestions={field.suggestion}
          />
        ))
      )}
      {fields.length <= 0 && (
        <Alert variant="info" isInline title={words("inventory.editInstance.noAttributes")} />
      )}

      <ActionList>
        <ActionListItem>
          <ActionDisabledTooltip
            isDisabled={isSubmitDisabled}
            testingId={words("confirm")}
            tooltipContent={words("environment.halt.tooltip")}
          >
            <Button
              variant="primary"
              onClick={onConfirm}
              isDisabled={isSubmitDisabled || !isEditorValid}
              aria-disabled={isSubmitDisabled || !isEditorValid}
              aria-label="submit"
            >
              {words("confirm")}
            </Button>
          </ActionDisabledTooltip>
        </ActionListItem>
        <ActionListItem>
          <Button
            variant="link"
            aria-label="cancel"
            onClick={() => {
              if (isDirty) {
                setIsDirty(false);
              }
              setShouldCancel(true);
            }}
          >
            {words("cancel")}
          </Button>
        </ActionListItem>
      </ActionList>
    </StyledForm>
  );
};

const StyledForm = styled(Form)`
  min-height: 0;
`;

const setAtPath = (obj: Record<string, unknown>, path: string, value: unknown): void => {
  const segments = path.split(".");
  let current: Record<string, unknown> | unknown[] = obj;

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;

    if (isLast) {
      (current as Record<string, unknown>)[segment] = value;
      return;
    }

    const nextSegment = segments[index + 1]!;
    const shouldBeArray = /^\d+$/.test(nextSegment);
    const currentTyped = current as Record<string, unknown>;
    const existing = currentTyped[segment];

    // If there is no container yet, or the existing value is not an object/array,
    // create a new one so we can safely descend into it. This mirrors lodash.set
    // behaviour and avoids errors when intermediate values are null or primitives.
    const isObjectLike =
      typeof existing === "object" && existing !== null && !Array.isArray(existing);
    const isArrayLike = Array.isArray(existing);

    if (existing === undefined || existing === null || (!isObjectLike && !isArrayLike)) {
      currentTyped[segment] = shouldBeArray ? [] : {};
    }

    current = currentTyped[segment] as Record<string, unknown> | unknown[];
  });
};
