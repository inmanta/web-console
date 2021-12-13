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
  PrimaryArchiveHelper,
  PrimaryFileManager,
  PrimaryKeycloakController,
} from "@/Data";
import {
  PrimaryBaseUrlManager,
  PrimaryRouteManager,
  DependencyProvider,
  EnvironmentHandlerImpl,
  EnvironmentModifierImpl,
  UrlManagerImpl,
} from "@/UI";

interface Props {
  store: Store;
}

export const Injector: React.FC<Props> = ({ store, children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const keycloakController = new PrimaryKeycloakController(
    process.env.SHOULD_USE_AUTH,
    globalThis && globalThis.auth,
    process.env.KEYCLOAK_URL
  );
  const baseUrlManager = new PrimaryBaseUrlManager(location.pathname);
  const consoleBaseUrl = baseUrlManager.getConsoleBaseUrl();
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const routeManager = new PrimaryRouteManager(consoleBaseUrl);
  const apiHelper = new BaseApiHelper(
    baseUrl,
    keycloakController.getInstance()
  );
  const authHelper = new KeycloakAuthHelper(keycloakController.getInstance());
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
  const fileManager = new PrimaryFileManager();
  const archiveHelper = new PrimaryArchiveHelper(fileManager);

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
        archiveHelper,
      }}
    >
      {children}
    </DependencyProvider>
  );
};
