import { thunk, Thunk, Action, action, createTypedHooks, Actions } from 'easy-peasy';

export interface IObjectWithId {
  id: string;
}
export interface IProjectModel extends IObjectWithId {
  name: string;
  environments?: IEnvironmentModel[];
  selectedEnvironment?: IEnvironmentModel;
}

export interface IEnvironmentModel extends IObjectWithId {
  name: string;
  projectId: string;
}

export interface IProjectStoreModel {
  items: IProjectModel[];
  selectedProject?: IProjectModel;
  fetched: Action<IProjectStoreModel, IProjectModel[]>;
  fetch: Thunk<IProjectModel[]>;
  selectEnvironmentByName: Action<IProjectStoreModel, string>;
  selectProjectAndEnvironment: Thunk<IProjectStoreModel, { project: string, environment: string }>;
  selectProjectByName: Action<IProjectStoreModel, string>;
}

export interface IStoreModel {
  projects: IProjectStoreModel;
}


const fetchProject = () => fetch(process.env.API_BASEURL + '/api/v2/project').then(result => result.json())
  .catch(error => error); // Show Alert or Notification

export const project: IProjectStoreModel = {
  fetch: thunk(async (actions: Actions<IProjectStoreModel>, payload) => {
    const data = await fetchProject();
    actions.fetched(data.data);
    return data;
  }),
  fetched: action((state, payload) => {
    state.items.push(...payload);
  }),
  items: [],
  selectEnvironmentByName: action((state, payload) => {
    if (state.selectedProject && state.selectedProject.environments) {
      state.selectedProject.selectedEnvironment = state.selectedProject.environments.find((item => item.name === payload));
    }
  }),
  selectProjectAndEnvironment: thunk((actions, payload) => {
    actions.selectProjectByName(payload.project);
    actions.selectEnvironmentByName(payload.environment);
  }),
  selectProjectByName: action((state, payload) => {
    state.selectedProject = state.items.find((item => item.name === payload));
  }),
};


export const storeModel: IStoreModel = {
  projects: project
}

const { useStoreActions, useStoreState, useStoreDispatch } = createTypedHooks<IStoreModel>();

export default {
  useStoreActions,
  useStoreDispatch,
  useStoreState
}