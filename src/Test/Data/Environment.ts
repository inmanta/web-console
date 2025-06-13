import { EnvironmentExpertOnly, EnvironmentModel, FlatEnvironment } from "@/Core";
import { EnvironmentPreview } from "@/Data/Queries";

export const env: FlatEnvironment = {
  id: "env",
  name: "environment_name_env",
  project_id: "project_id_b",
  repo_branch: "",
  repo_url: "",
  halted: false,
  projectName: "project_name_b",
  settings: {
    auto_deploy: false,
    server_compile: true,
    autostart_splay: 10,
    purge_on_delete: true,
    autostart_on_start: true,
    autostart_agent_map: {
      internal: "local:",
    },
    enable_lsm_expert_mode: false,
    push_on_auto_deploy: true,
    protected_environment: false,
    autostart_agent_interval: 600,
    resource_action_logs_retention: 7,
    autostart_agent_deploy_interval: 600,
    autostart_agent_repair_interval: 86400,
    environment_agent_trigger_method: "push_full_deploy",
    autostart_agent_deploy_splay_time: 10,
    autostart_agent_repair_splay_time: 600,
    agent_trigger_method_on_auto_deploy: "push_incremental_deploy",
  },
};

export const a: EnvironmentModel = {
  id: "environment_id_a",
  name: "environment_name_ac",
  project_id: "project_id_a",
  repo_branch: "",
  repo_url: "",
  halted: false,
  settings: {},
};

export const b: EnvironmentModel = {
  id: "environment_id_b",
  name: "environment_name_b",
  project_id: "project_id_b",
  repo_branch: "",
  repo_url: "",
  halted: false,
  settings: {},
};

export const c: EnvironmentModel = {
  id: "environment_id_c",
  name: "environment_name_ac",
  project_id: "project_id_b",
  repo_branch: "",
  repo_url: "",
  halted: false,
  settings: {},
};

export const d: EnvironmentModel = {
  id: "environment_id_d",
  name: "environment_name_cd",
  project_id: "project_id_c",
  repo_branch: "",
  repo_url: "",
  halted: false,
  settings: {},
};

export const e: EnvironmentModel = {
  id: "environment_id_e",
  name: "environment_name_e",
  project_id: "project_id_d",
  repo_branch: "",
  repo_url: "",
  halted: false,
  settings: {},
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
    halted: false,
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
    halted: false,
    settings: {
      enable_lsm_expert_mode: true,
    },
  },
  {
    projectName: "prod",
    id: "789",
    name: "test-env2",
    project_id: "444",
    repo_branch: "master",
    repo_url: "gitlab.com/test",
    halted: false,

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
    halted: false,
    settings: {
      enable_lsm_expert_mode: true,
    },
  },
];

export const previewA: EnvironmentPreview = {
  id: "123",
  name: "test-env1",
  halted: false,
  isExpertMode: false,
  isCompiling: false,
};

export const previewB: EnvironmentPreview = {
  id: "456",
  name: "dev-env2",
  halted: false,
  isExpertMode: false,
  isCompiling: false,
};

export const previewHalted: EnvironmentPreview = {
  id: "789",
  name: "test-env2",
  halted: true,
  isExpertMode: false,
  isCompiling: false,
};

export const previewExpertMode: EnvironmentPreview = {
  id: "101",
  name: "env2",
  halted: false,
  isExpertMode: true,
  isCompiling: false,
};

export const previewCompiling: EnvironmentPreview = {
  id: "102",
  name: "env3",
  halted: false,
  isExpertMode: false,
  isCompiling: true,
};

export const previewFilterable: EnvironmentPreview[] = [
  previewA,
  previewB,
  previewHalted,
  previewExpertMode,
  previewCompiling,
];
