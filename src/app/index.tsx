import * as React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppLayout } from '@app/AppLayout/AppLayout';
import { AppRoutes } from '@app/routes';
import '@app/app.css';
import { KeycloakInitOptions } from 'keycloak-js';
import { KeycloakProvider } from 'react-keycloak';
import { createStore, StoreProvider } from 'easy-peasy';
import { IStoreModel, storeModel } from './Models/CoreModels';
import { fetchInmantaApi } from './utils/fetchInmantaApi';
import { Alert } from '@patternfly/react-core';

const keycloakInitConfig = { onLoad: 'login-required', flow: 'implicit' } as KeycloakInitOptions;
const storeInstance = createStore<IStoreModel>(storeModel);

const App: React.FunctionComponent<{ keycloak: Keycloak.KeycloakInstance }> = props => {
  const projectsEndpoint = '/api/v2/project';
  const dispatch = (data) => storeInstance.dispatch.projects.fetched(data);
  const [errorMessage, setErrorMessage] = React.useState('');
  const requestParams = {urlEndpoint: projectsEndpoint, dispatch, isEnvironmentIdRequired: false, environmentId: undefined, setErrorMessage};
  React.useEffect(() => {
    fetchInmantaApi(requestParams);
  }, []);
  const shouldUseAuth = process.env.SHOULD_USE_AUTH === 'true';
  const AppWithStore = (
    <StoreProvider store={storeInstance}>
      <Router>
        <AppLayout>
          {errorMessage && <Alert variant='danger' title={errorMessage}/>}
          <AppRoutes />
        </AppLayout>
      </Router>
    </StoreProvider>
  );

  if (shouldUseAuth) {
    return (
      <KeycloakProvider keycloak={props.keycloak} initConfig={keycloakInitConfig}>
        {AppWithStore}
      </KeycloakProvider>
    );
  }
  return AppWithStore;
};

export { App };
