import React, { useContext, useState } from "react";
import { Button, Modal, Text } from "@patternfly/react-core";
import { TrashAltIcon } from "@patternfly/react-icons";
import { Maybe, VersionedServiceInstanceIdentifier } from "@/Core";
import { ToastAlert, ConfirmUserActionForm } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { GetInstancesContext } from "@S/ServiceInventory/UI/GetInstancesContext";

interface Props extends VersionedServiceInstanceIdentifier {
  instance_identity: string;
}

export const DestroyAction: React.FC<Props> = ({
  id,
  instance_identity,
  version,
  service_entity,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleModalToggle = () => {
    setIsOpen(!isOpen);
  };
  const [errorMessage, setErrorMessage] = useState("");
  const { commandResolver } = useContext(DependencyContext);
  const { refetch } = useContext(GetInstancesContext);

  const trigger = commandResolver.useGetTrigger<"DestroyInstance">({
    kind: "DestroyInstance",
    service_entity,
    id,
    version,
  });
  const onSubmit = async () => {
    setIsOpen(false);
    const result = await trigger(refetch);
    if (Maybe.isSome(result)) {
      setErrorMessage(result.value);
    }
  };
  return (
    <>
      <ToastAlert
        title={words("inventory.destroyInstance.failed")}
        message={errorMessage}
        setMessage={setErrorMessage}
      />
      <Button variant="secondary" onClick={handleModalToggle} isBlock isDanger>
        <TrashAltIcon /> {words("inventory.destroyInstance.button")}
      </Button>
      <Modal
        variant={"small"}
        isOpen={isOpen}
        title={words("inventory.destroyInstance.title")}
        onClose={handleModalToggle}
        titleIconVariant="danger"
      >
        <Text>
          {words("inventory.destroyInstance.header")(
            instance_identity,
            service_entity
          )}
        </Text>
        <br />
        <Text>{words("inventory.destroyInstance.text")}</Text>
        <ConfirmUserActionForm
          onSubmit={onSubmit}
          onCancel={handleModalToggle}
        />
      </Modal>
    </>
  );
};
