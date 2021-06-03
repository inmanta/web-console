import { Either } from "@/Core/Language";
import {
  FormAttributeResult,
  InstanceAttributeModel,
  ServiceInstanceModel,
  VersionedServiceInstanceIdentifier,
} from "./ServiceInstanceModel";
import { Config } from "./Config";
import { ServiceIdentifier } from "./ServiceModel";

type Command =
  | ServiceConfigCommand
  | InstanceConfigCommand
  | CreateInstanceCommand
  | TriggerInstanceUpdateCommand
  | DeleteInstanceCommand
  | TriggerSetStateCommand;
export type Type = Command;

export interface ServiceConfigCommand extends ServiceIdentifier {
  kind: "ServiceConfig";
}

interface ServiceConfigManifest {
  error: string;
  apiData: { data: Config };
  body: { values: Config };
  command: ServiceConfigCommand;
  trigger: (option: string, value: boolean) => void;
}

/**
 * The instanceConfig command updates the config belonging to one specific service instance
 */
export interface InstanceConfigCommand
  extends VersionedServiceInstanceIdentifier {
  kind: "InstanceConfig";
}

interface InstanceConfigManifest {
  error: string;
  apiData: { data: Config };
  body: { values: Config };
  command: InstanceConfigCommand;
  trigger: (
    payload:
      | { kind: "RESET" }
      | { kind: "UPDATE"; option: string; value: boolean }
  ) => void;
}

export interface CreateInstanceCommand {
  kind: "CreateInstance";
  service_entity: string;
}

interface CreateInstanceManifest {
  error: string;
  apiData: { data: ServiceInstanceModel };
  body: { attributes: InstanceAttributeModel };
  command: CreateInstanceCommand;
  trigger: (
    attributes: FormAttributeResult[]
  ) => Promise<Either.Type<Error<"CreateInstance">, ApiData<"CreateInstance">>>;
}

export interface TriggerInstanceUpdateCommand
  extends VersionedServiceInstanceIdentifier {
  kind: "TriggerInstanceUpdate";
}

interface TriggerInstanceUpdateManifest {
  error: string;
  apiData: string;
  body: { attributes: InstanceAttributeModel };
  command: TriggerInstanceUpdateCommand;
  trigger: (
    currentAttributes: InstanceAttributeModel | null,
    updatedAttributes: FormAttributeResult[]
  ) => Promise<
    Either.Type<
      Error<"TriggerInstanceUpdate">,
      ApiData<"TriggerInstanceUpdate">
    >
  >;
}

export interface DeleteInstanceCommand
  extends VersionedServiceInstanceIdentifier {
  kind: "DeleteInstance";
}

interface DeleteInstanceManifest {
  error: string;
  apiData: string;
  body: null;
  command: DeleteInstanceCommand;
  trigger: () => Promise<
    Either.Type<Error<"DeleteInstance">, ApiData<"DeleteInstance">>
  >;
}

export interface TriggerSetStateCommand
  extends VersionedServiceInstanceIdentifier {
  kind: "TriggerSetState";
}

interface TriggerSetStateManifest {
  error: string;
  apiData: string;
  body: { current_version: number; target_state: string; message: string };
  command: TriggerSetStateCommand;
  trigger: (
    target_state: string
  ) => Promise<
    Either.Type<Error<"TriggerSetState">, ApiData<"TriggerSetState">>
  >;
}

/**
 * The Manifest is just a utility that collects all the different
 * types related to all the sub commands.
 */
interface Manifest {
  ServiceConfig: ServiceConfigManifest;
  InstanceConfig: InstanceConfigManifest;
  CreateInstance: CreateInstanceManifest;
  TriggerInstanceUpdate: TriggerInstanceUpdateManifest;
  DeleteInstance: DeleteInstanceManifest;
  TriggerSetState: TriggerSetStateManifest;
}

/**
 * Query Utilities
 */
export type Kind = Command["kind"];
export type Error<K extends Kind> = Manifest[K]["error"];
export type Body<K extends Kind> = Manifest[K]["body"];
export type ApiData<K extends Kind> = Manifest[K]["apiData"];
export type SubCommand<K extends Kind> = Manifest[K]["command"];
export type Trigger<K extends Kind> = Manifest[K]["trigger"];
