import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { Alert, PageSection } from '@patternfly/react-core';
import { DynamicImport } from '@app/DynamicImport';
import { accessibleRouteChangeHandler } from '@app/utils/utils';
import { Dashboard } from '@app/Dashboard/Dashboard';
import { NotFound } from '@app/NotFound/NotFound';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { LastLocationProvider, useLastLocation } from 'react-router-last-location';
import { ServiceCatalog } from './ServiceCatalog/ServiceCatalog';
import { ServiceInventory } from './ServiceInventory/ServiceInventory';
import { LifecycleManager } from './LifecycleManager/LifecycleManager';

let routeFocusTimer: number;

const getSupportModuleAsync = () => {
  return () => import(/* webpackChunkName: 'support' */ '@app/Support/Support');
};

const Support = (routeProps: RouteComponentProps) => {
  const lastNavigation = useLastLocation();
  return (
    <DynamicImport load={getSupportModuleAsync()} focusContentAfterMount={lastNavigation !== null}>
      {(Component: any) => {
        let loadedComponent: any;
        if (Component === null) {
          loadedComponent = (
            <PageSection aria-label="Loading Content Container">
              <div className="pf-l-bullseye">
                <Alert title="Loading" className="pf-l-bullseye__item" />
              </div>
            </PageSection>
          );
        } else {
          loadedComponent = <Component.Support {...routeProps} />;
        }
        return loadedComponent;
      }}
    </DynamicImport>
  );
};

export interface IAppRoute {
  label?: string;
  component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
  icon?: any;
  exact?: boolean;
  path: string;
  title: string;
  isAsync?: boolean;
}

export interface IAppRouteGroup {
  name: string, 
  pathPrefix: string, 
  exactRoutes: IAppRoute[]
}

const routes: IAppRouteGroup[] =
  [
    {
      name: 'Lifecycle service management',
      pathPrefix: '/lsm',
      exactRoutes: [
        {
          component: ServiceCatalog,
          exact: true,
          icon: null,
          label: 'Service Catalog',
          path: '/catalog',
          title: 'Service Catalog'
        },
        {
          component: ServiceInventory,
          exact: true,
          icon: null,
          label: 'Service Inventory',
          path: '/inventory',
          title: 'Service Inventory'
        },
        {
          component: LifecycleManager,
          exact: true,
          icon: null,
          label: 'Lifecycle Manager',
          path: '/manager',
          title: 'Lifecycle Manager'
        },
      ]
    },
    {
      name: 'Default',
      pathPrefix: '',
      exactRoutes: [{
        component: Dashboard,
        exact: true,
        icon: null,
        label: 'Dashboard',
        path: '/',
        title: 'Main Dashboard Title'
      },
      {
        component: Support,
        exact: true,
        icon: null,
        isAsync: true,
        label: 'Support',
        path: '/support',
        title: 'Support Page Title'
      }
      ]
    }
  ];

// a custom hook for sending focus to the primary content container
// after a view has loaded so that subsequent press of tab key
// sends focus directly to relevant content
const useA11yRouteChange = (isAsync: boolean) => {
  const lastNavigation = useLastLocation();
  React.useEffect(() => {
    if (!isAsync && lastNavigation !== null) {
      routeFocusTimer = accessibleRouteChangeHandler();
    }
    return () => {
      clearTimeout(routeFocusTimer);
    };
  }, [isAsync, lastNavigation]);
}

const RouteWithTitleUpdates = ({
  component: Component,
  isAsync = false,
  title,
  ...rest
}: IAppRoute) => {
  useA11yRouteChange(isAsync);
  useDocumentTitle(title);

  function routeWithTitle(routeProps: RouteComponentProps) {
    return (
      <Component {...rest} {...routeProps} />
    );
  }

  return <Route render={routeWithTitle} />;
};

const PageNotFound = ({ title }: { title: string }) => {
  useDocumentTitle(title);
  return <Route component={NotFound} />;
}

const AppRoutes = () => (
  <LastLocationProvider>
    <Switch>
      {routes.map((routeItem) => {
        return routeItem.exactRoutes.map(({ path, exact, component, title, isAsync, icon }, idx) => (
          <RouteWithTitleUpdates
            path={routeItem.pathPrefix + path}
            exact={exact}
            component={component}
            key={idx}
            icon={icon}
            title={title}
            isAsync={isAsync}
          />
        ))
      })
      }
      <PageNotFound title={'404 Page Not Found'} />
    </Switch>
  </LastLocationProvider>
);

export { AppRoutes, routes };
