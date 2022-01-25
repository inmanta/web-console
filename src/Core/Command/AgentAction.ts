import { Maybe } from "@/Core/Language";
import { Query } from "@/Core/Query";

export interface AgentAction {
  kind: "AgentAction";
  name: string;
  action: "pause" | "unpause";
}

export interface AgentActionManifest {
  error: string;
  apiData: string;
  body: null;
  command: AgentAction;
  trigger: (query: Query.SubQuery<"GetAgents">) => Promise<Maybe.Type<string>>;
}
