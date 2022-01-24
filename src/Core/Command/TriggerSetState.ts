import {
  SetStateBody,
  VersionedServiceInstanceIdentifier,
} from "@/Core/Domain";
import { Maybe } from "@/Core/Language";

export interface TriggerSetState extends VersionedServiceInstanceIdentifier {
  kind: "TriggerSetState";
}

export interface TriggerSetStateManifest {
  error: string;
  apiData: string;
  body: SetStateBody;
  command: TriggerSetState;
  trigger: (target_state: string) => Promise<Maybe.Type<string>>;
}
