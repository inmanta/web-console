import { Button, Modal } from "@patternfly/react-core";
import { TrashAltIcon } from "@patternfly/react-icons";
import React, { useContext, useState } from "react";
import { ActionDisabledTooltip } from "@/UI/Pages/ServiceInventory/Components";
import { words } from "@/UI/words";
import { DeleteForm } from "./DeleteForm";
import { DependencyContext } from "@/UI";
import { ErrorToastAlert } from "@/UI/Components";
import { VersionedServiceInstanceIdentifier } from "@/Core";

interface Props extends VersionedServiceInstanceIdentifier {
  isDisabled?: boolean;
}

export const DeleteModal: React.FC<Props> = ({
  isDisabled,
  id,
  version,
  service_entity,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleModalToggle = () => {
    setIsOpen(!isOpen);
  };
  const [errorMessage, setErrorMessage] = useState("");
  const { commandResolver } = useContext(DependencyContext);
  const trigger = commandResolver.getTrigger<"DeleteInstance">({
    kind: "DeleteInstance",
    service_entity,
    id,
    version,
  });
  const onSubmit = async () => {
    setIsOpen(false);
    const result = await trigger();
    if (result.kind === "Left") {
      setErrorMessage(result.value);
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
          variant="danger"
          onClick={handleModalToggle}
          isAriaDisabled={isDisabled}
          style={isDisabled ? { cursor: "not-allowed" } : {}}
        >
          <TrashAltIcon /> {words("inventory.deleteInstance.button")}
        </Button>
      </ActionDisabledTooltip>
      <Modal
        isOpen={isOpen}
        title={words("inventory.deleteInstance.title")}
        variant={"small"}
        onClose={handleModalToggle}
      >
        {words("inventory.deleteInstance.header")(id, service_entity)}
        <DeleteForm onSubmit={onSubmit} onCancel={() => setIsOpen(false)} />
      </Modal>
    </>
  );
};
