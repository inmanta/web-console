import {
  SetStateBody,
  VersionedServiceInstanceIdentifier,
} from "@/Core/Domain";
import { Maybe } from "@/Core/Language";

export interface UpdateInstanceAttribute
  extends VersionedServiceInstanceIdentifier {
  kind: "UpdateInstanceAttribute";
}

export interface UpdateInstanceAttributeManifest {
  error: string;
  apiData: string;
  body: SetStateBody;
  command: UpdateInstanceAttribute;
  trigger: (
    attribute_set_name:
      | "candidate_attributes"
      | "active_attributes"
      | "rollback_attributes",
    value: string | number | boolean,
    target: string
  ) => Promise<Maybe.Type<string>>;
}
