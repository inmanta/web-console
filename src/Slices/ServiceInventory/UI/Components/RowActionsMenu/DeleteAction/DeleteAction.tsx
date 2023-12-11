import React, { useContext, useState } from "react";
import { MenuItem, Modal } from "@patternfly/react-core";
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

export const DeleteAction: React.FC<Props> = ({
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

  const trigger = commandResolver.useGetTrigger<"DeleteInstance">({
    kind: "DeleteInstance",
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
        data-testid="ToastAlert"
        title={words("inventory.deleteInstance.failed")}
        message={errorMessage}
        setMessage={setErrorMessage}
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
        <MenuItem
          itemId="delete"
          onClick={handleModalToggle}
          isDisabled={isDisabled || isHalted}
          icon={<TrashAltIcon />}
          isDanger
        >
          {words("inventory.deleteInstance.button")}
        </MenuItem>
      </ActionDisabledTooltip>
      <Modal
        disableFocusTrap
        isOpen={isOpen}
        title={words("inventory.deleteInstance.title")}
        variant={"small"}
        onClose={handleModalToggle}
      >
        {words("inventory.deleteInstance.header")(
          instance_identity,
          service_entity,
        )}
        <ConfirmUserActionForm
          onSubmit={onSubmit}
          onCancel={() => setIsOpen(false)}
        />
      </Modal>
    </>
  );
};
