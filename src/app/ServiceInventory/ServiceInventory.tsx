import * as React from 'react';
import { PageSection, Title, Alert } from '@patternfly/react-core';
import { useStoreState, State, useStoreDispatch } from 'easy-peasy';
import { IStoreModel } from '@app/Models/CoreModels';
import { InventoryTable } from './InventoryTable';
import { useInterval } from '@app/Hooks/UseInterval';
import { fetchInmantaApi } from '@app/utils/fetchInmantaApi';

const ServiceInventory: React.FunctionComponent<any> = props => {
  const serviceName = props.match.params.id;
  const invetoryUrl = `/lsm/v1/service_inventory/${serviceName}`;
  const projectStore = useStoreState((store: State<IStoreModel>) => store.projects);
  const storeDispatch = useStoreDispatch<IStoreModel>();
  const [errorMessage, setErrorMessage] = React.useState('');
  const instancesOfCurrentService = projectStore.serviceInstances.instancesOfService(serviceName);
  const environmentId = projectStore.environments.getSelectedEnvironment.id;
  const dispatch = (data) => storeDispatch.projects.serviceInstances.updateInstances({ serviceName, instances: data });
  const requestParams = { urlEndpoint: invetoryUrl, dispatch, isEnvironmentIdRequired: true, environmentId, setErrorMessage };
  React.useEffect(() => {
    fetchInmantaApi(requestParams);
  }, [storeDispatch, serviceName, instancesOfCurrentService, requestParams]);
  useInterval(() => fetchInmantaApi(requestParams), 5000);

  return (
    <PageSection>
      <Title size="lg">Service Inventory</Title>
      {errorMessage && <Alert variant='danger' title={errorMessage} />}
      {instancesOfCurrentService.length > 0 && <InventoryTable instances={instancesOfCurrentService} />}
      {(!errorMessage && instancesOfCurrentService.length === 0) && <Alert variant='info' title={`No Instances found for service: ${serviceName}`} />}
    </PageSection>
  );
};

export { ServiceInventory };
