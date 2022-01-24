import { WithId } from "@/Core/Language";

export interface ProjectModel extends WithId {
  name: string;
  environments: EnvironmentModel[];
}

export interface EnvironmentIdentifier {
  environment: string;
}

export interface EnvironmentModel extends WithId {
  name: string;
  project_id: string;
  repo_branch: string;
  repo_url: string;
  description?: string;
  icon?: string;
}

export interface FlatEnvironment extends WithId {
  name: string;
  project_id: string;
  repo_branch: string;
  repo_url: string;
  projectName: string;
  description?: string;
  icon?: string;
}
