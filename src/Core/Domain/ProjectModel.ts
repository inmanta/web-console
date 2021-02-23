import { WithId } from "@/Core/Language";

export interface ProjectModel extends WithId {
  name: string;
  environments: EnvironmentModel[];
}

export type EnvironmentIdentifier = WithId;

export interface EnvironmentModel extends EnvironmentIdentifier {
  name: string;
  projectId: string;
}
