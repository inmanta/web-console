import React from "react";
import { useLocation } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { isJsonParserId, JsonParserId, SchedulerImpl } from "@/Core";
import {
  KeycloakAuthHelper,
  PrimaryFeatureManager,
  GetServerStatusStateHelper,
  BaseApiHelper,
  FileFetcherImpl,
  CommandResolverImpl,
  QueryResolverImpl,
  CommandManagerResolverImpl,
  QueryManagerResolverImpl,
  Store,
  PrimaryArchiveHelper,
  PrimaryFileManager,
  PrimaryAuthController,
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
import { UpdateBanner } from "./UI/Components/UpdateBanner";
interface Props {
  store: Store;
}

export const Injector: React.FC<React.PropsWithChildren<Props>> = ({
  store,
  children,
}) => {
  const featureManager = new PrimaryFeatureManager(
    GetServerStatusStateHelper(store),
    new PrimaryLogger(),
    getJsonParserId(globalThis),
    COMMITHASH,
    APP_VERSION,
  );

  const authController = new PrimaryAuthController(
    process.env.SHOULD_USE_AUTH,
    globalThis && globalThis.auth,
    process.env.KEYCLOAK_URL,
  );
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const basePathname = baseUrlManager.getBasePathname();
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const routeManager = PrimaryRouteManager(basePathname);
  const apiHelper = new BaseApiHelper(
    baseUrl,
    authController.shouldAuthLocally(),
    authController.getInstance(),
  );
  const authHelper = new KeycloakAuthHelper(authController.getInstance());
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolverImpl(
      store,
      apiHelper,
      new SchedulerImpl(5000),
      new SchedulerImpl(10000),
    ),
  );
  const commandResolver = new CommandResolverImpl(
    new CommandManagerResolverImpl(store, apiHelper, authHelper),
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
        authController,
      }}
    >
      <UpdateBanner apiHelper={apiHelper} />
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
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
