import { Modal, Button, ModalVariant } from "@patternfly/react-core";
import { useState } from "react";
import React from "react";
import { InstanceForm } from "./InstanceForm";
import { PlusIcon, EditIcon, TrashAltIcon } from "@patternfly/react-icons";
import { InventoryContext } from "./ServiceInventory";
import { DeleteForm } from "./DeleteForm";
import _ from "lodash";
import {
  AttributeModel,
  ServiceInstanceModel,
  InstanceAttributeModel,
} from "@/Core";
import { ActionDisabledTooltip } from "@/UI/ServiceInventory/Components";

type PickedInstance = Pick<
  ServiceInstanceModel,
  | "id"
  | "version"
  | "candidate_attributes"
  | "active_attributes"
  | "rollback_attributes"
>;

const InstanceModal: React.FunctionComponent<{
  buttonType: ButtonType;
  serviceName: string;
  instance?: PickedInstance;
  keycloak?: Keycloak.KeycloakInstance;
  isDisabled?: boolean;
}> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleModalToggle = () => {
    setIsOpen(!isOpen);
  };
  let ModalButton;
  let modalHeaderText = "";
  let modalTitle = "";
  const AddModalButton = (
    <Button
      variant="primary"
      onClick={handleModalToggle}
      id="add-instance-button"
    >
      <PlusIcon /> Add instance
    </Button>
  );
  const EditModalButton = (
    <Button
      variant="secondary"
      onClick={handleModalToggle}
      isAriaDisabled={props.isDisabled}
      style={props.isDisabled ? { cursor: "not-allowed" } : {}}
    >
      <EditIcon /> Edit
    </Button>
  );
  const DeleteModalButton = (
    <Button
      variant="danger"
      onClick={handleModalToggle}
      isAriaDisabled={props.isDisabled}
      style={props.isDisabled ? { cursor: "not-allowed" } : {}}
    >
      <TrashAltIcon /> Delete
    </Button>
  );

  if (props.buttonType === ButtonType.add) {
    ModalButton = AddModalButton;
    modalTitle = "Create instance";
    modalHeaderText = `Create a new instance of ${props.serviceName} with the following parameters`;
  } else if (props.buttonType === ButtonType.edit) {
    modalTitle = "Edit instance";
    modalHeaderText = `Change attributes of instance ${
      props.instance ? props.instance.id : ""
    }`;
    ModalButton = (
      <ActionDisabledTooltip isDisabled={props.isDisabled}>
        {EditModalButton}
      </ActionDisabledTooltip>
    );
  } else if (props.buttonType === ButtonType.delete) {
    modalTitle = "Delete instance";
    modalHeaderText = `Are you sure you want to delete instance ${
      props.instance ? props.instance.id : ""
    } of service entity ${props.serviceName}?`;
    ModalButton = (
      <ActionDisabledTooltip isDisabled={props.isDisabled}>
        {DeleteModalButton}
      </ActionDisabledTooltip>
    );
  }

  return (
    <React.Fragment>
      {ModalButton}
      <Modal
        variant={ModalVariant.small}
        isOpen={isOpen}
        title={modalTitle}
        onClose={handleModalToggle}
      >
        {modalHeaderText}
        <InventoryContext.Consumer>
          {({
            attributes,
            environmentId,
            inventoryUrl,
            setErrorMessage,
            refresh,
          }) => {
            let urlWithParams = inventoryUrl.split("?")[0];
            let currentAttributes;
            let formAttributes = attributes;
            if (props.instance) {
              urlWithParams = `${urlWithParams}/${props.instance.id}?current_version=${props.instance.version}`;
              currentAttributes = getCurrentAttributes(props.instance);
              formAttributes = getEditableAttributes(attributes);
            } else {
              formAttributes = getNotReadonlyAttributes(attributes);
            }
            const requestParams = {
              environmentId,
              urlEndpoint: urlWithParams,
              isEnvironmentIdRequired: true,
              setErrorMessage,
              keycloak: props.keycloak,
              dispatch: refresh,
            };
            if (props.buttonType === ButtonType.delete) {
              return (
                <DeleteForm
                  requestParams={requestParams}
                  closeModal={() => setIsOpen(false)}
                />
              );
            }
            return (
              <InstanceForm
                attributeModels={formAttributes}
                requestParams={requestParams}
                closeModal={() => setIsOpen(false)}
                originalAttributes={currentAttributes}
                update={props.buttonType === ButtonType.edit}
              />
            );
          }}
        </InventoryContext.Consumer>
      </Modal>
    </React.Fragment>
  );
};

enum ButtonType {
  add = "ADD",
  edit = "EDIT",
  delete = "DELETE",
}

function getEditableAttributes(attributes: AttributeModel[]): AttributeModel[] {
  return attributes.filter((attribute) => attribute.modifier === "rw+");
}

function getNotReadonlyAttributes(
  attributes: AttributeModel[]
): AttributeModel[] {
  return attributes.filter((attribute) => attribute.modifier !== "r");
}
function getCurrentAttributes(
  instance: Pick<
    ServiceInstanceModel,
    "candidate_attributes" | "active_attributes"
  >
): InstanceAttributeModel | null {
  return instance.candidate_attributes &&
    !_.isEmpty(instance.candidate_attributes)
    ? instance.candidate_attributes
    : instance.active_attributes;
}

export {
  InstanceModal,
  ButtonType,
  getEditableAttributes,
  getNotReadonlyAttributes,
  getCurrentAttributes,
};
