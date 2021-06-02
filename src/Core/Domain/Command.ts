import {
  FormAttributeResult,
  InstanceAttributeModel,
  ServiceInstanceModel,
  VersionedServiceInstanceIdentifier,
} from "./ServiceInstanceModel";
import { Config } from "./Config";
import { Either } from "@/Core/Language";

type Command =
  | InstanceConfigCommand
  | CreateInstanceCommand
  | UpdateInstanceCommand;
export type Type = Command;

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

export interface UpdateInstanceCommand
  extends VersionedServiceInstanceIdentifier {
  kind: "UpdateInstance";
}

interface UpdateInstanceManifest {
  error: string;
  apiData: string;
  body: { attributes: InstanceAttributeModel };
  command: UpdateInstanceCommand;
  trigger: (
    currentAttributes: InstanceAttributeModel | null,
    updatedAttributes: FormAttributeResult[]
  ) => Promise<Either.Type<Error<"UpdateInstance">, ApiData<"UpdateInstance">>>;
}

/**
 * The Manifest is just a utility that collects all the different
 * types related to all the sub commands.
 */
interface Manifest {
  InstanceConfig: InstanceConfigManifest;
  CreateInstance: CreateInstanceManifest;
  UpdateInstance: UpdateInstanceManifest;
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
