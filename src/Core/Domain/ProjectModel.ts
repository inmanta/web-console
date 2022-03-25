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

export interface FlatEnvironment {
  id: string;
  name: string;
  project_id: string;
  repo_branch: string;
  repo_url: string;
  projectName: string;
  description?: string;
  icon?: string;
}
