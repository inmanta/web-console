import { FlatEnvironment, FullEnvironment, RemoteData } from "@/Core";
import { History } from "history";
import { createContext } from "react";
import { useStoreState } from "@/Data";
import { Route, SearchHelper } from "@/UI/Routing";
import { useLocation } from "react-router-dom";

export interface EnvironmentHandler {
  set(environmentId: string): void;
  useSelected(): FullEnvironment | undefined;
}

class DummyEnvironmentHandler implements EnvironmentHandler {
  set(): void {
    throw new Error("Method not implemented.");
  }
  useSelected(): FullEnvironment {
    throw new Error("Method not implemented.");
  }
}

export const EnvironmentHandlerContext = createContext<{
  environmentHandler: EnvironmentHandler;
}>({
  environmentHandler: new DummyEnvironmentHandler(),
});

export class EnvironmentHandlerImpl implements EnvironmentHandler {
  constructor(private readonly history: History) {}

  public set(environmentId: string): void {
    const params = new URLSearchParams(this.history.location.search);
    if (params.get("env") !== environmentId) {
      params.set("env", environmentId);
      this.history.push(`${Route.Catalog.path}?${params}`);
    }
  }

  public useSelected(): FullEnvironment | undefined {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    const allEnvironments = useStoreState(
      (state) => state.environments.allEnvironments
    );
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    const { search } = useLocation();
    return this.determineSelected(allEnvironments, search);
  }
  determineSelected(
    allEnvironments: RemoteData.Type<string, FlatEnvironment[]>,
    search: string
  ): FullEnvironment | undefined {
    const searchHelper = new SearchHelper();
    const parsed = searchHelper.parse(search);
    const envId = parsed["env"];
    if (envId && allEnvironments.kind === "Success") {
      const env = allEnvironments.value.find(
        (environment) => environment.id === envId
      );
      if (env) {
        return env as FullEnvironment;
      }
    }
    return;
  }
}
