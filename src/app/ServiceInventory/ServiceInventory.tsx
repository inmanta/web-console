import * as React from 'react';
import { PageSection, Title, Alert, Card, CardFooter, Toolbar, ToolbarGroup, AlertActionCloseButton } from '@patternfly/react-core';
import { useStoreState, State, useStoreDispatch } from 'easy-peasy';
import { IStoreModel } from '@app/Models/CoreModels';
import { InventoryTable } from './InventoryTable';
import { useInterval } from '@app/Hooks/UseInterval';
import { fetchInmantaApi, IRequestParams } from '@app/utils/fetchInmantaApi';
import { InstanceModal, ButtonType } from './InstanceModal';
import { IAttributeModel } from '@app/Models/LsmModels';

const ServiceInventory: React.FunctionComponent<any> = props => {
  const serviceName = props.match.params.id;
  const inventoryUrl = `/lsm/v1/service_inventory/${serviceName}`;
  const projectStore = useStoreState((store: State<IStoreModel>) => store.projects);
  const storeDispatch = useStoreDispatch<IStoreModel>();
  const [errorMessage, setErrorMessage] = React.useState('');
  const [instanceErrorMessage, setInstanceErrorMessage] = React.useState('');
  const instancesOfCurrentService = projectStore.serviceInstances.instancesOfService(serviceName);
  const environmentId = projectStore.environments.getSelectedEnvironment.id;
  const dispatchUpdateInstances = (data) => storeDispatch.projects.serviceInstances.updateInstances({ serviceName, instances: data });
  const requestParams = { urlEndpoint: inventoryUrl, dispatch: dispatchUpdateInstances, isEnvironmentIdRequired: true, environmentId, setErrorMessage };
  const dispatchEntity = (data) => storeDispatch.projects.services.addSingleService(data);
  ensureServiceEntityIsLoaded(projectStore, serviceName, { urlEndpoint: `/lsm/v1/service_catalog/${serviceName}`, dispatch: dispatchEntity, isEnvironmentIdRequired: true, environmentId, setErrorMessage });
  React.useEffect(() => {
    fetchInmantaApi(requestParams);
  }, [storeDispatch, serviceName, instancesOfCurrentService, requestParams]);
  useInterval(() => fetchInmantaApi(requestParams), 5000);
  const serviceEntity = projectStore.services.byId[serviceName];
  return (
    <PageSection>
      {serviceEntity && <InventoryContext.Provider value={{ attributes: serviceEntity.attributes, environmentId, inventoryUrl, setErrorMessage: setInstanceErrorMessage }} >
        {errorMessage && <Alert variant='danger' title={errorMessage} action={<AlertActionCloseButton onClose={() => setErrorMessage('')} />} />}
        {instanceErrorMessage && <Alert variant='danger' title={instanceErrorMessage} action={<AlertActionCloseButton onClose={() => setInstanceErrorMessage('')} />} />}
        <Card>
          <CardFooter><Toolbar>
            <ToolbarGroup> Showing instances of {serviceName} </ToolbarGroup>
            <ToolbarGroup>
              <InstanceModal buttonType={ButtonType.add} serviceName={serviceEntity.name} />
            </ToolbarGroup>
          </Toolbar></CardFooter>
        </Card>
        {instancesOfCurrentService.length > 0 && <InventoryTable instances={instancesOfCurrentService} />}
      </InventoryContext.Provider>}
    </PageSection>
  );
};

async function ensureServiceEntityIsLoaded(projectStore, serviceName: string, requestParams: IRequestParams) {
  const serviceEntity = projectStore.services.byId[serviceName];
  if (serviceEntity) {
    return;
  }
  await fetchInmantaApi(requestParams);
}

interface IInventoryContextData {
  attributes: IAttributeModel[];
  environmentId: string | undefined;
  inventoryUrl: string;
  setErrorMessage: React.Dispatch<string>;
}

const InventoryContext = React.createContext({} as IInventoryContextData);



export { ServiceInventory, InventoryContext, IInventoryContextData };

// stack_name: stack2
// openstack_url: http://node1.ii.inmanta.com:5000/v3
// public_ssh_key: ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCh2lbsVGRGMFWJO9D+0vjJ/GlJJhYdq2KyoIbFYZtBuRtFMVuzFRdHHbpf4dX9cqOAfpNlajifbGCRBrGgP2QDxWJ5xR0oLJ14mAXxlcjejv8rFzOty2eYGcPuQ8B46wjLwfHGC8Jtb1D7EEebgOb0CM0c/30gyzt6IEltCXvY6gy1e7Vkkchy5y4O9YFNNeVtPBNQNGb3bvqGBDze113MqkbZIk6BGt+mTSNgHqgVGVLWBheixEluE87bW11dZ1+Su1cApRlHx3uSjV/mDZXbShEfpwYCnqkXff/y05fC3haCnOPHKIAPW2nhydoZ/rQ+nbbazX+C2sMSy5mEUfPj
// openstack_project: demo
// seperate_database: true
// openstack_password: demo
// openstack_username: demo
// openstack_public_network: internal