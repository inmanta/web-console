import {
  InstanceAttributeModel,
  VersionedServiceInstanceIdentifier,
  Field,
} from "@/Core/Domain";
import { Maybe } from "@/Core/Language";

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
