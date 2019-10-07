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

const keycloakInitConfig = { onLoad: 'login-required', flow: 'implicit' } as KeycloakInitOptions;
const storeInstance = createStore<IStoreModel>(storeModel);

storeInstance.dispatch.projects.fetch();

const App: React.FunctionComponent<{ keycloak: Keycloak.KeycloakInstance }> = props => {
  const shouldUseAuth = process.env.SHOULD_USE_AUTH === 'true';
  const AppWithStore = (
    <StoreProvider store={storeInstance}>
      <Router>
        <AppLayout>
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
