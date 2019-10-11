import { useState } from "react";
import React from "react";
import { Button, Modal } from "@patternfly/react-core";
import { IServiceInstanceModel } from "@app/Models/LsmModels";
import { IStoreModel } from "@app/Models/CoreModels";
import { Action, Dispatch, useStoreDispatch, useStoreState, State } from "easy-peasy";
import { ResourceTable } from "./ResourceTable";

export const ResourceModal: React.FunctionComponent<{ instance: IServiceInstanceModel }> = props => {
  const instance = props.instance;
  const dispatch = useStoreDispatch<IStoreModel>();
  const resources = useStoreState((store: State<IStoreModel>) => store.projects.resources);
  const resourcesOfInstance = resources.resourcesOfInstance(instance.id);
  const [isOpen, setIsOpen] = useState(false);

  const handleModalToggle = () => {
    if (!isOpen) {
      fetchResources(dispatch, instance);
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
            </Button>
        ]}
        isFooterLeftAligned={true}
      >
        {resourcesOfInstance.length > 0 && <ResourceTable resources={resourcesOfInstance} />}
        {resourcesOfInstance.length === 0 && <div>No resources found for instance {instance.id}</div>}
      </Modal>
    </React.Fragment>
  );
}

async function fetchResources(dispatch: Dispatch<IStoreModel, Action<any>>, instance: IServiceInstanceModel) {
  try {
    const result = await fetch(`${process.env.API_BASEURL}/lsm/v1/service_inventory/${instance.service_entity}/${instance.id}/resources?current_version=${instance.version}`, {
      headers: {
        'X-Inmanta-Tid': instance.environment
      }
    });
    const json = await result.json();
    dispatch.projects.resources.addResources({ instanceId: instance.id, resources: json.data });
  } catch (error) {
    throw error;
  }
}