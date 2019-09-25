import * as React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppLayout } from '@app/AppLayout/AppLayout';
import { AppRoutes } from '@app/routes';
import '@app/app.css';
import { KeycloakInitOptions } from 'keycloak-js';
import { KeycloakProvider } from 'react-keycloak';

const keycloakInitConfig = { onLoad: 'login-required', flow: 'implicit' } as KeycloakInitOptions;

const App: React.FunctionComponent<{keycloak: Keycloak.KeycloakInstance}> = (props) => {
  return (
    <KeycloakProvider keycloak={props.keycloak} initConfig={keycloakInitConfig}>
      <Router>
        <AppLayout>
          <AppRoutes />
        </AppLayout>
      </Router>
    </KeycloakProvider>
  );
};

export { App };
