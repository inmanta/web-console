import React, { useContext } from "react";
import { MenuItem } from "@patternfly/react-core";
import { TrashAltIcon } from "@patternfly/react-icons";
import { useQueryClient } from "@tanstack/react-query";
import { VersionedServiceInstanceIdentifier, words } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { useAppAlert } from "@inmanta/web-console-core/Dependency/AppAlertContext";
import { ModalContext } from "@inmanta/web-console-core/Dependency/ModalContext";
import {
  useDeleteInstance,
  getInstanceKey,
} from "@inmanta/web-console-core/Queries/Slices/ServiceInstance";
import { ActionDisabledTooltip } from "@inmanta/web-console-ui/Components/ActionDisabledTooltip";
import { ConfirmUserActionForm } from "@inmanta/web-console-ui/Components/ConfirmUserActionForm";

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
  const client = useQueryClient();
  const { triggerModal, closeModal } = useContext(ModalContext);
  const { environmentHandler } = useContext(DependencyContext);
  const { notifyError } = useAppAlert();

  const { mutate, isPending } = useDeleteInstance(id, service_entity, version, {
    onError: (error) => {
      notifyError({
        title: words("inventory.deleteInstance.failed"),
        message: error.message,
      });
      closeModal();
    },
    onSuccess: () => {
      client.refetchQueries({
        queryKey: getInstanceKey.root(),
      });
      closeModal();
    },
  });

  const isHalted = environmentHandler.useIsHalted();

  /**
   * Opens a modal with a confirmation form.
   *
   * @returns {void}
   */
  const handleModalToggle = (): void => {
    triggerModal({
      title: words("inventory.deleteInstance.title"),
      content: (
        <>
          {words("inventory.deleteInstance.header")(instance_identity, service_entity)}
          <ConfirmUserActionForm onSubmit={onSubmit} onCancel={closeModal} />
        </>
      ),
    });
  };

  /**
   * async method that is closing modal and sending out the request to delete the instance
   * if there is an error, it will set the error message accordingly
   *
   * @returns {Promise<void>} A Promise that resolves when the operation is complete.
   */
  const onSubmit = async (): Promise<void> => {
    mutate();
  };

  return (
    <>
      <ActionDisabledTooltip
        isDisabled={isDisabled || isHalted}
        testingId={words("delete")}
        tooltipContent={
          isHalted ? words("environment.halt.tooltip") : words("inventory.statustab.actionDisabled")
        }
      >
        <MenuItem
          itemId="delete"
          onClick={handleModalToggle}
          isDisabled={isDisabled || isHalted}
          isLoading={isPending}
          icon={<TrashAltIcon />}
          {...(!isDisabled && !isHalted && { isDanger: true })}
        >
          {words("delete")}
        </MenuItem>
      </ActionDisabledTooltip>
    </>
  );
};
