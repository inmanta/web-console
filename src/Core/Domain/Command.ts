import { Either, Maybe } from "@/Core/Language";
import {
  InstanceAttributeModel,
  ServiceInstanceModel,
  SetStateBody,
  VersionedServiceInstanceIdentifier,
} from "./ServiceInstanceModel";
import { Config } from "./Config";
import { ServiceIdentifier } from "./ServiceModel";
import { Field } from "./Field";
import { CreateCallbackBody } from "./Callback";
import { EnvironmentParams } from "./EnvironmentDetailsModel";

type Command =
  | UpdateServiceConfig
  | UpdateInstanceConfig
  | CreateInstanceCommand
  | TriggerInstanceUpdateCommand
  | DeleteInstanceCommand
  | TriggerSetStateCommand
  | DeleteServiceCommand
  | HaltEnvironmentCommand
  | ResumeEnvironmentCommand
  | ModifyEnvironmentCommand
  | DeleteCallbackCommand
  | CreateCallbackCommand
  | DeleteEnvironment;

export type Type = Command;

export interface UpdateServiceConfig extends ServiceIdentifier {
  kind: "UpdateServiceConfig";
}

interface UpdateServiceConfigManifest {
  error: string;
  apiData: { data: Config };
  body: { values: Config };
  command: UpdateServiceConfig;
  trigger: (option: string, value: boolean) => void;
}

/**
 * The instanceConfig command updates the config belonging to one specific service instance
 */
export interface UpdateInstanceConfig
  extends VersionedServiceInstanceIdentifier {
  kind: "UpdateInstanceConfig";
}

interface UpdateInstanceConfigManifest {
  error: string;
  apiData: { data: Config };
  body: { values: Config };
  command: UpdateInstanceConfig;
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
    fields: Field[],
    formState: InstanceAttributeModel
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
    fields: Field[],
    currentAttributes: InstanceAttributeModel | null,
    formState: InstanceAttributeModel
  ) => Promise<Maybe.Type<Error<"TriggerInstanceUpdate">>>;
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
  trigger: () => Promise<Maybe.Type<Error<"DeleteInstance">>>;
}

export interface TriggerSetStateCommand
  extends VersionedServiceInstanceIdentifier {
  kind: "TriggerSetState";
}

interface TriggerSetStateManifest {
  error: string;
  apiData: string;
  body: SetStateBody;
  command: TriggerSetStateCommand;
  trigger: (
    target_state: string
  ) => Promise<Maybe.Type<Error<"TriggerSetState">>>;
}

export interface DeleteServiceCommand extends ServiceIdentifier {
  kind: "DeleteService";
}

interface DeleteServiceManifest {
  error: string;
  apiData: string;
  body: null;
  command: DeleteServiceCommand;
  trigger: () => Promise<Maybe.Type<Error<"DeleteService">>>;
}

export interface HaltEnvironmentCommand {
  kind: "HaltEnvironment";
}

interface HaltEnvironmentManifest {
  error: string;
  apiData: string;
  body: null;
  command: HaltEnvironmentCommand;
  trigger: () => Promise<Maybe.Type<Error<"HaltEnvironment">>>;
}

export interface ResumeEnvironmentCommand {
  kind: "ResumeEnvironment";
}

interface ResumeEnvironmentManifest {
  error: string;
  apiData: string;
  body: null;
  command: ResumeEnvironmentCommand;
  trigger: () => Promise<Maybe.Type<Error<"ResumeEnvironment">>>;
}

export interface ModifyEnvironmentCommand {
  kind: "ModifyEnvironment";
}

interface ModifyEnvironmentManifest {
  error: string;
  apiData: string;
  body: EnvironmentParams;
  command: ModifyEnvironmentCommand;
  trigger: (
    body: EnvironmentParams
  ) => Promise<Maybe.Type<Error<"ModifyEnvironment">>>;
}

export interface DeleteCallbackCommand {
  kind: "DeleteCallback";
  callbackId: string;
  service_entity: string;
}

interface DeleteCallbackManifest {
  error: string;
  apiData: string;
  body: null;
  command: DeleteCallbackCommand;
  trigger: () => Promise<Maybe.Type<Error<"DeleteCallback">>>;
}

export interface CreateCallbackCommand extends CreateCallbackBody {
  kind: "CreateCallback";
}

interface CreateCallbackManifest {
  error: string;
  apiData: { data: string };
  body: CreateCallbackBody;
  command: CreateCallbackCommand;
  trigger: () => Promise<Maybe.Type<Error<"CreateCallback">>>;
}

export interface DeleteEnvironment {
  kind: "DeleteEnvironment";
  id: string;
}

interface DeleteEnvironmentManifest {
  error: string;
  apiData: string;
  body: null;
  command: DeleteEnvironment;
  trigger: () => Promise<Maybe.Type<Error<"DeleteEnvironment">>>;
}

/**
 * The Manifest is just a utility that collects all the different
 * types related to all the sub commands.
 */
interface Manifest {
  UpdateServiceConfig: UpdateServiceConfigManifest;
  UpdateInstanceConfig: UpdateInstanceConfigManifest;
  CreateInstance: CreateInstanceManifest;
  TriggerInstanceUpdate: TriggerInstanceUpdateManifest;
  DeleteInstance: DeleteInstanceManifest;
  TriggerSetState: TriggerSetStateManifest;
  DeleteService: DeleteServiceManifest;
  HaltEnvironment: HaltEnvironmentManifest;
  ResumeEnvironment: ResumeEnvironmentManifest;
  ModifyEnvironment: ModifyEnvironmentManifest;
  DeleteCallback: DeleteCallbackManifest;
  CreateCallback: CreateCallbackManifest;
  DeleteEnvironment: DeleteEnvironmentManifest;
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
