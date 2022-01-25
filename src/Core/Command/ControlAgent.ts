import { Maybe } from "@/Core/Language";
import { Query } from "@/Core/Query";

export interface ControlAgent {
  kind: "ControlAgent";
  name: string;
  action: "pause" | "unpause";
}

export interface ControlAgentManifest {
  error: string;
  apiData: string;
  body: null;
  command: ControlAgent;
  trigger: (query: Query.SubQuery<"GetAgents">) => Promise<Maybe.Type<string>>;
}
