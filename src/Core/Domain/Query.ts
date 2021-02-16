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

type Query = ResourcesQuery;

export type Type = Query;

interface Manifest {
  Resources: {
    error: string;
    data: ResourceModel[];
    query: ResourcesQuery;
  };
}

export type Kind = Query["kind"];

export type Error<K extends Kind> = Manifest[K]["error"];

export type Data<K extends Kind> = Manifest[K]["data"];

export type SubQuery<K extends Kind> = Manifest[K]["query"];

export interface ResourcesQuery {
  kind: "Resources";
  qualifier: {
    id: string;
    environment: string;
    service_entity: string;
    version: number;
  };
}
