import { InventoryContext } from "@/UI/Pages/ServiceInventory";
import { Button, Modal } from "@patternfly/react-core";
import { TrashAltIcon } from "@patternfly/react-icons";
import { KeycloakInstance } from "keycloak-js";
import React, { useState } from "react";
import { ActionDisabledTooltip } from "@/UI/Pages/ServiceInventory/Components";
import { words } from "@/UI/words";
import { DeleteForm } from "./DeleteForm";

interface Props {
  isDisabled?: boolean;
  instanceId: string;
  instanceVersion: number;
  serviceName: string;
  keycloak?: KeycloakInstance;
}

export const DeleteModal: React.FC<Props> = ({
  isDisabled,
  instanceId,
  instanceVersion,
  serviceName,
  keycloak,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleModalToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
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
        {words("inventory.deleteInstance.header")(instanceId, serviceName)}
        <InventoryContext.Consumer>
          {({ environmentId, inventoryUrl, setErrorMessage, refresh }) => {
            const requestParams = {
              environmentId,
              urlEndpoint: `${inventoryUrl}/${instanceId}?current_version=${instanceVersion}`,
              isEnvironmentIdRequired: true,
              setErrorMessage,
              keycloak: keycloak,
              dispatch: refresh,
              method: "DELETE",
            };
            return (
              <DeleteForm
                requestParams={requestParams}
                closeModal={() => setIsOpen(false)}
              />
            );
          }}
        </InventoryContext.Consumer>
      </Modal>
    </>
  );
};
