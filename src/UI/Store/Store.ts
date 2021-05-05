import { thunk, Thunk, Action, action } from "easy-peasy";
import { EnvironmentsSlice, environmentsSlice } from "./EnvironmentsSlice";
import { InstanceLogsSlice, instanceLogsSlice } from "./InstanceLogsSlice";
import {
  InstanceConfigSlice,
  instanceConfigSlice,
} from "./InstanceConfigSlice";
import { ProjectsSlice, projectsSlice } from "./ProjectsSlice";
import { servicesSlice, ServicesSlice } from "./ServicesSlice";
import { resourcesSlice, ResourcesSlice } from "./ResourcesSlice";
import { ProjectModel } from "@/Core";
import {
  serviceInstancesSlice,
  ServiceInstancesSlice,
} from "./ServiceInstancesSlice";
import { EventsSlice, eventsSlice } from "./EventsSlice";
import { diagnosticsSlice, DiagnosticsSlice } from "./DiagnosticsSlice";

export interface StoreModel {
  environments: EnvironmentsSlice;
  fetched: Action<StoreModel, ProjectModel[]>;
  selectProjectAndEnvironment: Thunk<
    StoreModel,
    { project: string; environment: string }
  >;
  resources: ResourcesSlice;
  events: EventsSlice;
  services: ServicesSlice;
  instanceLogs: InstanceLogsSlice;
  instanceConfig: InstanceConfigSlice;
  projects: ProjectsSlice;
  serviceInstances: ServiceInstancesSlice;
  diagnostics: DiagnosticsSlice;
}

const fetched: StoreModel["fetched"] = action((state, payload) => {
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

export const storeModel: StoreModel = {
  environments: environmentsSlice,
  fetched,
  instanceLogs: instanceLogsSlice,
  instanceConfig: instanceConfigSlice,
  projects: projectsSlice,
  resources: resourcesSlice,
  events: eventsSlice,
  selectProjectAndEnvironment: thunk((actions, payload) => {
    actions.projects.selectProjectById(payload.project);
    actions.environments.selectEnvironmentById(payload.environment);
  }),
  serviceInstances: serviceInstancesSlice,
  services: servicesSlice,
  diagnostics: diagnosticsSlice,
};
