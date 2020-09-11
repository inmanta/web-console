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
import { Alert, Spinner, AlertActionCloseButton, Bullseye } from '@patternfly/react-core';

const keycloakInitConfig = { onLoad: 'login-required', flow: 'implicit' } as KeycloakInitOptions;
const storeInstance = createStore<IStoreModel>(storeModel);

const App: React.FunctionComponent<{ keycloak: Keycloak.KeycloakInstance, shouldUseAuth: boolean }> = props => {
  const [errorMessage, setErrorMessage] = React.useState('');
  const shouldAddBaseName = process.env.NODE_ENV === 'production';

  const AppWithStore = (
    <StoreProvider store={storeInstance}>
      <Router basename={shouldAddBaseName ? "/console" : "/"}>
        <AppLayout keycloak={props.shouldUseAuth ? props.keycloak : undefined} setErrorMessage={setErrorMessage} shouldUseAuth={props.shouldUseAuth}>
          {errorMessage && <Alert variant='danger' title={errorMessage} actionClose={<AlertActionCloseButton onClose={() => setErrorMessage('')}/>}/>}
          <AppRoutes />
        </AppLayout>
      </Router>
    </StoreProvider>
  );
  const LoadingSpinner = () => <Bullseye>
    <Spinner size="xl"/>
  </Bullseye>;

  if (props.shouldUseAuth) {
    return (
      <KeycloakProvider keycloak={props.keycloak} initConfig={keycloakInitConfig} LoadingComponent={<LoadingSpinner />}>
        {AppWithStore}
      </KeycloakProvider>
    );
  }
  return AppWithStore;
};

export { App };
