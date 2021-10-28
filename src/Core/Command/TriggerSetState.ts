import { Maybe } from "@/Core/Language";
import {
  SetStateBody,
  VersionedServiceInstanceIdentifier,
} from "@/Core/Domain";

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
