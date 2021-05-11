import { DataProvider } from "@/Core";
import { BaseApiHelper, FetcherImpl } from "@/Infra";
import { KeycloakInstance } from "keycloak-js";
import { createContext } from "react";
import {
  DataProviderImpl,
  ProjectsDataManager,
  ProjectsStateHelper,
} from "../Data";
import { Store } from "../Store";

export interface EnvironmentIndependentDependencies {
  projectsProvider: DataProvider;
}

export interface RootDependencyManager {
  getEnvironmentIndependentDependencies(): EnvironmentIndependentDependencies;
}

class DummyRootDependencyManager implements RootDependencyManager {
  getEnvironmentIndependentDependencies(): EnvironmentIndependentDependencies {
    throw new Error("method not implemented");
  }
}

export const RootDependencyManagerContext = createContext<RootDependencyManager>(
  new DummyRootDependencyManager()
);

export class RootDependencyManagerImpl implements RootDependencyManager {
  constructor(
    private readonly store: Store,
    private readonly keycloak: KeycloakInstance
  ) {}

  getEnvironmentIndependentDependencies(): EnvironmentIndependentDependencies {
    const baseUrl = process.env.API_BASEURL ? process.env.API_BASEURL : "";
    const baseApiHelper = new BaseApiHelper(baseUrl, this.keycloak);
    const stateHelper = new ProjectsStateHelper(this.store);
    const projectsManager = new ProjectsDataManager(
      new FetcherImpl<"Projects">(baseApiHelper),
      stateHelper
    );
    const primaryProvider = new DataProviderImpl([projectsManager]);

    return { projectsProvider: primaryProvider };
  }
}
