import { thunk, Thunk, Action, action, createTypedHooks, Actions, Computed, computed } from 'easy-peasy';
import { IServiceModel, IServiceInstanceModel, IInstanceDictState, IServiceDictState, instanceDictState, serviceDictState } from './LsmModels';

export interface IObjectWithId {
  id: string;
}
export interface IProjectModel extends IObjectWithId {
  name: string;
  environments: IEnvironmentModel[];
}

export interface IEnvironmentModel extends IObjectWithId {
  name: string;
  projectId: string;
}

export interface IProjectDict {
  [Key: string]: IProjectModel
}

export interface IProjectDictState {
  allIds: string[],
  byId: IProjectDict,
  getAllProjects: Computed<IProjectDictState, IProjectModel[]>,
  getSelectedProject: Computed<IProjectDictState, Partial<IProjectModel>>,
  selectedProjectId: string,
  selectProjectByName: Action<IProjectDictState, string>,
}

export interface IEnvironmentDict {
  [Key: string]: IEnvironmentModel
}

export interface IEnvironmentDictState {
  allIds: string[],
  byId: IEnvironmentDict,
  getSelectedEnvironment: Computed<IEnvironmentDictState, Partial<IEnvironmentModel>>,
  selectedEnvironmentId: string,
  selectEnvironmentByName: Action<IEnvironmentDictState, string>,
}

export interface IProjectStoreModel {
  environments: IEnvironmentDictState;
  fetched: Action<IProjectStoreModel, IProjectModel[]>;
  fetch: Thunk<IProjectStoreModel>;
  selectProjectAndEnvironment: Thunk<IProjectStoreModel, { project: string; environment: string }>;
  services: IServiceDictState;
  projects: IProjectDictState;
  serviceInstances: IInstanceDictState;
}

export interface IStoreModel {
  projects: IProjectStoreModel;
}

async function fetchProject() {
  try {
    const result = await fetch(process.env.API_BASEURL + '/api/v2/project');
    return result.json();
  } catch (error) {
    // Show Alert or Notification
    throw error;
  }
}

export const environmentState: IEnvironmentDictState = {
  allIds: [],
  byId: {},
  getSelectedEnvironment: computed(state => {
    if (state.allIds.length > 0 && state.selectedEnvironmentId) {
      return state.byId[state.selectedEnvironmentId];
    }
    return {} as IProjectModel;
  }),
  selectEnvironmentByName: action((state, payload) => {
    const environmentWithName = Object.values(state.byId).find(item => item.name === payload);
    if (environmentWithName) {
      state.selectedEnvironmentId = environmentWithName.id;
    }
  }),
  selectedEnvironmentId: '',
}

export const projectState: IProjectDictState = {
  allIds: [],
  byId: {},
  getAllProjects: computed(state => {
    return Object.values(state.byId);
  }),
  getSelectedProject: computed(state => {
    if (state.allIds.length > 0 && state.selectedProjectId) {
      return state.byId[state.selectedProjectId];
    }
    return {} as IProjectModel;
  }),
  selectedProjectId: '',
  selectProjectByName: action((state, payload) => {
    const projectWithName = Object.values(state.byId).find(item => item.name === payload);
    if (projectWithName) {
      state.selectedProjectId = projectWithName.id;
    }
  })
}

export const project: IProjectStoreModel = {
  environments: environmentState,
  fetch: thunk(async (actions: Actions<IProjectStoreModel>) => {
    const data = await fetchProject();
    actions.fetched(data.data);
    return data;
  }),
  fetched: action((state, payload) => {
    payload.map(currentProject => {
      state.projects.byId[currentProject.id] = currentProject;
      state.projects.allIds.push(currentProject.id);
    });
    payload.map(currentProject => currentProject.environments.map(environment => {
      state.environments.byId[environment.id] = environment;
      state.environments.allIds.push(environment.id);
    }));
    if (!state.projects.selectedProjectId && state.projects.allIds.length > 0) {
      state.projects.selectedProjectId = state.projects.allIds[0];
    }
    if (!state.environments.selectedEnvironmentId && state.environments.allIds.length > 0) {
      state.environments.selectedEnvironmentId = state.environments.allIds[0];
    }
  }),
  projects: projectState,
  selectProjectAndEnvironment: thunk((actions, payload) => {
    actions.projects.selectProjectByName(payload.project);
    actions.environments.selectEnvironmentByName(payload.environment);
  }),
  serviceInstances: instanceDictState,
  services: serviceDictState,
};

export const storeModel: IStoreModel = {
  projects: project
};

const { useStoreActions, useStoreState, useStoreDispatch } = createTypedHooks<IStoreModel>();

export default {
  useStoreActions,
  useStoreDispatch,
  useStoreState
};
