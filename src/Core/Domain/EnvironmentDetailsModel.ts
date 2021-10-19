import { WithId } from "../Language";

export interface EnvironmentDetails extends WithId {
  name: string;
  project_id: string;
  repo_url: string;
  repo_branch: string;
  settings: Record<string, unknown>;
  halted: boolean;
}

export interface EnvironmentParams extends WithId {
  name: string;
  repository?: string;
  branch?: string;
}
