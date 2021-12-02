import { Maybe } from "@/Core/Language";

export interface Repair {
  kind: "Repair";
}

export interface RepairManifest {
  error: string;
  apiData: { data: string };
  body: { agents?: string[] };
  command: Repair;
  trigger: (agents?: string[]) => Promise<Maybe.Type<string>>;
}
