import * as React from 'react';
import { PageSection, Title } from '@patternfly/react-core';
import { CatalogDataList } from './CatalogDataList';
import { useStoreState, State, useStoreDispatch, Dispatch, Action } from 'easy-peasy';
import { IStoreModel } from '@app/Models/CoreModels';

const ServiceCatalog: React.FunctionComponent<any> = props => {
  const projectStore = useStoreState((store: State<IStoreModel>) => store.projects);
  const dispatch = useStoreDispatch<IStoreModel>();
  const environmentId = projectStore.environments.getSelectedEnvironment.id ? projectStore.environments.getSelectedEnvironment.id : '';
  const servicesOfEnvironment = projectStore.services.getServicesOfEnvironment(environmentId);
  React.useEffect(() => {
    if (environmentId) {
      fetchServiceCatalog(dispatch, environmentId);
      const interval = setInterval(() => fetchServiceCatalog(dispatch, environmentId), 5000);
      return () => clearInterval(interval);
    }
    return;
  }, [dispatch, environmentId, servicesOfEnvironment]);
  
  return (
    <PageSection>
      <Title size="lg">Service Catalog Page Title</Title>
      <CatalogDataList services={servicesOfEnvironment} />
    </PageSection>
  );
};

async function fetchServiceCatalog(dispatch: Dispatch<IStoreModel, Action<any>>, environmentId: string) {
  try {
    const result = await fetch(process.env.API_BASEURL + '/lsm/v1/service_catalog', {
      headers: {
        'X-Inmanta-Tid': environmentId
      }
    });
    const json = await result.json();
    dispatch.projects.services.updateServices(json.data);
  } catch (error) {
    throw error;
  }
}

export { ServiceCatalog };
