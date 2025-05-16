import React, { useContext } from "react";
import { useLocation } from "react-router";
import { isJsonParserId, JsonParserId } from "@/Core";
import {
  PrimaryFeatureManager,
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

/**
 * This component creates instances of managers, helpers, and resolvers, and provides them through a `DependencyProvider`.
 * It also contains `ModalProvider` and an `UpdateBanner`.
 *
 * @props {Props} props - The properties passed to the component.
 * @prop {React.ReactNode} children - The children to be rendered within the Injector.
 * @returns {React.FC<React.PropsWithChildren<Props>>} A `DependencyProvider` that wraps a `ModalProvider`, an `UpdateBanner`, and the children.
 */
export const Injector: React.FC<React.PropsWithChildren> = ({ children }) => {
  const authHelper = useContext(AuthContext);
  const featureManager = PrimaryFeatureManager(
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

  const urlManager = new UrlManagerImpl(featureManager, baseUrl);
  const environmentHandler = EnvironmentHandlerImpl(useLocation, routeManager);
  const environmentModifier = useEnvironmentModifierImpl();
  const fileManager = new PrimaryFileManager();
  const archiveHelper = new PrimaryArchiveHelper(fileManager);

  return (
    <DependencyProvider
      dependencies={{
        urlManager,
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
