import {
  ControlAgent,
  ControlAgentManifest,
} from "@/Data/Managers/ControlAgent/interface";
import {
  DeleteInstance,
  DeleteInstanceManifest,
} from "@/Data/Managers/DeleteInstance/interface";
import {
  DeleteService,
  DeleteServiceManifest,
} from "@/Data/Managers/DeleteService/interface";
import {
  DeleteVersion,
  DeleteVersionManifest,
} from "@/Data/Managers/DeleteVersion/interface";
import { Deploy, DeployManifest } from "@/Data/Managers/Deploy/interface";
import {
  DestroyInstance,
  DestroyInstanceManifest,
} from "@/Data/Managers/DestroyInstance/interface";
import {
  ResetEnvironmentSetting,
  ResetEnvironmentSettingManifest,
} from "@/Data/Managers/EnvironmentSettings/ResetEnvironmentSetting/interface";
import {
  UpdateEnvironmentSetting,
  UpdateEnvironmentSettingManifest,
} from "@/Data/Managers/EnvironmentSettings/UpdateEnvironmentSetting/interface";
import {
  GenerateToken,
  GenerateTokenManifest,
} from "@/Data/Managers/GenerateToken/interface";
import {
  GetSupportArchive,
  GetSupportArchiveManifest,
} from "@/Data/Managers/GetSupportArchive/interface";
import {
  HaltEnvironment,
  HaltEnvironmentManifest,
} from "@/Data/Managers/HaltEnvironment/interface";
import {
  UpdateInstanceConfig,
  UpdateInstanceConfigManifest,
} from "@/Data/Managers/InstanceConfig/interfaces";
import {
  ModifyEnvironment,
  ModifyEnvironmentManifest,
} from "@/Data/Managers/ModifyEnvironment/interface";
import {
  PromoteVersion,
  PromoteVersionManifest,
} from "@/Data/Managers/PromoteVersion/interface";
import { Repair, RepairManifest } from "@/Data/Managers/Repair/interface";
import {
  ResumeEnvironment,
  ResumeEnvironmentManifest,
} from "@/Data/Managers/ResumeEnvironment/interface";
import {
  UpdateServiceConfig,
  UpdateServiceConfigManifest,
} from "@/Data/Managers/ServiceConfig/interfaces";
import {
  TriggerCompile,
  TriggerCompileManifest,
} from "@/Data/Managers/TriggerCompile/interface";
import {
  TriggerDryRun,
  TriggerDryRunManifest,
} from "@/Data/Managers/TriggerDryRun/interface";
import {
  TriggerForceState,
  TriggerForceStateManifest,
} from "@/Data/Managers/TriggerForceState/interface";
import {
  TriggerSetState,
  TriggerSetStateManifest,
} from "@/Data/Managers/TriggerSetState/interface";
import {
  UpdateCatalog,
  UpdateCatalogManifest,
} from "@/Data/Managers/UpdateCatalog/interface";

import * as CreateEnvironment from "@S/CreateEnvironment/Core/CreateEnvironmentCommand";
import * as CreateProject from "@S/CreateEnvironment/Core/CreateProjectCommand";
import * as CreateInstance from "@S/CreateInstance/Core/Command";
import * as TriggerInstanceUpdate from "@S/EditInstance/Core/Command";
import * as DeleteEnvironment from "@S/Home/Core/DeleteEnvironmentCommand";
import * as UpdateNotification from "@S/Notification/Core/Command";
import * as CreateCallback from "@S/ServiceDetails/Core/CreateCallback";
import * as DeleteCallback from "@S/ServiceDetails/Core/DeleteCallback";
import * as ClearEnvironment from "@S/Settings/Core/ClearEnvironmentCommand";

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
  | DestroyInstance
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
  | TriggerDryRun
  | TriggerInstanceUpdate.Command
  | TriggerSetState
  | TriggerForceState
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
  DestroyInstance: DestroyInstanceManifest;
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
  TriggerDryRun: TriggerDryRunManifest;
  TriggerInstanceUpdate: TriggerInstanceUpdate.Manifest;
  TriggerSetState: TriggerSetStateManifest;
  TriggerForceState: TriggerForceStateManifest;
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
