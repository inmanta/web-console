import { EnvironmentExpertOnly, EnvironmentModel } from "@/Core";

export const a: EnvironmentModel = {
  id: "environment_id_a",
  name: "environment_name_ac",
  project_id: "project_id_a",
  repo_branch: "",
  repo_url: "",
};

export const b: EnvironmentModel = {
  id: "environment_id_b",
  name: "environment_name_b",
  project_id: "project_id_b",
  repo_branch: "",
  repo_url: "",
};

export const c: EnvironmentModel = {
  id: "environment_id_c",
  name: "environment_name_ac",
  project_id: "project_id_b",
  repo_branch: "",
  repo_url: "",
};

export const d: EnvironmentModel = {
  id: "environment_id_d",
  name: "environment_name_cd",
  project_id: "project_id_c",
  repo_branch: "",
  repo_url: "",
};

export const e: EnvironmentModel = {
  id: "environment_id_e",
  name: "environment_name_e",
  project_id: "project_id_d",
  repo_branch: "",
  repo_url: "",
};

export const filterable: EnvironmentExpertOnly[] = [
  {
    projectName: "default",
    project_id: "1",
    id: "123",
    name: "test-env1",
    repo_branch: "master",
    repo_url: "github.com/test",
    description: "Test desc",
    icon: "image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiCiAgICAgd2lkdGg9IjMwIiBoZWlnaHQ9IjIwIgogICAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iYmxhY2siIC8+CiAgPGNpcmNsZSBjeD0iMTUiIGN5PSIxMCIgcj0iOCIgZmlsbD0id2hpdGUiIC8+Cjwvc3ZnPg==",
    settings: {
      enable_lsm_expert_mode: true,
    },
  },
  {
    id: "456",
    name: "dev-env2",
    project_id: "1",
    projectName: "default",
    repo_branch: "master",
    repo_url: "github.com/test2",
    settings: {
      enable_lsm_expert_mode: true,
    },
  },
  {
    projectName: "prod",
    id: "789",
    name: "test-env1",
    project_id: "444",
    repo_branch: "master",
    repo_url: "gitlab.com/test",
    settings: {
      enable_lsm_expert_mode: true,
    },
  },
  {
    projectName: "prod",
    id: "101",
    name: "env2",
    project_id: "444",
    repo_branch: "master",
    repo_url: "gitlab.com/test123",
    settings: {
      enable_lsm_expert_mode: true,
    },
  },
];
