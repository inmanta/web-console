import { Maybe } from "@/Core/Language";
import {
  InstanceAttributeModel,
  VersionedServiceInstanceIdentifier,
  Field,
} from "@/Core/Domain";

export interface TriggerInstanceUpdate
  extends VersionedServiceInstanceIdentifier {
  kind: "TriggerInstanceUpdate";
}

export interface TriggerInstanceUpdateManifest {
  error: string;
  apiData: string;
  body: { attributes: InstanceAttributeModel };
  command: TriggerInstanceUpdate;
  trigger: (
    fields: Field[],
    currentAttributes: InstanceAttributeModel | null,
    formState: InstanceAttributeModel
  ) => Promise<Maybe.Type<string>>;
}
