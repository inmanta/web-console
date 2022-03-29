import * as CreateEnvironment from "@S/CreateEnvironment/Core/CreateEnvironmentCommand";
import * as CreateProject from "@S/CreateEnvironment/Core/CreateProjectCommand";
import * as CreateInstance from "@S/CreateInstance/Core/Command";
import * as TriggerInstanceUpdate from "@S/EditInstance/Core/Command";
import * as DeleteEnvironment from "@S/Home/Core/DeleteEnvironmentCommand";
import * as UpdateNotification from "@S/Notification/Core/Command";
import { ControlAgent, ControlAgentManifest } from "./ControlAgent";
import { CreateCallback, CreateCallbackManifest } from "./CreateCallback";
import { DeleteCallback, DeleteCallbackManifest } from "./DeleteCallback";
import { DeleteInstance, DeleteInstanceManifest } from "./DeleteInstance";
import { DeleteService, DeleteServiceManifest } from "./DeleteService";
import { Deploy, DeployManifest } from "./Deploy";
import { GenerateToken, GenerateTokenManifest } from "./GenerateToken";
import {
  GetSupportArchive,
  GetSupportArchiveManifest,
} from "./GetSupportArchive";
import { HaltEnvironment, HaltEnvironmentManifest } from "./HaltEnvironment";
import {
  ModifyEnvironment,
  ModifyEnvironmentManifest,
} from "./ModifyEnvironment";
import { PromoteVersion, PromoteVersionManifest } from "./PromoteVersion";
import { Repair, RepairManifest } from "./Repair";
import {
  ResetEnvironmentSetting,
  ResetEnvironmentSettingManifest,
} from "./ResetEnvironmentSetting";
import {
  ResumeEnvironment,
  ResumeEnvironmentManifest,
} from "./ResumeEnvironment";
import { TriggerCompile, TriggerCompileManifest } from "./TriggerCompile";
import { TriggerDryRun } from "./TriggerDryRun";
import { TriggerSetState, TriggerSetStateManifest } from "./TriggerSetState";
import {
  UpdateEnvironmentSetting,
  UpdateEnvironmentSettingManifest,
} from "./UpdateEnvironmentSetting";
import {
  UpdateInstanceConfig,
  UpdateInstanceConfigManifest,
} from "./UpdateInstanceConfig";
import {
  UpdateServiceConfig,
  UpdateServiceConfigManifest,
} from "./UpdateServiceConfig";

export type Command =
  | UpdateServiceConfig
  | UpdateInstanceConfig
  | CreateInstance.Command
  | TriggerInstanceUpdate.Command
  | DeleteInstance
  | TriggerSetState
  | DeleteService
  | HaltEnvironment
  | ResumeEnvironment
  | ModifyEnvironment
  | DeleteCallback
  | CreateCallback
  | DeleteEnvironment.Command
  | CreateProject.Command
  | CreateEnvironment.Command
  | UpdateEnvironmentSetting
  | ResetEnvironmentSetting
  | GenerateToken
  | Deploy
  | Repair
  | GetSupportArchive
  | PromoteVersion
  | ControlAgent
  | TriggerCompile
  | TriggerDryRun.Command
  | UpdateNotification.Command;

export type Type = Command;

/**
 * The Manifest is just a utility that collects all the different
 * types related to all the sub commands.
 */
interface Manifest {
  UpdateServiceConfig: UpdateServiceConfigManifest;
  UpdateInstanceConfig: UpdateInstanceConfigManifest;
  CreateInstance: CreateInstance.Manifest;
  TriggerInstanceUpdate: TriggerInstanceUpdate.Manifest;
  DeleteInstance: DeleteInstanceManifest;
  TriggerSetState: TriggerSetStateManifest;
  DeleteService: DeleteServiceManifest;
  HaltEnvironment: HaltEnvironmentManifest;
  ResumeEnvironment: ResumeEnvironmentManifest;
  ModifyEnvironment: ModifyEnvironmentManifest;
  DeleteCallback: DeleteCallbackManifest;
  CreateCallback: CreateCallbackManifest;
  DeleteEnvironment: DeleteEnvironment.Manifest;
  CreateProject: CreateProject.Manifest;
  CreateEnvironment: CreateEnvironment.Manifest;
  UpdateEnvironmentSetting: UpdateEnvironmentSettingManifest;
  ResetEnvironmentSetting: ResetEnvironmentSettingManifest;
  GenerateToken: GenerateTokenManifest;
  Deploy: DeployManifest;
  Repair: RepairManifest;
  GetSupportArchive: GetSupportArchiveManifest;
  PromoteVersion: PromoteVersionManifest;
  ControlAgent: ControlAgentManifest;
  TriggerCompile: TriggerCompileManifest;
  TriggerDryRun: TriggerDryRun.Manifest;
  UpdateNotification: UpdateNotification.Manifest;
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
