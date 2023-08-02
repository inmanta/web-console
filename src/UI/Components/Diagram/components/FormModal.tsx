import React, { useEffect, useState } from "react";
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
  FieldCreator,
} from "../../ServiceInstanceForm";
import { FieldInput } from "../../ServiceInstanceForm/Components";

interface PossibleForm {
  key: string;
  value: string;
  model: ServiceModel | EmbeddedEntity | undefined;
}

const FormModal = ({
  isOpen,
  toggleIsOpen,
  services,
  onConfirm,
}: {
  isOpen: boolean;
  toggleIsOpen: (value: boolean) => void;
  services: ServiceModel[];
  onConfirm: (
    entity: InstanceAttributeModel,
    selected: {
      name: string;
      model: ServiceModel | EmbeddedEntity;
    },
  ) => void;
}) => {
  const [possibleForms, setPossibleForms] = useState<PossibleForm[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [formState, setFormState] = useState<InstanceAttributeModel>({});
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [selected, setSelected] = useState<
    | {
        name: string;
        model: ServiceModel | EmbeddedEntity;
      }
    | undefined
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
      clearStates();
    } else {
      const chosenModel = possibleForms.find(
        (service) => service.value === value,
      );

      if (chosenModel && chosenModel.model) {
        setSelected({ name: value as string, model: chosenModel.model });
        const selectedFields = fieldCreator.attributesToFields(
          chosenModel.model.attributes,
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

  useEffect(() => {
    const getOptions = (
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
        });
        getOptions(service.embedded_entities, values, joinedPrefix);
      });
      return values;
    };

    setPossibleForms(
      getOptions(services, [
        { key: "default_option", value: "Choose a Service", model: undefined },
      ]),
    );
  }, [services]);
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
          isDisabled={selected === undefined}
          onClick={() => {
            if (selected) onConfirm(formState, selected);
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
            selections={selected?.name}
            onToggle={() => setIsSelectOpen(!isSelectOpen)}
            isOpen={isSelectOpen}
            onSelect={onEntityChosen}
            maxHeight={300}
          >
            {possibleForms.map(({ key, value }) => (
              <SelectOption
                key={key}
                value={value}
                isPlaceholder={value === "Choose a Service"}
              />
            ))}
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
