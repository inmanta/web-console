import { RemoteData } from "@/Core/Language";
import { HookHelper } from "../Ports/DataManager";
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

export interface QueryInfo {
  Resources: {
    hookHelper: HookHelper<
      ResourcesQuery,
      RemoteData.Type<string, ResourceModel[]>
    >;
    data: RemoteData.Type<string, ResourceModel[]>;
  };
}
