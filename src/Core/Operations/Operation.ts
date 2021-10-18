import { GetCallbacks, GetCallbacksManifest } from "./GetCallbacks";

export type Operation = GetCallbacks;

export interface OperationManifest {
  GetCallbacks: GetCallbacksManifest;
}
