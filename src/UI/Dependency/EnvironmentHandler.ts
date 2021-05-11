import { EnvironmentModel, ProjectModel, RemoteData } from "@/Core";
import { History } from "history";
import { createContext } from "react";
import { Store, useStoreState } from "../Store";

export interface SelectedProjectAndEnvironment {
  project: Partial<ProjectModel>;
  environment: EnvironmentModel;
}

export interface EnvironmentHandler {
  set(projectId: string, environmentId: string): void;
  setDefault(
    apiResponse: RemoteData.Type<string, ProjectModel[]>,
    setWarningMessage: (message: string) => void
  );
  getSelected(): RemoteData.Type<string, SelectedProjectAndEnvironment>;
}

class DummyEnvironmentHandler implements EnvironmentHandler {
  set(): void {
    throw new Error("Method not implemented.");
  }
  setDefault() {
    throw new Error("Method not implemented.");
  }
  getSelected(): RemoteData.Type<
    string,
    { project: Partial<ProjectModel>; environment: EnvironmentModel }
  > {
    throw new Error("Method not implemented.");
  }
}

export const EnvironmentHandlerContext = createContext<{
  environmentHandler: EnvironmentHandler;
  projects: RemoteData.Type<string, ProjectModel[]>;
}>({
  environmentHandler: new DummyEnvironmentHandler(),
  projects: RemoteData.notAsked(),
});

export class EnvironmentHandlerImpl implements EnvironmentHandler {
  constructor(
    private readonly history: History,
    private readonly store: Store
  ) {}
  public set(projectId: string, environmentId: string): void {
    const params = new URLSearchParams(this.history.location.search);
    if (params.get("env") !== environmentId) {
      params.set("env", environmentId);
      this.history.push(`/lsm/catalog?${params}`);
    }
    this.store.dispatch.projects.selectProjectAndEnvironment({
      project: projectId,
      environment: environmentId,
    });
  }
  public setDefault(
    data: RemoteData.Type<string, ProjectModel[]>,
    setWarningMessage: (message: string) => void
  ): void {
    if (data.kind === "Success") {
      const params = new URLSearchParams(this.history.location.search);
      const envFromUrl = params.get("env");
      if (envFromUrl) {
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
          setWarningMessage(
            `Environment with id ${envFromUrl} not found, another was selected by default`
          );
          this.selectFirstFromList(data.value);
        }
      } else {
        this.selectFirstFromList(data.value);
      }
    }
  }

  private selectFirstFromList(value: ProjectModel[]): void {
    if (value.length > 0 && value[0].environments.length > 0) {
      this.store.dispatch.projects.selectProjectAndEnvironment({
        project: value[0].id,
        environment: value[0].environments[0].id,
      });
      const params = new URLSearchParams(this.history.location.search);
      params.set("env", value[0].environments[0].id);
      this.history.push(`/lsm/catalog?${params}`);
    }
  }
  public getSelected(): RemoteData.Type<string, SelectedProjectAndEnvironment> {
    // Due to the caching / limitations of computed properties, these have to be accessed via the useStoreState hook
    const env = useStoreState((state) => state.projects.getSelectedEnvironment);
    const project = useStoreState((state) => state.projects.getSelectedProject);
    return this.determineSelected(project, env);
  }

  determineSelected(
    project?: Partial<ProjectModel>,
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
