import {
  EnvironmentModel,
  ProjectModel,
  RemoteData,
  RouteManager,
} from "@/Core";
import { History } from "history";
import { createContext } from "react";
import { Store, useStoreState } from "@/Data/Store";

export interface SelectedProjectAndEnvironment {
  project: ProjectModel;
  environment: EnvironmentModel;
}

export interface EnvironmentHandler {
  set(projectId: string, environmentId: string): void;
  setDefault(apiResponse: RemoteData.Type<string, ProjectModel[]>);
  getProjects(): RemoteData.Type<string, ProjectModel[]>;
  getSelected(): RemoteData.Type<string, SelectedProjectAndEnvironment>;
}

class DummyEnvironmentHandler implements EnvironmentHandler {
  set(): void {
    throw new Error("Method not implemented.");
  }
  setDefault() {
    throw new Error("Method not implemented.");
  }
  getProjects(): RemoteData.Type<string, ProjectModel[]> {
    throw new Error("Method not implemented.");
  }
  getSelected(): RemoteData.Type<
    string,
    { project: ProjectModel; environment: EnvironmentModel }
  > {
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
    private readonly store: Store,
    private readonly routeManager: RouteManager
  ) {}

  public set(projectId: string, environmentId: string): void {
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
    this.store.dispatch.projects.selectProjectAndEnvironment({
      project: projectId,
      environment: environmentId,
    });
  }

  public setDefault(data: RemoteData.Type<string, ProjectModel[]>): void {
    if (data.kind === "Success") {
      const params = new URLSearchParams(this.history.location.search);
      const envFromUrl = params.get("env");
      if (!envFromUrl) {
        this.redirectToHomePage();
      }
      const matchingProject = data.value.find((project) =>
        project.environments.find((env) => env.id === envFromUrl)
      );
      const matchingEnv = matchingProject?.environments.find(
        (env) => env.id === envFromUrl
      );
      if (
        envFromUrl !== this.store.getState().projects.selectedEnvironmentId &&
        matchingProject &&
        matchingEnv
      ) {
        this.store.dispatch.projects.selectProjectAndEnvironment({
          project: matchingProject.id,
          environment: matchingEnv.id,
        });
      } else if (!matchingProject && !matchingEnv) {
        this.redirectToHomePage();
      }
    }
  }

  private redirectToHomePage(): void {
    this.history.push({
      pathname: this.routeManager.getUrl("Home", undefined),
      search: "",
    });
  }

  public getProjects(): RemoteData.Type<string, ProjectModel[]> {
    return this.store.getState().projects.allProjects;
  }

  /**
   * @NOTE Due to the caching / limitations of computed properties,
   * env and project have to be accessed via the useStoreState hook
   */
  public getSelected(): RemoteData.Type<string, SelectedProjectAndEnvironment> {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    const env = useStoreState((state) => state.projects.getSelectedEnvironment);
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    const project = useStoreState((state) => state.projects.getSelectedProject);
    return this.determineSelected(project, env);
  }

  determineSelected(
    project?: ProjectModel,
    env?: EnvironmentModel
  ): RemoteData.Type<string, SelectedProjectAndEnvironment> {
    const state = this.store.getState();
    if (env && project) {
      return RemoteData.success({ environment: env, project: project });
    } else if (state.projects.allProjects.kind === "Success") {
      if (
        state.projects.allProjects.value.length > 0 &&
        state.projects.allProjects.value[0].environments.length > 0
      ) {
        return RemoteData.loading();
      } else {
        this.redirectToHomePage();
        return RemoteData.failed("No environments were found");
      }
    } else {
      if (state.projects.allProjects.kind === "Failed") {
        return RemoteData.failed(state.projects.allProjects.value);
      } else {
        return RemoteData.loading();
      }
    }
  }
}
