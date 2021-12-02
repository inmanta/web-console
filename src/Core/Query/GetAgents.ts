import { Pagination, AgentParams, Agent } from "@/Core/Domain";

export interface GetAgents extends AgentParams.AgentParams {
  kind: "GetAgents";
}

export interface GetAgentsManifest {
  error: string;
  apiResponse: {
    data: Agent[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  data: {
    data: Agent[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  usedData: {
    data: Agent[];
    handlers: Pagination.Handlers;
    metadata: Pagination.Metadata;
  };
  query: GetAgents;
}
