import * as React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppLayout } from '@app/AppLayout/AppLayout';
import { AppRoutes } from '@app/routes';
import '@app/app.css';
import { KeycloakInitOptions } from 'keycloak-js';
import { KeycloakProvider } from 'react-keycloak';
import { createStore, StoreProvider } from 'easy-peasy';
import { IStoreModel, storeModel } from './Models/core-models';


const keycloakInitConfig = { onLoad: 'login-required', flow: 'implicit' } as KeycloakInitOptions;
const storeInstance = createStore<IStoreModel>(storeModel);

storeInstance.dispatch.projects.fetch();

const App: React.FunctionComponent<{ keycloak: Keycloak.KeycloakInstance }> = (props) => {
  const shouldUseAuth = process.env.SHOULD_USE_AUTH === "true";
  if (shouldUseAuth) {
    return (
      <KeycloakProvider keycloak={props.keycloak} initConfig={keycloakInitConfig}>
        <StoreProvider store={storeInstance}>
          <Router>
            <AppLayout>
              <AppRoutes />
            </AppLayout>
          </Router>
        </StoreProvider>
      </KeycloakProvider>
    );
  }
  return (
    <StoreProvider store={storeInstance}>
      <Router>
        <AppLayout>
          <AppRoutes />
        </AppLayout>
      </Router>
    </StoreProvider>
  );


};

export { App };
