import React, { useContext } from "react";
import { useLocation } from "react-router";
import { isJsonParserId, JsonParserId } from "@/Core";
import { PrimaryFeatureManager, PrimaryArchiveHelper, PrimaryFileManager } from "@/Data";
import {
  PrimaryBaseUrlManager,
  PrimaryRouteManager,
  DependencyProvider,
  EnvironmentHandlerImpl,
  UrlManagerImpl,
  words,
} from "@/UI";
import { AuthContext } from "./Data/Auth/";
import { useGetEnvironments } from "./Data/Managers/V2/Environment/GetEnvironments";
import { useGetServerStatus } from "./Data/Managers/V2/Server";
import { ErrorView } from "./UI/Components/ErrorView";
import { LoadingView } from "./UI/Components/LoadingView";
import { UpdateBanner } from "./UI/Components/UpdateBanner";
import { ModalProvider } from "./UI/Root/Components/ModalProvider";

/**
 * This component creates instances of managers, helpers, and resolvers, and provides them through a `DependencyProvider`.
 * It also contains `ModalProvider` and an `UpdateBanner`.
 *
 * @props {Props} props - The properties passed to the component.
 * @prop {React.ReactNode} children - The children to be rendered within the Injector.
 * @returns {React.FC<React.PropsWithChildren<Props>>} A `DependencyProvider` that wraps a `ModalProvider`, an `UpdateBanner`, and the children.
 */
export const Injector: React.FC<React.PropsWithChildren> = ({ children }) => {
  const serverStatus = useGetServerStatus().useOneTime();
  const environments = useGetEnvironments().useOneTime();
  const authHelper = useContext(AuthContext);
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname
  );
  const basePathname = baseUrlManager.getBasePathname();
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const routeManager = PrimaryRouteManager(basePathname);
  const featureManager = PrimaryFeatureManager(
    getJsonParserId(globalThis),
    COMMITHASH,
    APP_VERSION,
    serverStatus.data
  );
  const urlManager = new UrlManagerImpl(featureManager, baseUrl);
  const environmentHandler = EnvironmentHandlerImpl(
    useLocation,
    routeManager,
    environments.data || []
  );
  const fileManager = new PrimaryFileManager();
  const archiveHelper = new PrimaryArchiveHelper(fileManager);

  if (environments.isError || serverStatus.isError) {
    const message = environments.error?.message || serverStatus.error?.message || words("error");
    return <ErrorView ariaLabel="Injector-Error" message={message} />;
  }

  if (environments.isSuccess && serverStatus.isSuccess) {
    return (
      <DependencyProvider
        dependencies={{
          urlManager,
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
  }

  return <LoadingView ariaLabel="Injector-Loading" />;
};

const getJsonParserId = (container: unknown): JsonParserId | undefined => {
  if (typeof container !== "object") return undefined;

  if (container === null) return undefined;

  const id = container["jsonParserId"];

  if (typeof id !== "string") return undefined;

  if (!isJsonParserId(id)) return undefined;

  return id;
};
