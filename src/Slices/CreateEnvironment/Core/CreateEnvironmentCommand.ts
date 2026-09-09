import { EnvironmentModel } from "@/Core/Domain";

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
  ) => Promise<{ kind: "error"; message: string } | { kind: "success"; data: EnvironmentModel }>;
}

export interface CreateEnvironmentParams {
  name: string;
  project_id: string;
  repository?: string;
  branch?: string;
  icon?: string;
  description?: string;
}
