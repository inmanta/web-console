import React from "react";
import { useLocation } from "react-router-dom";
import { isJsonParserId, JsonParserId, SchedulerImpl } from "@/Core";
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
  BigIntJsonParser,
  NativeJsonParser,
  PrimaryLogger,
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
  const featureManager = new PrimaryFeatureManager(
    new GetServerStatusStateHelper(store),
    new PrimaryLogger(),
    getJsonParserId(globalThis),
    COMMITHASH
  );
  const keycloakController = new PrimaryKeycloakController(
    process.env.SHOULD_USE_AUTH,
    globalThis && globalThis.auth,
    process.env.KEYCLOAK_URL
  );
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname
  );
  const basePathname = baseUrlManager.getBasePathname();
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const routeManager = new PrimaryRouteManager(basePathname);
  const apiHelper = new BaseApiHelper(
    featureManager.getJsonParser() === "BigInt"
      ? new BigIntJsonParser()
      : new NativeJsonParser(),
    baseUrl,
    keycloakController.getInstance()
  );
  const authHelper = new KeycloakAuthHelper(keycloakController.getInstance());
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolver(
      store,
      apiHelper,
      new SchedulerImpl(5000),
      new SchedulerImpl(10000)
    )
  );
  const commandResolver = new CommandResolverImpl(
    new CommandManagerResolver(store, apiHelper, authHelper)
  );
  const urlManager = new UrlManagerImpl(featureManager, baseUrl);
  const fileFetcher = new FileFetcherImpl(apiHelper);
  const environmentModifier = EnvironmentModifierImpl();
  const environmentHandler = EnvironmentHandlerImpl(useLocation, routeManager);
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
        keycloakController,
      }}
    >
      {children}
    </DependencyProvider>
  );
};

const getJsonParserId = (container: unknown): JsonParserId | undefined => {
  if (typeof container !== "object") return undefined;
  if (container === null) return undefined;
  const id = container["jsonParserId"];
  if (typeof id !== "string") return undefined;
  if (!isJsonParserId(id)) return undefined;
  return id;
};
