import { useState } from "react";
import React from "react";
import { Button, Modal, Alert } from "@patternfly/react-core";
import { ServiceInstanceModel } from "@/Core";
import { useStoreState, useStoreDispatch } from "@/UI/Store";
import { ResourceTable } from "./ResourceTable";
import { fetchInmantaApi } from "@app/utils/fetchInmantaApi";

export type ServiceInstanceForResources = Pick<
  ServiceInstanceModel,
  "id" | "service_entity" | "version" | "environment"
>;

export const ResourceModal: React.FunctionComponent<{
  instance: ServiceInstanceForResources;
  keycloak?: Keycloak.KeycloakInstance;
}> = (props) => {
  const instance = props.instance;
  const storeDispatch = useStoreDispatch();
  const resources = useStoreState((store) => store.projects.resources);
  const resourcesOfInstance = resources.resourcesOfInstance(instance.id);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const dispatch = (data) =>
    storeDispatch.projects.resources.addResources({
      instanceId: instance.id,
      resources: data,
    });
  const resourceUrl = `/lsm/v1/service_inventory/${instance.service_entity}/${instance.id}/resources?current_version=${instance.version}`;
  const requestParams = {
    urlEndpoint: resourceUrl,
    dispatch,
    isEnvironmentIdRequired: true,
    environmentId: instance.environment,
    setErrorMessage,
    keycloak: props.keycloak,
  };

  const handleModalToggle = () => {
    if (!isOpen) {
      fetchInmantaApi(requestParams);
    }
    setIsOpen(!isOpen);
  };

  return (
    <React.Fragment>
      <Button variant="primary" onClick={handleModalToggle}>
        Show Resources
      </Button>
      <Modal
        title="Resources"
        isOpen={isOpen}
        onClose={handleModalToggle}
        actions={[
          <Button key="close" variant="primary" onClick={handleModalToggle}>
            Close
          </Button>,
        ]}
      >
        {errorMessage && <Alert variant="danger" title={errorMessage} />}
        {resourcesOfInstance.length > 0 && (
          <ResourceTable resources={resourcesOfInstance} />
        )}
        {!errorMessage && resourcesOfInstance.length === 0 && (
          <Alert
            variant="info"
            title={`No resources found for instance ${instance.id}`}
          />
        )}
      </Modal>
    </React.Fragment>
  );
};
