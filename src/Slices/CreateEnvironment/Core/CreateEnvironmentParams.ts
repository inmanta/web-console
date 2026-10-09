export interface CreateEnvironmentParams {
  name: string;
  project_id: string;
  repository?: string;
  branch?: string;
  icon?: string;
  description?: string;
}
