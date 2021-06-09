import React, { useContext, useState } from "react";
import { Button, Modal } from "@patternfly/react-core";
import { TrashAltIcon } from "@patternfly/react-icons";
import { words } from "@/UI/words";
import { DependencyContext } from "@/UI/Dependency";
import { ErrorToastAlert, ActionDisabledTooltip } from "@/UI/Components";
import { Maybe, VersionedServiceInstanceIdentifier } from "@/Core";
import { DeleteForm } from "./DeleteForm";

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
    if (Maybe.isSome(result)) {
      setErrorMessage(result.value);
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
        ariaLabel={words("inventory.deleteInstance.button")}
      >
        <Button
          variant="danger"
          onClick={handleModalToggle}
          isDisabled={isDisabled}
          isBlock
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
