import { ServiceInstanceModel } from "./ServiceInstanceModel";

export type ResourcesQuery = Pick<
  ServiceInstanceModel,
  "id" | "service_entity" | "version" | "environment"
>;

export interface ResourcesSubject {
  kind: "Resources";
  query: ResourcesQuery;
}

export type Subject = ResourcesSubject;
