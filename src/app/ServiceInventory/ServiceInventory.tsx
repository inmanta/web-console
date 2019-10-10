import * as React from 'react';
import { PageSection, Title } from '@patternfly/react-core';
import { Dispatch, Action, useStoreState, State, useStoreDispatch } from 'easy-peasy';
import { IStoreModel } from '@app/Models/CoreModels';
import { InventoryTable } from './InventoryTable';

const ServiceInventory: React.FunctionComponent<any> = props => {
  const projectStore = useStoreState((store: State<IStoreModel>) => store.projects);
  const dispatch = useStoreDispatch<IStoreModel>();
  const instancesOfCurrentService = projectStore.serviceInstances.instancesOfService(props.match.params.id);
  
  React.useEffect(() => {
    if (projectStore.environments.getSelectedEnvironment.id && instancesOfCurrentService.length === 0) {
      fetchServiceInventory(dispatch, projectStore.environments.getSelectedEnvironment.id, props.match.params.id);
    }
  }, [props.match.params.id, projectStore.environments.getSelectedEnvironment.id, instancesOfCurrentService ]);

  return (
    <PageSection>
      <Title size="lg">Service Inventory</Title>
      {instancesOfCurrentService.length > 0 && <InventoryTable instances={instancesOfCurrentService} />}
      {instancesOfCurrentService.length === 0 && <div>No Instances found for service: {props.match.params.id}</div>}
    </PageSection>
  );
};

async function fetchServiceInventory(dispatch: Dispatch<IStoreModel, Action<any>>, environmentId: string, serviceName: string) {
  try {
    const result = await fetch(process.env.API_BASEURL + '/lsm/v1/service_inventory/' + serviceName, {
      headers: {
        'X-Inmanta-Tid': environmentId
      }
    });
    const json = await result.json();
    dispatch.projects.serviceInstances.addInstances(json.data);
  } catch (error) {
    throw error;
  }
}

export { ServiceInventory, fetchServiceInventory };
