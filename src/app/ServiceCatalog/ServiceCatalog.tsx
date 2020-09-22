import * as React from 'react';
import { PageSection, Alert, AlertGroup } from '@patternfly/react-core';
import { CatalogDataList } from './CatalogDataList';
import { useStoreState, State, useStoreDispatch } from 'easy-peasy';
import { IStoreModel } from '@app/Models/CoreModels';
import { useInterval } from '@app/Hooks/UseInterval';
import { fetchInmantaApi } from '../utils/fetchInmantaApi';
import { useKeycloak } from 'react-keycloak';

const ServiceCatalog: React.FunctionComponent<any> = props => {
  const serviceCatalogUrl = '/lsm/v1/service_catalog';
  const projectStore = useStoreState((store: State<IStoreModel>) => store.projects);
  const storeDispatch = useStoreDispatch<IStoreModel>();
  const [errorMessage, setErrorMessage] = React.useState('');
  const environmentId = projectStore.environments.getSelectedEnvironment.id ? projectStore.environments.getSelectedEnvironment.id : '';
  const servicesOfEnvironment = projectStore.services.getServicesOfEnvironment(environmentId);
  const dispatch = (data) => storeDispatch.projects.services.updateServices(data);
  const shouldUseAuth = process.env.SHOULD_USE_AUTH === 'true' || (globalThis && globalThis.auth);
  const dispatchDelete = (data) => {
    const urlParts = data.urlEndpoint.split("/");
    const serviceName = urlParts[urlParts.length - 1];
    storeDispatch.projects.services.removeSingleService(serviceName);
  };
  let keycloak;
  if (shouldUseAuth) {
    // The value will be always true or always false during one session
    // tslint:disable:react-hooks-nesting
    [keycloak,] = useKeycloak()
  }
  const requestParams = { urlEndpoint: serviceCatalogUrl, dispatch, isEnvironmentIdRequired: true, environmentId, setErrorMessage, keycloak };
  React.useEffect(() => {
    fetchInmantaApi(requestParams);
  }, [dispatch, servicesOfEnvironment, requestParams]);
  useInterval(async () => await fetchInmantaApi(requestParams), 5000);

  return (
    <PageSection>
      {errorMessage && <Alert variant='danger' title={errorMessage} />}
      <CatalogDataList services={servicesOfEnvironment} environmentId={environmentId} serviceCatalogUrl={serviceCatalogUrl} keycloak={keycloak} dispatch={dispatchDelete} />
    </PageSection>
  );
};

export { ServiceCatalog };
