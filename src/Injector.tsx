import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  KeycloakAuthHelper,
  PrimaryFeatureManager,
  GetServerStatusStateHelper,
  BaseApiHelper,
  FileFetcherImpl,
  CommandResolverImpl,
  QueryResolverImpl,
  CommandManagerResolver,
  QueryManagerResolver,
  Store,
} from "@/Data";
import {
  PrimaryBaseUrlManager,
  PrimaryRouteManager,
  DependencyProvider,
  EnvironmentHandlerImpl,
  EnvironmentModifierImpl,
} from "@/UI";
import { UrlManagerImpl } from "@/UI/Utils";

interface Props {
  store: Store;
  keycloak: Keycloak.KeycloakInstance | undefined;
}

export const Injector: React.FC<Props> = ({ store, children, keycloak }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const baseUrlManager = new PrimaryBaseUrlManager(location.pathname);
  const consoleBaseUrl = baseUrlManager.getConsoleBaseUrl();
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const routeManager = new PrimaryRouteManager(consoleBaseUrl);
  const apiHelper = new BaseApiHelper(baseUrl, keycloak);
  const authHelper = new KeycloakAuthHelper(keycloak);
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolver(store, apiHelper)
  );
  const commandResolver = new CommandResolverImpl(
    new CommandManagerResolver(store, apiHelper, authHelper)
  );
  const featureManager = new PrimaryFeatureManager(
    new GetServerStatusStateHelper(store)
  );
  const urlManager = new UrlManagerImpl(featureManager, baseUrl);
  const fileFetcher = new FileFetcherImpl(apiHelper);
  const environmentModifier = new EnvironmentModifierImpl();
  const environmentHandler = new EnvironmentHandlerImpl(
    useLocation,
    navigate,
    routeManager
  );

  return (
    <DependencyProvider
      dependencies={{
        queryResolver,
        commandResolver,
        urlManager,
        fileFetcher,
        environmentModifier,
        featureManager,
        routeManager,
        environmentHandler,
        authHelper,
      }}
    >
      {children}
    </DependencyProvider>
  );
};
