import { Either } from "@/Core/Language";
import {
  InstanceAttributeModel,
  ServiceInstanceModel,
  Field,
} from "@/Core/Domain";

export interface CreateInstance {
  kind: "CreateInstance";
  service_entity: string;
}

export interface CreateInstanceManifest {
  error: string;
  apiData: { data: ServiceInstanceModel };
  body: { attributes: InstanceAttributeModel };
  command: CreateInstance;
  trigger: (
    fields: Field[],
    formState: InstanceAttributeModel
  ) => Promise<Either.Type<string, { data: ServiceInstanceModel }>>;
}
