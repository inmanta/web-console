import {
  InstanceAttributeModel,
  ServiceInstanceModel,
  Field,
} from "@/Core/Domain";
import { Either } from "@/Core/Language";

export interface Command {
  kind: "CreateInstance";
  service_entity: string;
}

export interface Manifest {
  error: string;
  apiData: { data: ServiceInstanceModel };
  body: { attributes: InstanceAttributeModel };
  command: Command;
  trigger: (
    fields: Field[],
    formState: InstanceAttributeModel
  ) => Promise<Either.Type<string, { data: ServiceInstanceModel }>>;
}
