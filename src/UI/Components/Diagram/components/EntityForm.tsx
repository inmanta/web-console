import React, { useEffect, useState } from "react";
import { Alert, Button, Flex, FlexItem, Form } from "@patternfly/react-core";
import { set, uniqueId } from "lodash";
import { Field, InstanceAttributeModel, ServiceModel } from "@/Core";
import {
  CreateModifierHandler,
  EditModifierHandler,
  FieldCreator,
} from "@/UI/Components/ServiceInstanceForm";
import { FieldInput } from "@/UI/Components/ServiceInstanceForm/Components";
import { words } from "@/UI/words";

interface Props {
  serviceModel: ServiceModel;
  isEdited: boolean;
  initialState: InstanceAttributeModel;
  onSave: (fields: Field[], formState: InstanceAttributeModel) => void;
  onCancel: () => void;
  isForDisplay: boolean;
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
 * @prop {Function} onCancel - The callback to call when the cancel button is clicked.
 * @prop {boolean} isForDisplay - A flag that indicates whether the form is for display only.
 *
 * @returns {React.FC<Props>} The EntityForm component.
 */
export const EntityForm: React.FC<Props> = ({
  serviceModel,
  isEdited,
  initialState,
  onSave,
  onCancel,
  isForDisplay,
}) => {
  const [fields, setFields] = useState<Field[]>([]);
  const [formState, setFormState] =
    useState<InstanceAttributeModel>(initialState);

  /**
   * function to update the state within the form.
   *
   * @param {string} path - The path within the form state to update.
   * @param {unknown} value - The new value to set at the specified path.
   * @param {boolean} [multi] - Optional flag indicating if the update is for an array of values.
   * @returns {void}
   */
  const getUpdate = (path: string, value: unknown, multi = false): void => {
    //if multi is true, it means the field is a multi-select field and we need to update the array of values
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

        //update the form state with the new selection property with help of _lodash set function
        return set(clone, path, selection);
      });
    } else {
      setFormState((prev) => {
        const clone = { ...prev };

        //update the form state with the new value with help of _lodash set function
        return set(clone, path, value);
      });
    }
  };

  /**
   * Handles the cancel action for the form.
   * Resets the form state to its initial state and calls the onCancel callback.
   *
   * @returns {void}
   */
  const handleCancel = (): void => {
    setFormState(initialState);
    onCancel();
  };

  /**
   * Handles the save action for the form.
   * Prevents the default button click behavior and calls the onSave callback with the current fields and form state.
   *
   * @param {React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>} event - The mouse event triggered by clicking the save button.
   *
   * @returns {void}
   */
  const handleSave = (
    event: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
  ): void => {
    event.preventDefault();
    onSave(fields, formState);
  };

  useEffect(() => {
    const fieldCreator = new FieldCreator(
      isEdited ? new EditModifierHandler() : new CreateModifierHandler(),
    );
    const selectedFields = fieldCreator.attributesToFields(
      serviceModel.attributes,
    );

    setFields(selectedFields.map((field) => ({ ...field, id: uniqueId() })));
    setFormState(initialState);
  }, [serviceModel, isEdited, initialState]);

  return (
    <Flex
      flex={{ default: "flex_1" }}
      direction={{ default: "column" }}
      spaceItems={{ default: "spaceItemsSm" }}
      flexWrap={{ default: "nowrap" }}
    >
      {fields.length <= 0 && (
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
          onSubmit={(event) => {
            event.preventDefault();
            onSave(fields, formState);
          }}
        >
          {fields.map((field) => (
            <FieldInput
              originalState={initialState}
              key={field.name}
              field={{
                ...field,
                isDisabled: isForDisplay ? isForDisplay : field.isDisabled, //if form is for display only, all fields should be disabled
              }}
              formState={formState}
              getUpdate={getUpdate}
              path={null}
              suggestions={field.suggestion}
            />
          ))}
        </Form>
      </FlexItem>
      {!isForDisplay && (
        <Flex justifyContent={{ default: "justifyContentCenter" }}>
          <FlexItem>
            <Button variant="tertiary" width={200} onClick={handleCancel}>
              {words("cancel")}
            </Button>
          </FlexItem>
          <FlexItem>
            <Button variant="primary" width={200} onClick={handleSave}>
              {words("save")}
            </Button>
          </FlexItem>
        </Flex>
      )}
    </Flex>
  );
};
