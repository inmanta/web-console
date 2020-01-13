import * as React from 'react';
import { PageSection, Alert } from '@patternfly/react-core';
import { CatalogDataList } from './CatalogDataList';
import { useStoreState, State, useStoreDispatch } from 'easy-peasy';
import { IStoreModel } from '@app/Models/CoreModels';
import { useInterval } from '@app/Hooks/UseInterval';
import { fetchInmantaApi } from '../utils/fetchInmantaApi';

const ServiceCatalog: React.FunctionComponent<any> = props => {
  const serviceCatalogUrl = '/lsm/v1/service_catalog';
  const projectStore = useStoreState((store: State<IStoreModel>) => store.projects);
  const storeDispatch = useStoreDispatch<IStoreModel>();
  const [errorMessage, setErrorMessage] = React.useState('');
  const environmentId = projectStore.environments.getSelectedEnvironment.id ? projectStore.environments.getSelectedEnvironment.id : '';
  const servicesOfEnvironment = projectStore.services.getServicesOfEnvironment(environmentId);
  const dispatch = (data) => storeDispatch.projects.services.updateServices(data);
  const requestParams = { urlEndpoint: serviceCatalogUrl, dispatch, isEnvironmentIdRequired: true, environmentId, setErrorMessage };
  React.useEffect(() => {
    fetchInmantaApi(requestParams);
  }, [dispatch, servicesOfEnvironment, requestParams]);
  useInterval(() => fetchInmantaApi(requestParams), 5000);

  return (
    <PageSection>
      {errorMessage && <Alert variant='danger' title={errorMessage} />}
      <CatalogDataList services={servicesOfEnvironment} environmentId={environmentId} serviceCatalogUrl={serviceCatalogUrl} />
    </PageSection>
  );
};

export { ServiceCatalog };
