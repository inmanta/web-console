import React, { useContext, useState } from "react";
import { MenuItem, Text } from "@patternfly/react-core";
import { WarningTriangleIcon } from "@patternfly/react-icons";
import { Maybe, VersionedServiceInstanceIdentifier } from "@/Core";
import { ServiceInventoryContext } from "@/Slices/ServiceInventory/UI/ServiceInventory";
import { ToastAlert, ConfirmUserActionForm } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
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
  const [errorMessage, setErrorMessage] = useState("");
  const { commandResolver } = useContext(DependencyContext);
  const { refetch } = useContext(ServiceInventoryContext);

  const trigger = commandResolver.useGetTrigger<"DestroyInstance">({
    kind: "DestroyInstance",
    service_entity,
    id,
    version,
  });

  /**
   * async method that is closing modal and sending out the request to destroy the instance
   * if there is an error, it will set the error message
   *
   * @returns {Promise<void>}  A Promise that resolves when the operation is complete.
   */
  const onSubmit = async (): Promise<void> => {
    closeModal();
    const result = await trigger(refetch);

    if (Maybe.isSome(result)) {
      setErrorMessage(result.value);
    }
  };

  /**
   * Opens a modal with a confirmation form.
   */
  const openModal = () => {
    triggerModal({
      title: words("inventory.destroyInstance.title"),
      iconVariant: "danger",
      content: (
        <>
          <Text>
            {words("inventory.destroyInstance.header")(
              instance_identity,
              service_entity,
            )}
          </Text>
          <br />
          <Text>{words("inventory.destroyInstance.text")}</Text>
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
          backgroundColor: "var(--pf-v5-global--palette--red-50)",
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
