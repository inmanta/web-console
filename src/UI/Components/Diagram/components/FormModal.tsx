import React, { useState } from "react";
import {
  Alert,
  Button,
  Flex,
  FlexItem,
  Form,
  Modal,
  Select,
  SelectOption,
  SelectOptionObject,
} from "@patternfly/react-core";
import { set } from "lodash";
import styled from "styled-components";
import { Field, InstanceAttributeModel, ServiceModel } from "@/Core";
import { words } from "@/UI/words";
import {
  createFormState,
  CreateModifierHandler,
  FieldCreator,
} from "../../ServiceInstanceForm";
import { FieldInput } from "../../ServiceInstanceForm/Components";

const FormModal = ({
  isOpen,
  toggleIsOpen,
  services,
  onConfirm,
}: {
  isOpen: boolean;
  toggleIsOpen: (value: boolean) => void;
  services: ServiceModel[];
  onConfirm: (entity: InstanceAttributeModel, entityName: string) => void;
}) => {
  const [fields, setFields] = useState<Field[]>([]);
  const [formState, setFormState] = useState<InstanceAttributeModel>({});
  // TODO: indication if we are editing instance or not
  //   instance !== undefined
  //       ? createEditFormState(fields, "v2", instance.candidate_attributes)
  //       : createFormState(fields)
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [selected, setSelected] = useState<
    string | SelectOptionObject | undefined
  >(undefined);

  const fieldCreator = new FieldCreator(new CreateModifierHandler());

  const clearStates = () => {
    setIsSelectOpen(false);
    setFields([]);
    setFormState({});
    setSelected(undefined);
  };

  const onEntityChosen = (
    _event,
    value: string | SelectOptionObject,
    isPlaceholder,
  ) => {
    if (isPlaceholder) {
      setSelected(undefined);
    } else {
      setSelected(value);
      const chosenModel = services.find((service) => service.name === value);
      if (chosenModel) {
        const selectedFields = fieldCreator.attributesToFields(
          chosenModel.attributes,
        );
        setFields(selectedFields);
        setFormState(createFormState(selectedFields));
      }
    }
    setIsSelectOpen(false);
  };
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

  return (
    <StyledModal
      isOpen={isOpen}
      title={"Add Entity"}
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
          onClick={() => {
            onConfirm(formState, selected as string);
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
            selections={selected}
            onToggle={() => setIsSelectOpen(!isSelectOpen)}
            isOpen={isSelectOpen}
            onSelect={onEntityChosen}
            maxHeight={300}
          >
            {[
              <SelectOption
                key="default_option"
                value={"Choose a Service"}
                isPlaceholder
              />,
            ].concat(
              services.map((service) => (
                <SelectOption
                  key={service.service_identity + service.name}
                  value={service.name}
                />
              )),
            )}
          </Select>
        </FlexItem>
        <FlexItem>
          <Form>
            {fields.map((field) => (
              <FieldInput
                originalState={{}} //TODO: change it to actual state in the PR that solely focus on form
                key={field.name}
                field={field}
                formState={formState}
                getUpdate={getUpdate}
                path={null}
              />
            ))}
          </Form>
        </FlexItem>

        {fields.length <= 0 && (
          <FlexItem>
            <Alert
              variant="info"
              isInline
              title={words("inventory.editInstance.noAttributes")}
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
  --pf-c-button--PaddingTop: px;
  --pf-c-button--PaddingBottom: 0px;
  width: 101px;
  height: 30px;
`;
