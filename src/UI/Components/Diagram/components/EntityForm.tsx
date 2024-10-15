import React, { useEffect, useState } from "react";
import { Alert, Button, Flex, FlexItem, Form } from "@patternfly/react-core";
import { set, uniqueId } from "lodash";
import styled from "styled-components";
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
   * Type representing a function to update the state within the form.
   *
   * @param {string} path - The path within the form state to update.
   * @param {unknown} value - The new value to set at the specified path.
   * @param {boolean} [multi] - Optional flag indicating if the update is for multiple values. Default is false.
   * @returns {void}
   */
  const getUpdate = (path: string, value: unknown, multi = false): void => {
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
    <StyledFlex
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
            title={
              isEdited
                ? words("inventory.editInstance.noAttributes")
                : words("inventory.addInstance.unselectedEntity")
            }
          />
        </FlexItem>
      )}
      <FlexItem>
        <Form
          onSubmit={(event) => {
            event.preventDefault();
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
            <StyledButton
              variant="tertiary"
              width={200}
              onClick={() => {
                setFormState(initialState);
                onCancel();
              }}
            >
              {words("cancel")}
            </StyledButton>
          </FlexItem>
          <FlexItem>
            <StyledButton
              variant="primary"
              width={200}
              onClick={(event) => {
                event.preventDefault();
                onSave(fields, formState);
              }}
            >
              {words("save")}
            </StyledButton>
          </FlexItem>
        </Flex>
      )}
    </StyledFlex>
  );
};

const StyledFlex = styled(Flex)`
  min-height: 100%;
  width: 100%;
  overflow-y: scroll;
`;
const StyledButton = styled(Button)`
  --pf-v5-c-button--PaddingTop: 0px;
  --pf-v5-c-button--PaddingBottom: 0px;
  width: 101px;
  height: 30px;
`;
