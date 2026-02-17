import React, { useCallback, useEffect, useState } from "react";
import {
  ActionList,
  ActionListItem,
  Alert,
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  Form,
  MenuToggle,
  MenuToggleAction,
  ToggleGroup,
  ToggleGroupItem,
  MenuToggleElement,
} from "@patternfly/react-core";
import { set } from "lodash-es";
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
  onSubmit(
    formState: InstanceAttributeModel,
    callback: (value: boolean) => void,
    initialState?: string
  ): void;
  onCancel(): void;
  originalAttributes?: InstanceAttributeModel;
  isSubmitDisabled?: boolean;
  apiVersion?: "v1" | "v2";
  isEdit?: boolean;
  isDirty: boolean;
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
  initialStates?: string[];
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
  initialStates = [],
}) => {
  const [formState, setFormState] = useState(
    getFormState(fields, apiVersion, originalAttributes, isEdit)
  );
  //originalState is created to make possible to differentiate newly created attributes to keep track on which inputs should be disabled
  const [originalState] = useState(getFormState(fields, apiVersion, originalAttributes, isEdit));

  const [shouldPerformCancel, setShouldCancel] = useState(false);
  const [isForm, setIsForm] = useState(true);
  const [isEditorValid, setIsEditorValid] = useState(true);
  const [isSubmitDropdownOpen, setIsSubmitDropdownOpen] = useState(false);

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

          return set(clone, path, selection);
        });
      } else {
        setFormState((prev) => {
          const clone = { ...prev };

          return set(clone, path, value);
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

  const onConfirmDropdownToggle = (value: boolean) => {
    setIsSubmitDropdownOpen(value);
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

  const onInitialStateConfirm = (initialState: string) =>
    onSubmit(formState, (value: boolean) => setIsDirty(value), initialState);

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
            {initialStates.length > 0 ? (
              <Dropdown
                aria-label="SubmitDropdown"
                onOpenChange={(value) => onConfirmDropdownToggle(value)}
                isOpen={isSubmitDropdownOpen}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    aria-label="SubmitDropdownToggle"
                    ref={toggleRef}
                    variant="primary"
                    onClick={(value) => onConfirmDropdownToggle(value)}
                    isExpanded={isSubmitDropdownOpen}
                    splitButtonItems={[
                      <MenuToggleAction
                        key="action"
                        onClick={onConfirm}
                        aria-label="submit"
                        isDisabled={isSubmitDisabled || !isEditorValid}
                      >
                        {words("confirm")}
                      </MenuToggleAction>,
                    ]}
                  ></MenuToggle>
                )}
              >
                <DropdownList>
                  {initialStates.map((state) => (
                    <DropdownItem
                      aria-label={`Initial-State-Option-${state}`}
                      key={state}
                      component="button"
                      onClick={() => onInitialStateConfirm(state)}
                    >
                      {state}
                    </DropdownItem>
                  ))}
                </DropdownList>
              </Dropdown>
            ) : (
              <Button
                variant="primary"
                onClick={onConfirm}
                isDisabled={isSubmitDisabled || !isEditorValid}
                aria-disabled={isSubmitDisabled || !isEditorValid}
                aria-label="submit"
              >
                {words("confirm")}
              </Button>
            )}
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
