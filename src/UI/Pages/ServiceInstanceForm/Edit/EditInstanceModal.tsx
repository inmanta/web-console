import { DependencyContext, words } from "@/UI";
import { ActionDisabledTooltip } from "@/UI/Pages/ServiceInventory/Components";
import { ServiceInstanceForAction } from "@/UI/Pages/ServiceInventory/Presenters";
import { Button, Modal, ModalVariant } from "@patternfly/react-core";
import { EditIcon } from "@patternfly/react-icons";
import React, { useContext, useState } from "react";
import { EditFormPresenter } from "./EditFormPresenter";
import { AttributeModel, FormAttributeResult } from "@/Core";
import { AttributeInputConverterImpl } from "@/UI/Data";
import { ErrorToastAlert } from "@/UI/Components";

interface Props {
  isDisabled?: boolean;
  instance: ServiceInstanceForAction;
  attributeModels: AttributeModel[];
}
export const EditInstanceModal: React.FC<Props> = ({
  isDisabled,
  instance,
  attributeModels,
}) => {
  const { commandResolver } = useContext(DependencyContext);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const handleModalToggle = () => {
    setIsOpen(!isOpen);
  };
  const attributeInputConverter = new AttributeInputConverterImpl();
  const editFormPresenter = new EditFormPresenter(attributeInputConverter);
  const currentAttributes =
    attributeInputConverter.getCurrentAttributes(instance);

  const trigger = commandResolver.getTrigger<"UpdateInstance">({
    kind: "UpdateInstance",
    service_entity: instance.service_entity,
    id: instance.id,
    version: instance.version,
  });

  const onSubmit = async (attributes: FormAttributeResult[]) => {
    const result = await trigger(currentAttributes, attributes);
    if (result.kind === "Left") {
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
      <ActionDisabledTooltip isDisabled={isDisabled}>
        <Button
          variant="secondary"
          onClick={handleModalToggle}
          isAriaDisabled={isDisabled}
          style={isDisabled ? { cursor: "not-allowed" } : {}}
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
        {editFormPresenter.presentForm(
          currentAttributes,
          attributeModels,
          onSubmit,
          () => setIsOpen(false)
        )}
      </Modal>
    </>
  );
};
