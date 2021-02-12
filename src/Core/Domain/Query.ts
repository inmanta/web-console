import { RemoteData } from "@/Core/Language";
import { ResourceModel } from "./ResourceModel";
import { ServiceInstanceModel } from "./ServiceInstanceModel";

export type ResourcesQualifier = Pick<
  ServiceInstanceModel,
  "id" | "service_entity" | "version" | "environment"
>;

export interface ResourcesQuery {
  kind: "Resources";
  qualifier: ResourcesQualifier;
}

export type Query = ResourcesQuery;

export interface QueryResult {
  Resources: RemoteData.Type<string, ResourceModel[]>;
}
