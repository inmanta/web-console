import React, { useCallback, useEffect, useState } from "react";
import { dia } from "@inmanta/rappid";
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
import { ServiceEntityBlock } from "../shapes";

interface PossibleForm {
  key: string;
  value: string;
  model: ServiceModel | EmbeddedEntity | undefined;
  isEmbedded: boolean;
}

const FormModal = ({
  isOpen,
  toggleIsOpen,
  services,
  cellView,
  onConfirm,
}: {
  isOpen: boolean;
  toggleIsOpen: (value: boolean) => void;
  services: ServiceModel[];
  cellView: dia.CellView | null;
  onConfirm: (
    entity: InstanceAttributeModel,
    selected: {
      name: string;
      model: ServiceModel | EmbeddedEntity;
      isEmbedded: boolean;
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
        isEmbedded: boolean;
      }
    | undefined
  >(undefined);

  const clearStates = () => {
    setIsSelectOpen(false);
    setFields([]);
    setFormState({});
    setSelected(undefined);
  };

  const onEntityChosen = useCallback(
    (
      _event,
      value: string | SelectOptionObject,
      isPlaceholder: boolean | undefined,
      possibleForms: PossibleForm[],
    ) => {
      if (isPlaceholder) {
        clearStates();
      } else {
        const chosenModel = possibleForms.find(
          (service) => service.value === value,
        );

        if (chosenModel && chosenModel.model) {
          setSelected({
            name: value as string,
            model: chosenModel.model,
            isEmbedded: chosenModel.isEmbedded,
          });

          const fieldCreator = new FieldCreator(new CreateModifierHandler());
          const selectedFields = fieldCreator.attributesToFields(
            chosenModel.model.attributes,
          );

          setFields(selectedFields);
          if (cellView) {
            console.log(cellView);
            setFormState(
              (cellView.model as ServiceEntityBlock).get("instanceAttributes"),
            );
          } else {
            setFormState(createFormState(selectedFields));
          }
        }
      }
      setIsSelectOpen(false);
    },
    [cellView],
  );

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
          isEmbedded: prefix !== "",
        });

        getOptions(service.embedded_entities, values, joinedPrefix);
      });

      return values;
    };

    const tempPossibleForms = getOptions(services, [
      {
        key: "default_option",
        value: "Choose a Service",
        model: undefined,
        isEmbedded: false,
      },
    ]);
    setPossibleForms(tempPossibleForms);
    if (cellView) {
      const entity = cellView.model as ServiceEntityBlock;
      const entityName = entity.getName();

      onEntityChosen(
        null,
        entity.get("isEmbedded")
          ? `${entityName} (${entity.get("holderType")})`
          : entityName,
        false,
        tempPossibleForms,
      );
    }
  }, [services, cellView, onEntityChosen]);
  return (
    <StyledModal
      isOpen={isOpen}
      title={cellView ? "Edit Entity" : "Add Entity"}
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
            onSelect={(evt, value, isPlaceholder) => {
              onEntityChosen(evt, value, isPlaceholder, possibleForms);
            }}
            maxHeight={300}
            isDisabled={cellView !== null}
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
