import * as React from 'react';
import { PageSection, Title } from '@patternfly/react-core';
import { Dispatch, Action, useStoreState, State, useStoreDispatch } from 'easy-peasy';
import { IStoreModel } from '@app/Models/CoreModels';
import { InventoryTable } from './InventoryTable';
import { useInterval } from '@app/UseInterval';

const ServiceInventory: React.FunctionComponent<any> = props => {
  const projectStore = useStoreState((store: State<IStoreModel>) => store.projects);
  const dispatch = useStoreDispatch<IStoreModel>();
  const instancesOfCurrentService = projectStore.serviceInstances.instancesOfService(props.match.params.id);
  const environmentId = projectStore.environments.getSelectedEnvironment.id;
  
  React.useEffect(() => {
    fetchServiceInventory(dispatch, environmentId, props.match.params.id);
  }, [dispatch, props.match.params.id, environmentId, instancesOfCurrentService]);
  useInterval(() => fetchServiceInventory(dispatch, environmentId, props.match.params.id), 5000);

  return (
    <PageSection>
      <Title size="lg">Service Inventory</Title>
      {instancesOfCurrentService.length > 0 && <InventoryTable instances={instancesOfCurrentService} />}
      {instancesOfCurrentService.length === 0 && <div>No Instances found for service: {props.match.params.id}</div>}
    </PageSection>
  );
};

async function fetchServiceInventory(dispatch: Dispatch<IStoreModel, Action<any>>, environmentId: string | undefined, serviceName: string) {
  try {
    if (environmentId) {
      const result = await fetch(process.env.API_BASEURL + '/lsm/v1/service_inventory/' + serviceName, {
        headers: {
          'X-Inmanta-Tid': environmentId
        }
      });
      const json = await result.json();
      dispatch.projects.serviceInstances.updateInstances({ serviceName, instances: json.data });
    }
  } catch (error) {
    throw error;
  }
}

export { ServiceInventory, fetchServiceInventory };
