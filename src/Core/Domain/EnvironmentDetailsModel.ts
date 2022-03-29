export interface EnvironmentDetails {
  id: string;
  name: string;
  project_id: string;
  repo_url: string;
  repo_branch: string;
  settings: Record<string, unknown>;
  halted: boolean;
  description?: string;
  icon?: string;
}

export interface ModifyEnvironmentParams {
  name: string;
  project_id?: string;
  repository?: string;
  branch?: string;
  icon?: string;
  description?: string;
}
