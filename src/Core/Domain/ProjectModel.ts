export interface ProjectModel {
  id: string;
  name: string;
  environments: EnvironmentModel[];
}

export interface EnvironmentIdentifier {
  environment: string;
}

export interface EnvironmentModel {
  id: string;
  name: string;
  project_id: string;
  repo_branch: string;
  repo_url: string;
  description?: string;
  icon?: string;
}

export interface FlatEnvironment extends EnvironmentModel {
  projectName: string;
}
export interface EnvironmentExpertOnly extends EnvironmentModel {
  projectName: string;
  settings: {
    enable_lsm_expert_mode: boolean;
  };
}
export interface Environment extends EnvironmentModel {
  projectName: string;
  settings: {
    agent_trigger_method_on_auto_deploy: string;
    auto_deploy: boolean;
    auto_full_compile: string;
    autostart_agent_deploy_interval: number;
    autostart_agent_deploy_splay_time: number;
    autostart_agent_map: { [key: string]: string };
    autostart_agent_repair_interval: number;
    autostart_agent_repair_splay_time: number;
    autostart_on_start: boolean;
    enable_lsm_expert_mode: boolean;
    available_versions_to_keep: number;
    lsm_partial_compile: boolean;
    notification_retention: number;
    protected_environment: boolean;
    push_on_auto_deploy: boolean;
    resource_action_logs_retention: number;
    server_compile: boolean;
  };
}
