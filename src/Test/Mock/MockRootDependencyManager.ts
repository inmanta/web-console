import { DataProvider } from "@/Core";
import {
  EnvironmentIndependentDependencies,
  RootDependencyManager,
} from "@/UI";

export class MockRootDependencyManager implements RootDependencyManager {
  constructor(private readonly projectsProvider: DataProvider) {}
  getEnvironmentIndependentDependencies(): EnvironmentIndependentDependencies {
    return { projectsProvider: this.projectsProvider };
  }
}
