import React, { useContext, useState } from "react";
import { Button, Modal, Text } from "@patternfly/react-core";
import { TrashAltIcon } from "@patternfly/react-icons";
import { Maybe, VersionedServiceInstanceIdentifier } from "@/Core";
import {
  ToastAlert,
  ActionDisabledTooltip,
  ConfirmUserActionForm,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { GetInstancesContext } from "@S/ServiceInventory/UI/GetInstancesContext";

interface Props extends VersionedServiceInstanceIdentifier {
  instance_identity: string;
  isDisabled?: boolean;
}

export const DestroyModal: React.FC<Props> = ({
  isDisabled,
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
  const { commandResolver, environmentModifier } =
    useContext(DependencyContext);
  const { refetch } = useContext(GetInstancesContext);

  const trigger = commandResolver.useGetTrigger<"DestroyInstance">({
    kind: "DestroyInstance",
    service_entity,
    id,
    version,
  });
  const isHalted = environmentModifier.useIsHalted();
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
      <ActionDisabledTooltip
        isDisabled={isDisabled || isHalted}
        ariaLabel={words("inventory.destroyInstance.button")}
        tooltipContent={
          isHalted
            ? words("environment.halt.tooltip")
            : words("inventory.statustab.actionDisabled")
        }
      >
        <Button
          variant="secondary"
          onClick={handleModalToggle}
          isDisabled={isDisabled || isHalted}
          isBlock
          isDanger
        >
          <TrashAltIcon /> {words("inventory.destroyInstance.button")}
        </Button>
      </ActionDisabledTooltip>
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
