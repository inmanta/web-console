import { Either, Maybe } from "@/Core/Language";
import {
  Config,
  InstanceAttributeModel,
  ServiceInstanceModel,
  SetStateBody,
  VersionedServiceInstanceIdentifier,
  ServiceIdentifier,
  Field,
  CreateCallbackBody,
  ModifyEnvironmentParams,
} from "@/Core/Domain";
import { CreateProject, CreateProjectManifest } from "./CreateProject";
import {
  CreateEnvironment,
  CreateEnvironmentManifest,
} from "./CreateEnvironment";

export type Command =
  | UpdateServiceConfig
  | UpdateInstanceConfig
  | CreateInstance
  | TriggerInstanceUpdate
  | DeleteInstance
  | TriggerSetState
  | DeleteService
  | HaltEnvironment
  | ResumeEnvironment
  | ModifyEnvironment
  | DeleteCallback
  | CreateCallback
  | DeleteEnvironment
  | CreateProject
  | CreateEnvironment;

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

export interface CreateInstance {
  kind: "CreateInstance";
  service_entity: string;
}

interface CreateInstanceManifest {
  error: string;
  apiData: { data: ServiceInstanceModel };
  body: { attributes: InstanceAttributeModel };
  command: CreateInstance;
  trigger: (
    fields: Field[],
    formState: InstanceAttributeModel
  ) => Promise<Either.Type<Error<"CreateInstance">, ApiData<"CreateInstance">>>;
}

export interface TriggerInstanceUpdate
  extends VersionedServiceInstanceIdentifier {
  kind: "TriggerInstanceUpdate";
}

interface TriggerInstanceUpdateManifest {
  error: string;
  apiData: string;
  body: { attributes: InstanceAttributeModel };
  command: TriggerInstanceUpdate;
  trigger: (
    fields: Field[],
    currentAttributes: InstanceAttributeModel | null,
    formState: InstanceAttributeModel
  ) => Promise<Maybe.Type<Error<"TriggerInstanceUpdate">>>;
}

export interface DeleteInstance extends VersionedServiceInstanceIdentifier {
  kind: "DeleteInstance";
}

interface DeleteInstanceManifest {
  error: string;
  apiData: string;
  body: null;
  command: DeleteInstance;
  trigger: () => Promise<Maybe.Type<Error<"DeleteInstance">>>;
}

export interface TriggerSetState extends VersionedServiceInstanceIdentifier {
  kind: "TriggerSetState";
}

interface TriggerSetStateManifest {
  error: string;
  apiData: string;
  body: SetStateBody;
  command: TriggerSetState;
  trigger: (
    target_state: string
  ) => Promise<Maybe.Type<Error<"TriggerSetState">>>;
}

export interface DeleteService extends ServiceIdentifier {
  kind: "DeleteService";
}

interface DeleteServiceManifest {
  error: string;
  apiData: string;
  body: null;
  command: DeleteService;
  trigger: () => Promise<Maybe.Type<Error<"DeleteService">>>;
}

export interface HaltEnvironment {
  kind: "HaltEnvironment";
}

interface HaltEnvironmentManifest {
  error: string;
  apiData: string;
  body: null;
  command: HaltEnvironment;
  trigger: () => Promise<Maybe.Type<Error<"HaltEnvironment">>>;
}

export interface ResumeEnvironment {
  kind: "ResumeEnvironment";
}

interface ResumeEnvironmentManifest {
  error: string;
  apiData: string;
  body: null;
  command: ResumeEnvironment;
  trigger: () => Promise<Maybe.Type<Error<"ResumeEnvironment">>>;
}

export interface ModifyEnvironment {
  kind: "ModifyEnvironment";
}

interface ModifyEnvironmentManifest {
  error: string;
  apiData: string;
  body: ModifyEnvironmentParams;
  command: ModifyEnvironment;
  trigger: (
    body: ModifyEnvironmentParams
  ) => Promise<Maybe.Type<Error<"ModifyEnvironment">>>;
}

export interface DeleteCallback {
  kind: "DeleteCallback";
  callbackId: string;
  service_entity: string;
}

interface DeleteCallbackManifest {
  error: string;
  apiData: string;
  body: null;
  command: DeleteCallback;
  trigger: () => Promise<Maybe.Type<Error<"DeleteCallback">>>;
}

export interface CreateCallback extends CreateCallbackBody {
  kind: "CreateCallback";
}

interface CreateCallbackManifest {
  error: string;
  apiData: { data: string };
  body: CreateCallbackBody;
  command: CreateCallback;
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
  CreateProject: CreateProjectManifest;
  CreateEnvironment: CreateEnvironmentManifest;
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
