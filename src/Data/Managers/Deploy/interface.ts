import { Maybe } from "@/Core/Language";

export interface Deploy {
  kind: "Deploy";
}

export interface DeployManifest {
  error: string;
  apiData: { data: string };
  body: { agents?: string[] };
  command: Deploy;
  trigger: (agents?: string[]) => Promise<Maybe.Type<string>>;
}
