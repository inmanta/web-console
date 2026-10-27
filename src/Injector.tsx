import React, { useContext } from "react";
import { useLocation } from "react-router";
import {
  FeatureModule,
  getFeatureRoutes,
  isJsonParserId,
  JsonParserId,
} from "@inmanta/web-console-core";
import { AuthContext } from "@inmanta/web-console-core/Auth";
import {
  OrchestratorProvider,
  PrimaryArchiveHelper,
  PrimaryFileManager,
} from "@inmanta/web-console-core/Common";
import { DependencyProvider } from "@inmanta/web-console-core/Dependency";
import { EnvironmentHandlerImpl } from "@inmanta/web-console-core/Dependency/EnvironmentHandler";
import { PrimaryBaseUrlManager } from "@inmanta/web-console-core/Routing";
import { PrimaryRouteManager } from "@inmanta/web-console-core/Routing/PrimaryRouteManager";
import { UrlManagerImpl } from "@inmanta/web-console-ui/Utils";
import { AppAlertProvider } from "./UI/Root/Components/AppAlertProvider";
import { ModalProvider } from "./UI/Root/Components/ModalProvider";

interface Props {
  features: FeatureModule[];
}

/**
 * This component creates instances of managers, helpers, and resolvers, and provides them through a `DependencyProvider`.
 * It also contains `ModalProvider` and `AppAlertProvider`.
 *
 * @props {Props} props - The properties passed to the component.
 * @prop {FeatureModule[]} features - The features the app ships. The route table is built from their routes.
 * @prop {React.ReactNode} children - The children to be rendered within the Injector.
 * @returns {React.FC<React.PropsWithChildren<Props>>} A `DependencyProvider` that wraps a `ModalProvider` and the children.
 */
export const Injector: React.FC<React.PropsWithChildren<Props>> = ({ features, children }) => {
  const authHelper = useContext(AuthContext);
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname
  );
  const basePathname = baseUrlManager.getBasePathname();
  const baseUrl = baseUrlManager.getBaseUrl();
  const routeManager = PrimaryRouteManager(basePathname, getFeatureRoutes(features));
  const orchestratorProvider = OrchestratorProvider(getJsonParserId(globalThis), COMMITHASH);
  const urlManager = new UrlManagerImpl(orchestratorProvider, baseUrl);
  const environmentHandler = EnvironmentHandlerImpl(useLocation, routeManager);
  const fileManager = new PrimaryFileManager();
  const archiveHelper = new PrimaryArchiveHelper(fileManager);

  return (
    <DependencyProvider
      dependencies={{
        urlManager,
        orchestratorProvider,
        routeManager,
        environmentHandler,
        archiveHelper,
        authHelper,
        features,
      }}
    >
      <AppAlertProvider>
        <ModalProvider>{children}</ModalProvider>
      </AppAlertProvider>
    </DependencyProvider>
  );
};

const getJsonParserId = (container: unknown): JsonParserId | undefined => {
  if (typeof container !== "object") {
    return undefined;
  }

  if (container === null) {
    return undefined;
  }

  const id = container["jsonParserId"];

  if (typeof id !== "string") {
    return undefined;
  }

  if (!isJsonParserId(id)) {
    return undefined;
  }

  return id;
};
