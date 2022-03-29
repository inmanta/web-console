import {
  InstanceAttributeModel,
  VersionedServiceInstanceIdentifier,
  Field,
} from "@/Core/Domain";
import { Maybe } from "@/Core/Language";

export interface Command extends VersionedServiceInstanceIdentifier {
  kind: "TriggerInstanceUpdate";
}

export interface Manifest {
  error: string;
  apiData: string;
  body: { attributes: InstanceAttributeModel };
  command: Command;
  trigger: (
    fields: Field[],
    currentAttributes: InstanceAttributeModel | null,
    formState: InstanceAttributeModel
  ) => Promise<Maybe.Type<string>>;
}
