import { CreateEnvironmentParams, EnvironmentModel } from "@/Core/Domain";
import { Either } from "@/Core/Language";

export interface CreateEnvironment {
  kind: "CreateEnvironment";
}

export interface CreateEnvironmentManifest {
  error: string;
  apiData: string;
  body: CreateEnvironmentParams;
  command: CreateEnvironment;
  trigger: (
    body: CreateEnvironmentParams
  ) => Promise<Either.Type<string, { data: EnvironmentModel }>>;
}
