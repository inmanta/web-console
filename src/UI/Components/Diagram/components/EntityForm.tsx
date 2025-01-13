import React, { useCallback, useContext, useEffect, useState } from "react";
import { dia } from "@inmanta/rappid";
import { Alert, Button, Flex, FlexItem, Form } from "@patternfly/react-core";
import { set } from "lodash";
import { v4 as uuidv4 } from "uuid";
import { Field, InstanceAttributeModel, ServiceModel } from "@/Core";
import { sanitizeAttributes } from "@/Data";
import {
  CreateModifierHandler,
  FieldCreator,
} from "@/UI/Components/ServiceInstanceForm";
import { FieldInput } from "@/UI/Components/ServiceInstanceForm/Components";
import { words } from "@/UI/words";
import { CanvasContext } from "../Context";
import { updateServiceOrderItems } from "../helpers";
import { ActionEnum } from "../interfaces";

interface Props {
  cellToEdit: dia.CellView;

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
 * @prop {Function} onRemove - The callback to call when the "Remove" button is clicked.
 *
 * @returns {React.FC<Props>} The EntityForm component.
 */
export const EntityForm: React.FC<Props> = ({
  cellToEdit,
  isDisabled,
  isRemovable,
  showButtons,
  onRemove,
}) => {
  const { diagramHandlers, setServiceOrderItems } = useContext(CanvasContext);
  const [serviceModel, setServiceModel] = useState<ServiceModel | null>(null);
  const [fields, setFields] = useState<Field[] | null>(null);
  const [originalState, setOriginalState] = useState<InstanceAttributeModel>(
    {},
  );
  const [formState, setFormState] = useState<InstanceAttributeModel>({});
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
    if (!fields || !serviceModel) {
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

        return updatedValue;
      });
    } else {
      setFormState((prev) => {
        const clone = { ...prev };

        updatedValue = set(clone, path, value);

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
    onSave(originalState);
    createFieldsAndState();
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
    const { model } = cellToEdit;
    const serviceModel = model.get("serviceModel") as ServiceModel;
    const isEdited = model.get("isEdited") as boolean;
    const instanceAttributes = model.get("instanceAttributes");

    const fieldCreator = new FieldCreator(
      new CreateModifierHandler(),
      isEdited,
    );
    const selectedFields = fieldCreator.attributesToFields(
      serviceModel.attributes,
    );

    setFields(selectedFields.map((field) => ({ ...field, id: uuidv4() })));
    setServiceModel(serviceModel);
    setFormState(instanceAttributes);
    setOriginalState(instanceAttributes);
    setIsDirty(false);
  }, [cellToEdit]);

  const onSave = useCallback(
    (formState) => {
      if (diagramHandlers && fields && serviceModel) {
        const sanitizedAttrs = sanitizeAttributes(fields, formState);

        const shape = diagramHandlers.editEntity(
          cellToEdit,
          serviceModel,
          formState,
        );

        shape.set("sanitizedAttrs", sanitizedAttrs);

        setServiceOrderItems((prev) =>
          updateServiceOrderItems(shape, ActionEnum.UPDATE, prev),
        );
      }
    },
    [cellToEdit, diagramHandlers, fields, serviceModel, setServiceOrderItems],
  );

  useEffect(() => {
    createFieldsAndState();
  }, [createFieldsAndState]);

  useEffect(() => {
    onSave(formState);
  }, [onSave, formState]);

  return (
    <>
      {fields && fields.length <= 0 && (
        <FlexItem>
          <Alert
            variant="info"
            isInline
            title={words("instanceComposer.formModal.noAttributes")}
          />
        </FlexItem>
      )}
      <FlexItem flex={{ default: "flex_1" }}>
        <Form
          data-testid="entity-form"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          {fields &&
            fields.map((field) => (
              <FieldInput
                originalState={originalState}
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
      {showButtons && (
        <Flex justifyContent={{ default: "justifyContentCenter" }}>
          <FlexItem>
            <Button
              variant="danger"
              width={200}
              onClick={onRemove}
              isDisabled={!isRemovable}
            >
              {words("remove")}
            </Button>
          </FlexItem>
          <FlexItem>
            <Button
              variant="tertiary"
              width={200}
              isDisabled={!isDirty}
              onClick={onCancel}
            >
              {words("cancel")}
            </Button>
          </FlexItem>
        </Flex>
      )}
    </>
  );
};
