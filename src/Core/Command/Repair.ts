import { Maybe } from "@/Core/Language";

export interface Repair {
  kind: "Repair";
}

export interface RepairManifest {
  error: string;
  apiData: { data: string };
  body: null;
  command: Repair;
  trigger: () => Promise<Maybe.Type<string>>;
}
