import { Modal, Button } from "@patternfly/react-core"
import { useState } from "react";
import React from "react";
import { InstanceForm } from "./InstanceForm";
import { PlusIcon, EditIcon, TrashAltIcon } from "@patternfly/react-icons";
import { InventoryContext } from "./ServiceInventory";
import { IServiceInstanceModel, IAttributeModel } from "@app/Models/LsmModels";
import { DeleteForm } from "./DeleteForm";

const InstanceModal: React.FunctionComponent<{ buttonType: ButtonType, serviceName: string, instance?: IServiceInstanceModel, keycloak?: Keycloak.KeycloakInstance }> = props => {
  const [isOpen, setIsOpen] = useState(false);
  const handleModalToggle = () => {
    setIsOpen(!isOpen);
  };
  let ModalButton;
  let modalHeaderText = '';
  let modalTitle = '';
  if (props.buttonType === ButtonType.add) {
    ModalButton = () => <Button variant="primary" onClick={handleModalToggle} id="add-instance-button"><PlusIcon /> Add instance </Button>
    modalTitle = 'Create instance';
    modalHeaderText = `Create a new instance of ${props.serviceName} with the following parameters`
  } else if (props.buttonType === ButtonType.edit) {
    modalTitle = 'Edit instance';
    modalHeaderText = `Change attributes of instance ${props.instance ? props.instance.id : ''}`
    ModalButton = () => <Button variant="secondary" onClick={handleModalToggle}> <EditIcon /> Edit </Button>
  } else if (props.buttonType === ButtonType.delete) {
    modalTitle = 'Delete instance';
    modalHeaderText = `Are you sure you want to delete instance ${props.instance ? props.instance.id : ''} of service entity ${props.serviceName}?`
    ModalButton = () => <Button variant="danger" onClick={handleModalToggle}> <TrashAltIcon /> Delete </Button>
  }

  return (
    <React.Fragment>
      <ModalButton />
      <Modal isSmall={true} isOpen={isOpen}
        title={modalTitle} onClose={handleModalToggle}>
        {modalHeaderText}
        <InventoryContext.Consumer>
          {({ attributes, environmentId, inventoryUrl, setErrorMessage, refresh }) => {
            let urlWithParams = inventoryUrl;
            let currentAttributes;
            let formAttributes = attributes;
            if (props.instance) {
              urlWithParams = `${inventoryUrl}/${props.instance.id}?current_version=${props.instance.version}`;
              currentAttributes = props.instance.active_attributes;
              formAttributes = getEditableAttributes(attributes);
            } else {
              formAttributes = getNotReadonlyAttributes(attributes);
            }
            const requestParams = { environmentId, urlEndpoint: urlWithParams, isEnvironmentIdRequired: true, setErrorMessage, keycloak: props.keycloak, dispatch: refresh };
            if (props.buttonType === ButtonType.delete) {
              return <DeleteForm requestParams={requestParams} closeModal={() => setIsOpen(false)} />
            }
            return <InstanceForm attributeModels={formAttributes} requestParams={requestParams} closeModal={() => setIsOpen(false)} originalAttributes={currentAttributes} update={props.buttonType === ButtonType.edit} />
          }}

        </InventoryContext.Consumer>
      </Modal>
    </React.Fragment>);
}

enum ButtonType {
  add = "ADD",
  edit = "EDIT",
  delete = "DELETE",
}

function getEditableAttributes(attributes: IAttributeModel[]) {
  return attributes.filter((attribute) => attribute.modifier === "rw+");
}

function getNotReadonlyAttributes(attributes: IAttributeModel[]) {
  return attributes.filter((attribute) => attribute.modifier !== "r");
}

export { InstanceModal, ButtonType, getEditableAttributes, getNotReadonlyAttributes };