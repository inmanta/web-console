import { EnvironmentModel } from "@/Core/Domain";
import { Either } from "@/Core/Language";

export interface Command {
  kind: "CreateEnvironment";
}

export interface Manifest {
  error: string;
  apiData: string;
  body: CreateEnvironmentParams;
  command: Command;
  trigger: (
    body: CreateEnvironmentParams
  ) => Promise<Either.Type<string, { data: EnvironmentModel }>>;
}

export interface CreateEnvironmentParams {
  name: string;
  project_id: string;
  repository?: string;
  branch?: string;
  icon?: string;
  description?: string;
}
