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
}

export interface FlatEnvironment {
  id?: string;
  name?: string;
  project_id: string;
  repo_branch?: string;
  repo_url?: string;
  projectName: string;
}

export interface FullEnvironment extends WithId {
  name: string;
  project_id: string;
  repo_branch: string;
  repo_url: string;
  projectName: string;
}

export function getFullEnvironments(
  environments: FlatEnvironment[]
): FullEnvironment[] {
  return environments.filter(isFullEnvironment);
}

function isFullEnvironment(
  environment: FlatEnvironment
): environment is FullEnvironment {
  return environment.id !== undefined && environment.name != undefined;
}
