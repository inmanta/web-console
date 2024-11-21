import React, { useCallback, useEffect, useState } from "react";
import { Alert, Flex, FlexItem, Form } from "@patternfly/react-core";
import { set } from "lodash";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { Field, InstanceAttributeModel, ServiceModel } from "@/Core";
import {
  CreateModifierHandler,
  FieldCreator,
} from "@/UI/Components/ServiceInstanceForm";
import { FieldInput } from "@/UI/Components/ServiceInstanceForm/Components";
import { words } from "@/UI/words";
import { StyledButton } from "./RightSidebar";

interface Props {
  serviceModel: ServiceModel;
  isEdited: boolean;
  initialState: InstanceAttributeModel;
  onSave: (fields: Field[], formState: InstanceAttributeModel) => void;
  isDisabled: boolean;
  isRemovable: boolean;
  showButtons: boolean;
  onRemove: () => void;
}

/**
 * `EntityForm` is a React functional component that renders a form for a service entity.
 * The form fields are created based on the attributes of the service model.
 * unlike the InstanceForm, this is a sub-form and doesn't have the embedded/inter-service-relation form elements
 *
 * When the form is submitted, the `onSave` callback is called with the form fields and the form state.
 * The form can be reset to its initial state by clicking the cancel button, which also calls the `onCancel` callback.
 *
 * @props {Props} props - The properties passed to the component.
 * @prop {ServiceModel} serviceModel - The service model for which to create the form.
 * @prop {boolean} isEdited - A flag that indicates whether the form is in edit mode.
 * @prop {InstanceAttributeModel} initialState - The initial state of the form.
 * @prop {Function} onSave - The callback to call when the form is submitted.
 * @prop {boolean} isRemovable - A flag that indicates whether the entity can be removed.
 * @prop {boolean} showButtons - A flag that indicates whether to show buttons or not
 * @prop {Function} onRemove - The callback to call when the cancel Remove is clicked.
 *
 * @returns {React.FC<Props>} The EntityForm component.
 */
export const EntityForm: React.FC<Props> = ({
  serviceModel,
  isEdited,
  initialState,
  onSave,
  isDisabled,
  isRemovable,
  showButtons,
  onRemove,
}) => {
  const [fields, setFields] = useState<Field[] | null>(null);
  const [formState, setFormState] =
    useState<InstanceAttributeModel>(initialState);
  const [isDirty, setIsDirty] = useState(false);

  /**
   * function to update the state within the form.
   *
   * @param {string} path - The path within the form state to update.
   * @param {unknown} value - The new value to set at the specified path.
   * @param {boolean} [multi] - Optional flag indicating if the update is for an array of values.
   * @returns {void}
   */
  const getUpdate = (path: string, value: unknown, multi = false): void => {
    if (!fields) {
      return;
    }
    if (!isDirty) {
      setIsDirty(true);
    }

    //if multi is true, it means the field is a multi-select field and we need to update the array of values
    let updatedValue = {};

    if (multi) {
      setFormState((prev) => {
        const clone = { ...prev };
        let selection = (clone[path] as string[]) || [];

        //if the value is already in the array, remove it, otherwise add it
        if (selection.includes(value as string)) {
          selection = selection.filter((item) => item !== (value as string));
        } else {
          selection.push(value as string);
        }
        updatedValue = set(clone, path, selection);
        onSave(fields, updatedValue); // onSave has to be called within setState to avoid async behavior of setState

        //update the form state with the new selection property with help of _lodash set function
        return updatedValue;
      });
    } else {
      setFormState((prev) => {
        const clone = { ...prev };

        updatedValue = set(clone, path, value);
        onSave(fields, updatedValue); // onSave has to be called within setState to avoid async behavior of setState

        //update the form state with the new value with help of _lodash set function
        return updatedValue;
      });
    }
  };

  /**
   * Handles the save action for the form.
   * Prevents the default button click behavior and calls the onSave callback with the current fields and form state.
   *
   * @param {React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>} event - The mouse event triggered by clicking the save button.
   *
   * @returns {void}
   */
  const onCancel = (): void => {
    if (!fields) {
      return;
    }
    onSave(fields, initialState);
    createFieldsAndState();
    setFormState(initialState);
    setIsDirty(false);
  };

  /**
   * Creates fields for the entity form using the FieldCreator class and sets them in the state.
   *
   * This function is memoized using useCallback to avoid unnecessary re-renders. It creates a new FieldCreator instance with a CreateModifierHandler and the isEdited flag.
   * It then converts the service model attributes to fields and assigns a unique ID to each field before setting them in the state.
   *
   * @returns {void}
   */
  const createFieldsAndState = useCallback(() => {
    const fieldCreator = new FieldCreator(
      new CreateModifierHandler(),
      isEdited,
    );
    const selectedFields = fieldCreator.attributesToFields(
      serviceModel.attributes,
    );

    setFields(selectedFields.map((field) => ({ ...field, id: uuidv4() })));
    setFormState(initialState);
    setIsDirty(false);
  }, [serviceModel, isEdited, initialState]);

  useEffect(() => {
    createFieldsAndState();
  }, [createFieldsAndState]);

  return (
    <>
      <StyledFlex
        flex={{ default: "flex_1" }}
        direction={{ default: "column" }}
        spaceItems={{ default: "spaceItemsSm" }}
        flexWrap={{ default: "nowrap" }}
      >
        {fields && fields.length <= 0 && (
          <FlexItem>
            <Alert
              variant="info"
              isInline
              title={words("instanceComposer.formModal.noAttributes")}
            />
          </FlexItem>
        )}
        <FlexItem>
          <Form
            data-testid="entity-form"
            onSubmit={(event) => {
              event.preventDefault();
            }}
          >
            {fields &&
              fields.map((field) => (
                <FieldInput
                  originalState={initialState}
                  key={field.name}
                  field={{
                    ...field,
                    isDisabled: isDisabled || field.isDisabled,
                  }}
                  formState={formState}
                  getUpdate={getUpdate}
                  path={null}
                  suggestions={field.suggestion}
                />
              ))}
          </Form>
        </FlexItem>
      </StyledFlex>
      {showButtons && (
        <Flex justifyContent={{ default: "justifyContentCenter" }}>
          <Flex justifyContent={{ default: "justifyContentCenter" }}>
            <FlexItem>
              <StyledButton
                variant="danger"
                width={200}
                onClick={onRemove}
                isDisabled={!isRemovable}
              >
                {words("remove")}
              </StyledButton>
            </FlexItem>
          </Flex>
          <FlexItem>
            <StyledButton
              variant="tertiary"
              width={200}
              isDisabled={!isDirty}
              onClick={onCancel}
            >
              {words("cancel")}
            </StyledButton>
          </FlexItem>
        </Flex>
      )}
    </>
  );
};

const StyledFlex = styled(Flex)`
  min-height: 100%;
  width: 100%;
  overflow-y: scroll;
`;
