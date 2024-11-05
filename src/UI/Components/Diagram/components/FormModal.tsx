import React, { useCallback, useEffect, useState } from "react";
import { dia } from "@inmanta/rappid";
import {
  Alert,
  Button,
  Flex,
  FlexItem,
  Form,
  MenuToggle,
  MenuToggleElement,
  Modal,
  Select,
  SelectOption,
} from "@patternfly/react-core";
import { set } from "lodash";
import styled from "styled-components";
import {
  EmbeddedEntity,
  Field,
  InstanceAttributeModel,
  ServiceModel,
} from "@/Core";
import { words } from "@/UI/words";
import {
  createFormState,
  CreateModifierHandler,
  EditModifierHandler,
  FieldCreator,
} from "../../ServiceInstanceForm";
import { FieldInput } from "../../ServiceInstanceForm/Components";
import { ServiceEntityBlock } from "../shapes";

interface PossibleForm {
  key: string;
  value: string;
  model: ServiceModel | EmbeddedEntity | undefined;
  isEmbedded: boolean;
  holderName: string;
}
interface Selected {
  name: string;
  model: ServiceModel | EmbeddedEntity;
  isEmbedded: boolean;
  holderName: string;
}

interface Props {
  isOpen: boolean;
  toggleIsOpen: (value: boolean) => void;
  services: ServiceModel[];
  cellView: dia.CellView | null;
  onConfirm: (
    fields: Field[],
    entity: InstanceAttributeModel,
    selected: Selected,
  ) => void;
}

/**
 * Component representing a form modal.
 *
 * @param {Props} props - The properties passed to the component.
 * @param {boolean} isOpen - Indicates if the modal is open.
 * @param {(value: boolean): void} toggleIsOpen - Function to toggle the modal open state.
 * @param {ServiceModel[]} services - List of service models.
 * @param {dia.CellView | null} cellView - The cell view that is being edited - null means that we are creating new one.
 * @param {(fields: Field[], entity: InstanceAttributeModel, selected: Selected): void} onConfirm - function to handle form confirmation.
 * @returns {JSX.Element} The FormModal component.
 */
const FormModal = ({
  isOpen,
  toggleIsOpen,
  services,
  cellView,
  onConfirm,
}: Props) => {
  const [possibleForms, setPossibleForms] = useState<PossibleForm[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [formState, setFormState] = useState<InstanceAttributeModel>({});
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [selected, setSelected] = useState<Selected | undefined>(undefined);

  /**
   * Clears the form states.
   *
   * Resets the select open state, fields, form state, and selected item to their initial values.
   * @returns {void}
   */
  const clearStates = (): void => {
    setIsSelectOpen(false);
    setFields([]);
    setFormState({});
    setSelected(undefined);
  };

  /**
   * pass a MenuToggle component to Select Component with specified properties.
   *
   * @param {React.Ref<MenuToggleElement>} toggleRef - The reference to the MenuToggle element.
   * @returns {JSX.Element} The MenuToggle component.
   */
  const toggleComponent = (
    toggleRef: React.Ref<MenuToggleElement>,
  ): JSX.Element => (
    <MenuToggle
      ref={toggleRef}
      onClick={(val) => setIsSelectOpen(val)}
      isExpanded={isSelectOpen}
      aria-label="service-picker"
      disabled={cellView !== null}
      isFullWidth
      isFullHeight={false}
    >
      {selected?.name ||
        words("inventory.instanceComposer.formModal.placeholder")}
    </MenuToggle>
  );

  /**
   * Handles the submit action for the form.
   * Prevents the default form submission behavior.
   * If an item is selected, calls the onConfirm callback with the current fields, form state, and selected item.
   * Clears the form states and closes the form modal.
   *
   * @param {React.MouseEvent<HTMLButtonElement, MouseEvent> | React.FormEvent<HTMLFormElement>} event - The event triggered by submitting the form or clicking the confirm button.
   * @returns {void}
   */
  const onSubmit = (
    event:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.FormEvent<HTMLFormElement>,
  ): void => {
    event.preventDefault();

    if (selected) {
      onConfirm(fields, formState, selected);
    }

    clearStates();
    toggleIsOpen(false);
  };

  /**
   * useCallback hook that Handles the selection of an entity.
   * Finds the chosen model from the possible forms and sets the selected item to the chosen model.
   * Creates a field creator with the appropriate modifier handler based on whether the cell view is in edit mode.
   * Converts the attributes of the chosen model to fields and sets the fields state to the selected fields.
   * If a cell view is present, sets the form state to the instance attributes of the cell view model.
   * Otherwise, creates a new form state based on the selected fields.
   * Closes the select component.
   *
   * @param {string} value - The value of the selected entity.
   * @param {PossibleForm[]} possibleForms - The possible forms to choose from.
   * @returns {void}
   */
  const onEntityChosen = useCallback(
    (value: string, possibleForms: PossibleForm[]): void => {
      const chosenModel = possibleForms.find(
        (service) => service.value === value,
      );
      if (chosenModel && chosenModel.model) {
        setSelected({
          name: value as string,
          model: chosenModel.model,
          isEmbedded: chosenModel.isEmbedded,
          holderName: chosenModel.holderName,
        });

        if (cellView) {
          const fieldCreator = new FieldCreator(
            cellView.model.get("isInEditMode")
              ? new EditModifierHandler()
              : new CreateModifierHandler(),
          );
          const selectedFields = fieldCreator.attributesToFields(
            chosenModel.model.attributes,
          );
          setFields(selectedFields);
          setFormState(
            (cellView.model as ServiceEntityBlock).get("instanceAttributes"),
          );
        } else {
          const fieldCreator = new FieldCreator(new CreateModifierHandler());
          const selectedFields = fieldCreator.attributesToFields(
            chosenModel.model.attributes,
          );
          setFields(selectedFields);
          setFormState(createFormState(selectedFields));
        }
      }
      setIsSelectOpen(false);
    },
    [cellView],
  );

  /**
   * useCallback hook that Handles updates to the form state.
   * If the multi flag is true, updates the form state by toggling the value in the form state at the specified path.
   * Otherwise, updates the form state by setting the value at the specified path.
   *
   * @param {string} path - The path to the value to update.
   * @param {unknown} value - The value to update.
   * @param {boolean} multi - A flag indicating whether the value is a multi-value.
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

  useEffect(() => {
    /** Iterate through all of services and its embedded entities to extract possible forms for shapes
     *
     * @param {(ServiceModel | EmbeddedEntity)[]}services array of services available to iterate through
     * @param {PossibleForm[]} values array of previously created forms, as we support concurrency
     * @param {string} prefix is a name of the entity/instance that holds given nested embedded entity
     * @returns
     */
    const getPossibleForms = (
      services: (ServiceModel | EmbeddedEntity)[],
      values: PossibleForm[],
      prefix = "",
    ) => {
      services.forEach((service) => {
        const joinedPrefix =
          (prefix !== "" ? prefix + "." : prefix) + service.name;
        const displayedPrefix = prefix !== "" ? ` (${prefix})` : "";

        values.push({
          key: service.name + "-" + prefix,
          value: service.name + displayedPrefix,
          model: service,
          isEmbedded: prefix !== "",
          holderName: prefix, //holderName is used in process of creating entity on canvas
        });

        getPossibleForms(service.embedded_entities, values, joinedPrefix);
      });

      return values;
    };

    const tempPossibleForms = getPossibleForms(services, [
      {
        key: "default_option",
        value: "Choose a Service",
        model: undefined,
        isEmbedded: false,
        holderName: "",
      },
    ]);
    setPossibleForms(tempPossibleForms);

    if (cellView) {
      const entity = cellView.model as ServiceEntityBlock;
      const entityName = entity.getName();
      onEntityChosen(
        entity.get("isEmbedded")
          ? `${entityName} (${entity.get("holderName")})`
          : entityName,
        tempPossibleForms,
      );
    }
  }, [services, cellView, onEntityChosen]);

  return (
    <StyledModal
      disableFocusTrap
      isOpen={isOpen}
      title={words(
        cellView
          ? "inventory.instanceComposer.formModal.edit.title"
          : "inventory.instanceComposer.formModal.create.title",
      )}
      variant={"small"}
      onClose={() => {
        clearStates();
        toggleIsOpen(false);
      }}
      actions={[
        <StyledButton
          key="cancel-button"
          aria-label="cancel-button"
          variant="tertiary"
          width={200}
          onClick={() => {
            clearStates();
            toggleIsOpen(false);
          }}
        >
          {words("cancel")}
        </StyledButton>,
        <StyledButton
          key="confirm-button"
          aria-label="confirm-button"
          variant="primary"
          width={200}
          isDisabled={selected === undefined}
          onClick={() => {
            if (selected) {
              onConfirm(fields, formState, selected);
            }

            clearStates();
            toggleIsOpen(false);
          }}
        >
          {words("confirm")}
        </StyledButton>,
      ]}
    >
      <Flex
        direction={{ default: "column" }}
        spaceItems={{ default: "spaceItemsSm" }}
      >
        <FlexItem>
          <Select
            isScrollable
            selected={selected?.name}
            toggle={toggleComponent}
            onOpenChange={(isOpen) => setIsSelectOpen(isOpen)}
            isOpen={isSelectOpen}
            onSelect={(_evt, value) => {
              onEntityChosen(String(value), possibleForms);
            }}
          >
            {possibleForms.map(({ key, value }) => (
              <SelectOption key={key} value={value}>
                {value}
              </SelectOption>
            ))}
          </Select>
        </FlexItem>
        <FlexItem>
          <Form onSubmit={onSubmit}>
            {fields.map((field) => (
              <FieldInput
                originalState={{}} //TODO: change it to actual state in the PR that solely focus on form
                key={field.name}
                field={field}
                formState={formState}
                getUpdate={getUpdate}
                path={null}
                suggestions={field.suggestion}
              />
            ))}
          </Form>
        </FlexItem>

        {fields.length <= 0 && (
          <FlexItem>
            <Alert
              variant="info"
              isInline
              title={
                cellView
                  ? words("inventory.editInstance.noAttributes")
                  : words("inventory.addInstance.unselectedEntity")
              }
            />
          </FlexItem>
        )}
      </Flex>
    </StyledModal>
  );
};

export default FormModal;

const StyledModal = styled(Modal)`
  height: 600px;
`;
const StyledButton = styled(Button)`
  --pf-v5-c-button--PaddingTop: 0px;
  --pf-v5-c-button--PaddingBottom: 0px;
  width: 101px;
  height: 30px;
`;
