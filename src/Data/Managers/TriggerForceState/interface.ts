import {
  SetStateBody,
  VersionedServiceInstanceIdentifier,
} from "@/Core/Domain";
import { Maybe } from "@/Core/Language";

export interface TriggerForceState extends VersionedServiceInstanceIdentifier {
  kind: "TriggerForceState";
}

export interface TriggerForceStateManifest {
  error: string;
  apiData: string;
  body: SetStateBody;
  command: TriggerForceState;
  trigger: (target_state: string) => Promise<Maybe.Type<string>>;
}
