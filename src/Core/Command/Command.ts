import * as CreateEnvironment from "@S/CreateEnvironment/Core/CreateEnvironmentCommand";
import * as CreateProject from "@S/CreateEnvironment/Core/CreateProjectCommand";
import * as CreateInstance from "@S/CreateInstance/Core/Command";
import * as TriggerInstanceUpdate from "@S/EditInstance/Core/Command";
import * as DeleteEnvironment from "@S/Home/Core/DeleteEnvironmentCommand";
import * as UpdateNotification from "@S/Notification/Core/Command";
import * as CreateCallback from "@S/ServiceDetails/Core/CreateCallback";
import * as DeleteCallback from "@S/ServiceDetails/Core/DeleteCallback";
import * as ClearEnvironment from "@S/Settings/Core/ClearEnvironmentCommand";
import { ControlAgent, ControlAgentManifest } from "./ControlAgent";
import { DeleteInstance, DeleteInstanceManifest } from "./DeleteInstance";
import { DeleteService, DeleteServiceManifest } from "./DeleteService";
import { DeleteVersion, DeleteVersionManifest } from "./DeleteVersion";
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
import { UpdateCatalog, UpdateCatalogManifest } from "./UpdateCatalog";
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
  | ClearEnvironment.Command
  | ControlAgent
  | CreateCallback.Command
  | CreateEnvironment.Command
  | CreateInstance.Command
  | CreateProject.Command
  | DeleteCallback.Command
  | DeleteEnvironment.Command
  | DeleteInstance
  | DeleteService
  | DeleteVersion
  | Deploy
  | GenerateToken
  | GetSupportArchive
  | HaltEnvironment
  | ModifyEnvironment
  | PromoteVersion
  | UpdateCatalog
  | Repair
  | ResetEnvironmentSetting
  | ResumeEnvironment
  | TriggerCompile
  | TriggerDryRun.Command
  | TriggerInstanceUpdate.Command
  | TriggerSetState
  | UpdateEnvironmentSetting
  | UpdateInstanceConfig
  | UpdateNotification.Command
  | UpdateServiceConfig;

export type Type = Command;

/**
 * The Manifest is just a utility that collects all the different
 * types related to all the sub commands.
 */
interface Manifest {
  ClearEnvironment: ClearEnvironment.Manifest;
  ControlAgent: ControlAgentManifest;
  CreateCallback: CreateCallback.Manifest;
  CreateEnvironment: CreateEnvironment.Manifest;
  CreateInstance: CreateInstance.Manifest;
  CreateProject: CreateProject.Manifest;
  DeleteCallback: DeleteCallback.Manifest;
  DeleteEnvironment: DeleteEnvironment.Manifest;
  DeleteInstance: DeleteInstanceManifest;
  DeleteService: DeleteServiceManifest;
  DeleteVersion: DeleteVersionManifest;
  Deploy: DeployManifest;
  GenerateToken: GenerateTokenManifest;
  GetSupportArchive: GetSupportArchiveManifest;
  HaltEnvironment: HaltEnvironmentManifest;
  ModifyEnvironment: ModifyEnvironmentManifest;
  PromoteVersion: PromoteVersionManifest;
  UpdateCatalog: UpdateCatalogManifest;
  Repair: RepairManifest;
  ResetEnvironmentSetting: ResetEnvironmentSettingManifest;
  ResumeEnvironment: ResumeEnvironmentManifest;
  TriggerCompile: TriggerCompileManifest;
  TriggerDryRun: TriggerDryRun.Manifest;
  TriggerInstanceUpdate: TriggerInstanceUpdate.Manifest;
  TriggerSetState: TriggerSetStateManifest;
  UpdateEnvironmentSetting: UpdateEnvironmentSettingManifest;
  UpdateInstanceConfig: UpdateInstanceConfigManifest;
  UpdateNotification: UpdateNotification.Manifest;
  UpdateServiceConfig: UpdateServiceConfigManifest;
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
