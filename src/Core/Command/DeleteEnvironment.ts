import { Maybe } from "@/Core/Language";

export interface DeleteEnvironment {
  kind: "DeleteEnvironment";
  id: string;
}

export interface DeleteEnvironmentManifest {
  error: string;
  apiData: string;
  body: null;
  command: DeleteEnvironment;
  trigger: () => Promise<Maybe.Type<string>>;
}
