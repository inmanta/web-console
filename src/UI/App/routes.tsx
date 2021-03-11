import * as React from "react";
import { Route, RouteComponentProps, Switch, Redirect } from "react-router-dom";
import { accessibleRouteChangeHandler } from "@/UI/App/utils/utils";
import { NotFound } from "@/UI/App/NotFound/NotFound";
import { useDocumentTitle } from "@/UI/App/utils/useDocumentTitle";
import {
  LastLocationProvider,
  useLastLocation,
} from "react-router-last-location";
import { CreateInstancePageWithProvider } from "@/UI/ServiceInstanceForm";
import {
  ServiceCatalogWithProvider,
  ServiceInstanceHistoryWithProvider,
  ServiceInventoryWithProvider,
} from "@/UI/Pages";

let routeFocusTimer: number;

interface IAppRoute {
  label?: string;
  component:
    | React.ComponentType<RouteComponentProps<any>> // eslint-disable-line @typescript-eslint/no-explicit-any
    | React.ComponentType<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  icon?: any;
  exact?: boolean;
  path: string;
  title: string;
  isAsync?: boolean;
  hideOnSideBar?: boolean;
}

interface IAppRouteGroup {
  name: string;
  pathPrefix: string;
  exactRoutes: IAppRoute[];
}

const routes: IAppRouteGroup[] = [
  {
    exactRoutes: [
      {
        component: ServiceCatalogWithProvider,
        exact: true,
        icon: null,
        label: "Service Catalog",
        path: "/catalog",
        title: "Service Catalog",
      },
      {
        component: ServiceInventoryWithProvider,
        exact: true,
        hideOnSideBar: true,
        icon: null,
        label: "Service Inventory",
        path: "/catalog/:id/inventory",
        title: "Service Inventory",
      },
      {
        component: CreateInstancePageWithProvider,
        exact: true,
        hideOnSideBar: true,
        icon: null,
        label: "Create Instance",
        path: "/catalog/:id/inventory/add",
        title: "Add Instance",
      },
      {
        component: ServiceInstanceHistoryWithProvider,
        exact: true,
        hideOnSideBar: true,
        icon: null,
        label: "Service Instance History",
        path: "/catalog/:id/inventory/:instanceId/history",
        title: "Service Instance History",
      },
    ],
    name: "Lifecycle service management",
    pathPrefix: "/lsm",
  },
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
};

const RouteWithTitleUpdates = ({
  component: Component,
  isAsync = false,
  title,
  ...rest
}: IAppRoute) => {
  useA11yRouteChange(isAsync);
  useDocumentTitle(title);

  function routeWithTitle(routeProps: RouteComponentProps) {
    return <Component {...rest} {...routeProps} />;
  }

  return <Route path={rest.path} exact={rest.exact} render={routeWithTitle} />;
};

const PageNotFound = ({ title }: { title: string }) => {
  useDocumentTitle(title);
  return <Route component={NotFound} />;
};

const AppRoutes: React.FC = () => (
  <LastLocationProvider>
    <Switch>
      {routes.map((routeItem) => {
        return routeItem.exactRoutes.map(
          ({ path, exact, component, title, isAsync, icon }, idx) => (
            <RouteWithTitleUpdates
              path={routeItem.pathPrefix + path}
              exact={exact}
              component={component}
              key={idx}
              icon={icon}
              title={title}
              isAsync={isAsync}
            />
          )
        );
      })}
      <Route
        exact={true}
        path="/"
        component={() => <Redirect to="/lsm/catalog" />}
      />
      <PageNotFound title={"404 Page Not Found"} />
    </Switch>
  </LastLocationProvider>
);

export { AppRoutes, routes };
