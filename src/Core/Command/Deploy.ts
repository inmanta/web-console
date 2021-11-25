import { Maybe } from "@/Core/Language";

export interface Deploy {
  kind: "Deploy";
}

export interface DeployManifest {
  error: string;
  apiData: { data: string };
  body: null;
  command: Deploy;
  trigger: () => Promise<Maybe.Type<string>>;
}
