import { thunk, Thunk, Action, action, createTypedHooks, Actions, Computed, computed } from 'easy-peasy';
import { IServiceModel } from './LsmModels';

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
  services: IServiceModel[];
  addServices: Action<IEnvironmentModel, IServiceModel[]>;
}

export interface IProjectStoreModel {
  addServicesToSelectedEnvironment: Action<IProjectStoreModel, IServiceModel[]>;
  items: IProjectModel[];
  selectedProjectIndex: number;
  fetched: Action<IProjectStoreModel, IProjectModel[]>;
  fetch: Thunk<IProjectStoreModel>;
  getSelectedEnvironment: Computed<IProjectStoreModel, Partial<IEnvironmentModel>>;
  getSelectedProject: Computed<IProjectStoreModel, Partial<IProjectModel>>;
  selectEnvironmentByName: Action<IProjectStoreModel, string>;
  selectProjectAndEnvironment: Thunk<IProjectStoreModel, { project: string; environment: string }>;
  selectProjectByName: Action<IProjectStoreModel, string>;
  selectedEnvironmentIndex: number;
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

export const project: IProjectStoreModel = {
  addServicesToSelectedEnvironment: action((state, payload) => {
    if (state.getSelectedEnvironment) {
      state.items[state.selectedProjectIndex].environments[state.selectedEnvironmentIndex].services = payload;
    }
  }),
  fetch: thunk(async (actions: Actions<IProjectStoreModel>) => {
    const data = await fetchProject();
    actions.fetched(data.data);
    return data;
  }),
  fetched: action((state, payload) => {
    state.items.push(...payload);
  }),
  getSelectedEnvironment: computed(state => {
    if (state.getSelectedProject && state.getSelectedProject.environments) {
      return state.getSelectedProject.environments[state.selectedEnvironmentIndex];
    }
    return {} as IEnvironmentModel;
  }),
  getSelectedProject: computed(state => {
    if (state.items) {
      return state.items[state.selectedProjectIndex];
    }
    return {} as IProjectModel;
  }),
  items: [] as IProjectModel[],
  selectEnvironmentByName: action((state, payload) => {
    if (state.getSelectedProject && state.getSelectedProject.environments) {
      state.selectedEnvironmentIndex = state.getSelectedProject.environments.findIndex(item => item.name === payload);
    }
  }),
  selectProjectAndEnvironment: thunk((actions, payload) => {
    actions.selectProjectByName(payload.project);
    actions.selectEnvironmentByName(payload.environment);
  }),
  selectProjectByName: action((state, payload) => {
    state.selectedProjectIndex = state.items.findIndex(item => item.name === payload);
  }),
  selectedEnvironmentIndex: 0,
  selectedProjectIndex: 0,
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
