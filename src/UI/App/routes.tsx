import React, { useContext } from "react";
import { DependencyManagerContext, DependencyProvider } from "@/UI/Dependency";
import {
  CreateInstancePageWithProvider,
  DiagnoseWithProvider,
  ServiceCatalogWithProvider,
  ServiceInstanceHistoryWithProvider,
  ServiceInventoryWithProvider,
  EventsWithProvider,
} from "@/UI/Pages";
import { RouteComponentProps } from "react-router-dom";
import { PageRouter } from "../Routing";

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
      {
        component: DiagnoseWithProvider,
        exact: true,
        hideOnSideBar: true,
        icon: null,
        label: "Diagnose Service Instance",
        path: "/catalog/:id/inventory/:instanceId/diagnose",
        title: "Diagnose Service Instance",
      },
      {
        component: EventsWithProvider,
        exact: true,
        hideOnSideBar: true,
        icon: null,
        label: "Service Instance Events",
        path: "/catalog/:id/inventory/:instanceId/events",
        title: "Service Instance Events",
      },
    ],
    name: "Lifecycle service management",
    pathPrefix: "/lsm",
  },
];

const AppRoutes: React.FC<{ environment: string }> = ({ environment }) => {
  const dependencyManager = useContext(DependencyManagerContext);
  const dependencies = dependencyManager.getDependencies(environment);

  return (
    <DependencyProvider dependencies={dependencies}>
      <PageRouter />
    </DependencyProvider>
  );
};

export { AppRoutes, routes };
