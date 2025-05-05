import React, { useContext } from "react";
import { useLocation } from "react-router";
import { isJsonParserId, JsonParserId, SchedulerImpl } from "@/Core";
import {
  PrimaryFeatureManager,
  BaseApiHelper,
  FileFetcherImpl,
  CommandResolverImpl,
  QueryResolverImpl,
  CommandManagerResolverImpl,
  QueryManagerResolverImpl,
  Store,
  PrimaryArchiveHelper,
  PrimaryFileManager,
  PrimaryLogger,
} from "@/Data";
import {
  PrimaryBaseUrlManager,
  PrimaryRouteManager,
  DependencyProvider,
  EnvironmentHandlerImpl,
  useEnvironmentModifierImpl,
  UrlManagerImpl,
} from "@/UI";
import { AuthContext } from "./Data/Auth/";
import { UpdateBanner } from "./UI/Components/UpdateBanner";
import { ModalProvider } from "./UI/Root/Components/ModalProvider";

interface Props {
  store: Store;
}

/**
 * This component creates instances of managers, helpers, and resolvers, and provides them through a `DependencyProvider`.
 * It also contains `ModalProvider` and an `UpdateBanner`.
 *
 * @props {Props} props - The properties passed to the component.
 * @prop {Store} store - The store to be used by the managers and resolvers.
 * @prop {React.ReactNode} children - The children to be rendered within the Injector.
 * @returns {React.FC<React.PropsWithChildren<Props>>} A `DependencyProvider` that wraps a `ModalProvider`, an `UpdateBanner`, and the children.
 */
export const Injector: React.FC<React.PropsWithChildren<Props>> = ({ store, children }) => {
  const authHelper = useContext(AuthContext);
  const featureManager = new PrimaryFeatureManager(
    new PrimaryLogger(),
    getJsonParserId(globalThis),
    COMMITHASH,
    APP_VERSION
  );

  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname
  );
  const basePathname = baseUrlManager.getBasePathname();
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const routeManager = PrimaryRouteManager(basePathname);
  const apiHelper = BaseApiHelper(baseUrl, authHelper);
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolverImpl(
      store,
      apiHelper,
      new SchedulerImpl(5000),
      new SchedulerImpl(10000)
    )
  );
  const commandResolver = new CommandResolverImpl(new CommandManagerResolverImpl(store, apiHelper));
  const urlManager = new UrlManagerImpl(featureManager, baseUrl);
  const fileFetcher = new FileFetcherImpl(apiHelper);
  const environmentModifier = useEnvironmentModifierImpl();
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
        archiveHelper,
        authHelper,
      }}
    >
      <ModalProvider>
        <UpdateBanner />
        {children}
      </ModalProvider>
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
