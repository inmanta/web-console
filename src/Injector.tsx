import React from "react";
import { useHistory } from "react-router-dom";
import { BaseApiHelper, FileFetcherImpl } from "@/Data/API";
import { KeycloakAuthHelper } from "@/Data/Auth";
import { PrimaryFeatureManager } from "@/Data/Common";
import {
  CommandResolverImpl,
  QueryResolverImpl,
  CommandManagerResolver,
  QueryManagerResolver,
} from "@/Data/Resolvers";
import { Store } from "@/Data/Store";
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
  const history = useHistory();
  const baseUrlManager = new PrimaryBaseUrlManager(location.pathname);
  const consoleBaseUrl = baseUrlManager.getConsoleBaseUrl();
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const routeManager = new PrimaryRouteManager(consoleBaseUrl);
  const apiHelper = new BaseApiHelper(baseUrl, keycloak);
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolver(store, apiHelper)
  );
  const commandResolver = new CommandResolverImpl(
    new CommandManagerResolver(
      store,
      apiHelper,
      new KeycloakAuthHelper(keycloak)
    )
  );
  const featureManager = new PrimaryFeatureManager();
  const urlManager = new UrlManagerImpl(featureManager, baseUrl);
  const fileFetcher = new FileFetcherImpl(apiHelper);
  const environmentModifier = new EnvironmentModifierImpl();
  const environmentHandler = new EnvironmentHandlerImpl(history, routeManager);

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
      }}
    >
      {children}
    </DependencyProvider>
  );
};
