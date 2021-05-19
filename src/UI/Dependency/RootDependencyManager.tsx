import { DataProvider } from "@/Core";
import { BaseApiHelper, FetcherImpl } from "@/Infra";
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
    private readonly baseApiHelper: BaseApiHelper
  ) {}

  getEnvironmentIndependentDependencies(): EnvironmentIndependentDependencies {
    const stateHelper = new ProjectsStateHelper(this.store);
    const projectsManager = new ProjectsDataManager(
      new FetcherImpl<"Projects">(this.baseApiHelper),
      stateHelper
    );

    return { projectsProvider: new DataProviderImpl([projectsManager]) };
  }
}
