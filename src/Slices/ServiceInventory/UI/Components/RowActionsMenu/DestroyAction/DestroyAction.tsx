import React, { useContext, useState } from "react";
import { MenuItem, Content } from "@patternfly/react-core";
import { WarningTriangleIcon } from "@patternfly/react-icons";
import { useQueryClient } from "@tanstack/react-query";
import { VersionedServiceInstanceIdentifier } from "@/Core";
import { useDestroyInstance } from "@/Data/Queries/V2/ServiceInstance";
import { DependencyContext } from "@/UI";
import { ToastAlert, ConfirmUserActionForm } from "@/UI/Components";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { words } from "@/UI/words";

interface Props extends VersionedServiceInstanceIdentifier {
  instance_identity: string;
}

/**
 * DestroyAction is a component that allows the user to destroy a service instance.
 *
 * @props {Props} props - The props of the component.
 * @prop {string} service_entity - The service entity of the service instance.
 * @prop {string} id - The id of the service instance.
 * @prop {string} instance_identity - The instance identity of the service instance.
 * @prop {string} version - The version of the service instance.
 *
 * @returns {React.FC<Props>} A React component that allows the user to destroy a service instance.
 */
export const DestroyAction: React.FC<Props> = ({
  id,
  instance_identity,
  version,
  service_entity,
}) => {
  const { triggerModal, closeModal } = useContext(ModalContext);
  const { authHelper } = useContext(DependencyContext);
  const client = useQueryClient();
  const [errorMessage, setErrorMessage] = useState("");

  const username = authHelper.getUser();
  const message = words("instanceDetails.API.message.update")(username);

  const { mutate } = useDestroyInstance(id, service_entity, version, message, {
    onError: (error) => {
      setErrorMessage(error.message);
    },
    onSuccess: () => {
      client.invalidateQueries({
        queryKey: ["get_instances-one_time", service_entity],
      });
      client.refetchQueries({
        queryKey: ["get_instances-continuous", service_entity],
      });
    },
  });

  /**
   * async method that is closing modal and sending out the request to destroy the instance
   * if there is an error, it will set the error message
   *
   * @returns {Promise<void>}  A Promise that resolves when the operation is complete.
   */
  const onSubmit = async (): Promise<void> => {
    closeModal();
    mutate();
  };

  /**
   * Opens a modal with a confirmation form.
   *
   * @returns {void}
   */
  const openModal = (): void => {
    triggerModal({
      title: words("inventory.destroyInstance.title"),
      iconVariant: "danger",
      content: (
        <>
          <Content component="p">
            {words("inventory.destroyInstance.header")(instance_identity, service_entity)}
          </Content>
          <br />
          <Content component="p">{words("inventory.destroyInstance.text")}</Content>
          <ConfirmUserActionForm onSubmit={onSubmit} onCancel={closeModal} />
        </>
      ),
    });
  };

  return (
    <>
      <ToastAlert
        data-testid="ToastAlert"
        title={words("inventory.destroyInstance.failed")}
        message={errorMessage}
        setMessage={setErrorMessage}
      />
      <MenuItem
        itemId="expert-destroy"
        style={{
          backgroundColor: "var(--pf-t--global--color--nonstatus--red--default)",
        }}
        isDanger
        onClick={openModal}
        icon={<WarningTriangleIcon />}
      >
        {words("inventory.destroyInstance.button")}
      </MenuItem>
    </>
  );
};
