import { FlatEnvironment, RemoteData, RouteManager } from "@/Core";
import { SearchHelper } from "@/UI/Routing/SearchHelper";
import { useLocation } from "react-router-dom";
import { History } from "history";
import { createContext } from "react";
import { useStoreState } from "@/Data/Store";

export interface EnvironmentHandler {
  set(environmentId: string): void;
  useSelected(): FlatEnvironment | undefined;
}

class DummyEnvironmentHandler implements EnvironmentHandler {
  set(): void {
    throw new Error("Method not implemented.");
  }
  useSelected(): FlatEnvironment {
    throw new Error("Method not implemented.");
  }
}

export const EnvironmentHandlerContext = createContext<{
  environmentHandler: EnvironmentHandler;
}>({
  environmentHandler: new DummyEnvironmentHandler(),
});

export class EnvironmentHandlerImpl implements EnvironmentHandler {
  constructor(
    private readonly history: History,
    private readonly routeManager: RouteManager
  ) {}

  public set(environmentId: string): void {
    const params = new URLSearchParams(this.history.location.search);
    if (params.get("env") !== environmentId) {
      params.set("env", environmentId);
      this.history.push({
        pathname: this.routeManager.getRelatedUrlWithoutParams(
          this.history.location.pathname
        ),
        search: `?${params}`,
      });
    }
  }

  public useSelected(): FlatEnvironment | undefined {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    const allEnvironments = useStoreState(
      (state) => state.environments.environments
    );
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    const { search } = useLocation();
    return this.determineSelected(allEnvironments, search);
  }

  determineSelected(
    allEnvironments: RemoteData.Type<string, FlatEnvironment[]>,
    search: string
  ): FlatEnvironment | undefined {
    const searchHelper = new SearchHelper();
    const parsed = searchHelper.parse(search);
    const envId = parsed["env"];
    if (envId && allEnvironments.kind === "Success") {
      const env = allEnvironments.value.find(
        (environment) => environment.id === envId
      );
      return env;
    }
    return;
  }
}
