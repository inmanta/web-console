import { Either, ServiceInstanceModel, ResourceModel } from "@/Core";

export type InstanceForResources = Pick<
  ServiceInstanceModel,
  "id" | "service_entity" | "version" | "environment"
>;

export interface ResourceFetcher {
  getResources(
    instance: InstanceForResources
  ): Promise<Either.Type<string, ResourceModel[]>>;
}
