import { thunk, Thunk, Action, action } from "easy-peasy";
import { EnvironmentsSlice, environmentsSlice } from "./EnvironmentsSlice";
import { ProjectsSlice, projectsSlice } from "./ProjectsSlice";
import { ResourcesSlice, resourcesSlice } from "./ResourcesSlice";
import { ServicesSlice, servicesSlice } from "./ServicesSlice";
import {
  ServiceInstancesSlice,
  serviceInstancesSlice,
} from "./ServiceInstancesSlice";
import { ProjectModel } from "@/Core";

export interface AppSlice {
  environments: EnvironmentsSlice;
  fetched: Action<AppSlice, ProjectModel[]>;
  selectProjectAndEnvironment: Thunk<
    AppSlice,
    { project: string; environment: string }
  >;
  services: ServicesSlice;
  projects: ProjectsSlice;
  resources: ResourcesSlice;
  serviceInstances: ServiceInstancesSlice;
}

const fetched: AppSlice["fetched"] = action((state, payload) => {
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
});

export const appSlice: AppSlice = {
  environments: environmentsSlice,
  fetched,
  projects: projectsSlice,
  resources: resourcesSlice,
  selectProjectAndEnvironment: thunk((actions, payload) => {
    actions.projects.selectProjectById(payload.project);
    actions.environments.selectEnvironmentById(payload.environment);
  }),
  serviceInstances: serviceInstancesSlice,
  services: servicesSlice,
};
