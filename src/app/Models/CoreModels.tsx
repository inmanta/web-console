import { thunk, Thunk, Action, action, createTypedHooks } from "easy-peasy";
import {
  EnvironmentsSlice,
  environmentsSlice,
  ProjectsSlice,
  projectsSlice,
  ServicesSlice,
  servicesSlice,
  ResourcesSlice,
  resourcesSlice,
  ServiceInstancesSlice,
  serviceInstancesSlice,
} from "@/UI";
import { ProjectModel } from "@/Core";

export interface IProjectStoreModel {
  environments: EnvironmentsSlice;
  fetched: Action<IProjectStoreModel, ProjectModel[]>;
  selectProjectAndEnvironment: Thunk<
    IProjectStoreModel,
    { project: string; environment: string }
  >;
  services: ServicesSlice;
  projects: ProjectsSlice;
  resources: ResourcesSlice;
  serviceInstances: ServiceInstancesSlice;
}

export interface IStoreModel {
  projects: IProjectStoreModel;
}

export const project: IProjectStoreModel = {
  environments: environmentsSlice,
  fetched: action((state, payload) => {
    payload.map((currentProject) => {
      state.projects.byId[currentProject.id] = currentProject;
      state.projects.allIds.push(currentProject.id);
    });
    payload.map((currentProject) =>
      currentProject.environments.map((environment) => {
        state.environments.byId[environment.id] = environment;
        state.environments.allIds.push(environment.id);
      })
    );
    const searchParams = new URLSearchParams(window.location.search);
    const envFromUrl = searchParams.get("env");

    if (!state.projects.selectedProjectId && state.projects.allIds.length > 0) {
      if (envFromUrl) {
        const projectByUrl = payload.find((currentPayload) =>
          currentPayload.environments.find((env) => env.id === envFromUrl)
        );
        if (
          projectByUrl &&
          state.projects.selectedProjectId !== projectByUrl.id
        ) {
          state.projects.selectedProjectId = projectByUrl.id;
        } else {
          state.projects.selectedProjectId = state.projects.allIds[0];
        }
      } else {
        state.projects.selectedProjectId = state.projects.allIds[0];
      }
    }
    if (
      !state.environments.selectedEnvironmentId &&
      state.environments.allIds.length > 0
    ) {
      if (envFromUrl && state.environments.allIds.includes(envFromUrl)) {
        state.environments.selectedEnvironmentId = envFromUrl;
      } else {
        state.environments.selectedEnvironmentId = state.environments.allIds[0];
        const params = new URLSearchParams(location.search);
        params.set("env", state.environments.selectedEnvironmentId);
        window.history.replaceState({}, "", `${location.pathname}?${params}`);
      }
    }
  }),
  projects: projectsSlice,
  resources: resourcesSlice,
  selectProjectAndEnvironment: thunk((actions, payload) => {
    actions.projects.selectProjectById(payload.project);
    actions.environments.selectEnvironmentById(payload.environment);
  }),
  serviceInstances: serviceInstancesSlice,
  services: servicesSlice,
};

export const storeModel: IStoreModel = {
  projects: project,
};

const {
  useStoreActions,
  useStoreState,
  useStoreDispatch,
} = createTypedHooks<IStoreModel>();

export default {
  useStoreActions,
  useStoreDispatch,
  useStoreState,
};
