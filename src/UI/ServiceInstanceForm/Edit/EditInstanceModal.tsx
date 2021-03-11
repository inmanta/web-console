import { words } from "@/UI";
import { ActionDisabledTooltip } from "@/UI/ServiceInventory/Components";
import { ServiceInstanceForAction } from "@/UI/ServiceInventory/Presenters";
import { InventoryContext } from "@/UI/Pages/ServiceInventory";
import { Button, Modal, ModalVariant } from "@patternfly/react-core";
import { EditIcon } from "@patternfly/react-icons";
import { KeycloakInstance } from "keycloak-js";
import React, { useState } from "react";
import { AttributeConverter, FormAttributeResult, submitUpdate } from "..";
import { EditFormPresenter } from "./EditFormPresenter";

interface Props {
  isDisabled?: boolean;
  instance: ServiceInstanceForAction;
  keycloak?: KeycloakInstance;
}
export const EditInstanceModal: React.FC<Props> = ({
  isDisabled,
  instance,
  keycloak,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleModalToggle = () => {
    setIsOpen(!isOpen);
  };
  const editFormPresenter = new EditFormPresenter(new AttributeConverter());
  return (
    <>
      <ActionDisabledTooltip isDisabled={isDisabled}>
        <Button
          variant="secondary"
          onClick={handleModalToggle}
          isAriaDisabled={isDisabled}
          style={isDisabled ? { cursor: "not-allowed" } : {}}
        >
          <EditIcon /> {words("inventory.editInstance.button")}
        </Button>
      </ActionDisabledTooltip>
      <Modal
        variant={ModalVariant.small}
        isOpen={isOpen}
        title={words("inventory.editInstance.title")}
        onClose={handleModalToggle}
      >
        <InventoryContext.Consumer>
          {({ attributes, setErrorMessage, refresh }) => {
            const dispatch = (data) => {
              setIsOpen(false);
              refresh(data);
            };
            const onSubmit = (
              serviceInstance: ServiceInstanceForAction,
              formAttributes: FormAttributeResult[]
            ) => {
              submitUpdate(
                serviceInstance,
                formAttributes,
                setErrorMessage,
                dispatch,
                keycloak
              );
            };
            return editFormPresenter.presentForm(
              instance,
              attributes,
              onSubmit,
              () => setIsOpen(false)
            );
          }}
        </InventoryContext.Consumer>
      </Modal>
    </>
  );
};
