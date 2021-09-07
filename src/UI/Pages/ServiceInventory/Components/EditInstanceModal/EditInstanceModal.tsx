import React, { useContext, useState } from "react";
import { EditIcon } from "@patternfly/react-icons";
import { Button, Modal, ModalVariant } from "@patternfly/react-core";
import { Field, InstanceAttributeModel, Maybe, ServiceModel } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { ServiceInstanceForAction } from "@/UI/Presenters";
import { AttributeInputConverterImpl } from "@/Data";
import { ErrorToastAlert, ActionDisabledTooltip } from "@/UI/Components";
import { EditForm } from "./EditForm";

interface Props {
  isDisabled?: boolean;
  instance: ServiceInstanceForAction;
  serviceEntity: ServiceModel;
}
export const EditInstanceModal: React.FC<Props> = ({
  isDisabled,
  instance,
  serviceEntity,
}) => {
  const { commandResolver } = useContext(DependencyContext);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const handleModalToggle = () => {
    setIsOpen(!isOpen);
  };
  const attributeInputConverter = new AttributeInputConverterImpl();
  const currentAttributes =
    attributeInputConverter.getCurrentAttributes(instance);

  const trigger = commandResolver.getTrigger<"TriggerInstanceUpdate">({
    kind: "TriggerInstanceUpdate",
    service_entity: instance.service_entity,
    id: instance.id,
    version: instance.version,
  });

  const onSubmit = async (
    fields: Field[],
    attributes: InstanceAttributeModel
  ) => {
    const result = await trigger(fields, currentAttributes, attributes);
    if (Maybe.isSome(result)) {
      setErrorMessage(result.value);
      setIsOpen(false);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <>
      <ErrorToastAlert
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
      <ActionDisabledTooltip
        isDisabled={isDisabled}
        ariaLabel={words("inventory.editInstance.button")}
      >
        <Button
          variant="secondary"
          onClick={handleModalToggle}
          isDisabled={isDisabled}
          isBlock
        >
          <EditIcon /> {words("inventory.editInstance.button")}
        </Button>
      </ActionDisabledTooltip>
      <Modal
        variant={ModalVariant.small}
        isOpen={isOpen}
        title={words("inventory.editInstance.title")}
        onClose={handleModalToggle}
      >
        <EditForm
          currentAttributes={currentAttributes}
          serviceEntity={serviceEntity}
          onSubmit={onSubmit}
          onCancel={() => setIsOpen(false)}
        />
      </Modal>
    </>
  );
};
