import { CreateProject, CreateProjectManifest } from "./CreateProject";
import {
  CreateEnvironment,
  CreateEnvironmentManifest,
} from "./CreateEnvironment";
import {
  UpdateServiceConfig,
  UpdateServiceConfigManifest,
} from "./UpdateServiceConfig";
import {
  UpdateInstanceConfig,
  UpdateInstanceConfigManifest,
} from "./UpdateInstanceConfig";
import { CreateInstance, CreateInstanceManifest } from "./CreateInstance";
import {
  TriggerInstanceUpdate,
  TriggerInstanceUpdateManifest,
} from "./TriggerInstanceUpdate";
import { DeleteInstance, DeleteInstanceManifest } from "./DeleteInstance";
import { TriggerSetState, TriggerSetStateManifest } from "./TriggerSetState";
import { DeleteService, DeleteServiceManifest } from "./DeleteService";
import { HaltEnvironment, HaltEnvironmentManifest } from "./HaltEnvironment";
import {
  ResumeEnvironment,
  ResumeEnvironmentManifest,
} from "./ResumeEnvironment";
import {
  ModifyEnvironment,
  ModifyEnvironmentManifest,
} from "./ModifyEnvironment";
import { DeleteCallback, DeleteCallbackManifest } from "./DeleteCallback";
import { CreateCallback, CreateCallbackManifest } from "./CreateCallback";
import {
  DeleteEnvironment,
  DeleteEnvironmentManifest,
} from "./DeleteEnvironment";
import {
  UpdateEnvironmentSetting,
  UpdateEnvironmentSettingManifest,
} from "./UpdateEnvironmentSetting";
import {
  ResetEnvironmentSetting,
  ResetEnvironmentSettingManifest,
} from "./ResetEnvironmentSetting";

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
  | CreateEnvironment
  | UpdateEnvironmentSetting
  | ResetEnvironmentSetting;

export type Type = Command;

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
  UpdateEnvironmentSetting: UpdateEnvironmentSettingManifest;
  ResetEnvironmentSetting: ResetEnvironmentSettingManifest;
}

/**
 * Command Utilities
 */
export type Kind = Command["kind"];
export type Error<K extends Kind> = Manifest[K]["error"];
export type Body<K extends Kind> = Manifest[K]["body"];
export type ApiData<K extends Kind> = Manifest[K]["apiData"];
export type SubCommand<K extends Kind> = Manifest[K]["command"];
export type Trigger<K extends Kind> = Manifest[K]["trigger"];
