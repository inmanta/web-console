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
  projectId: string;
}

export interface FlatEnvironment extends EnvironmentModel {
  projectName: string;
}
