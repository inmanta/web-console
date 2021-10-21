import { WithId } from "../Language";

export interface EnvironmentDetails extends WithId {
  name: string;
  project_id: string;
  repo_url: string;
  repo_branch: string;
  settings: Record<string, unknown>;
  halted: boolean;
}

export interface ModifyEnvironmentParams extends WithId {
  name: string;
  repository?: string;
  branch?: string;
}

export interface CreateEnvironmentParams {
  project_id: string;
  name: string;
  repository?: string;
  branch?: string;
}
