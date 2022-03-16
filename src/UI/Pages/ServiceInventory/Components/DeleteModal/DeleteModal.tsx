import React, { useContext, useState } from "react";
import { Button, Modal } from "@patternfly/react-core";
import { TrashAltIcon } from "@patternfly/react-icons";
import { Maybe, VersionedServiceInstanceIdentifier } from "@/Core";
import {
  ErrorToastAlert,
  ActionDisabledTooltip,
  DeleteForm,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

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
  const { commandResolver, environmentModifier } =
    useContext(DependencyContext);
  const trigger = commandResolver.getTrigger<"DeleteInstance">({
    kind: "DeleteInstance",
    service_entity,
    id,
    version,
  });
  const isHalted = environmentModifier.useIsHalted();
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
        title={words("inventory.deleteInstance.failed")}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
      <ActionDisabledTooltip
        isDisabled={isDisabled || isHalted}
        ariaLabel={words("inventory.deleteInstance.button")}
        tooltipContent={
          isHalted
            ? words("environment.halt.tooltip")
            : words("inventory.statustab.actionDisabled")
        }
      >
        <Button
          variant="danger"
          onClick={handleModalToggle}
          isDisabled={isDisabled || isHalted}
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
