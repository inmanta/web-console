import {
  ControlAgent,
  ControlAgentManifest,
} from "@/Data/Managers/ControlAgent/interface";
import { Deploy, DeployManifest } from "@/Data/Managers/Deploy/interface";
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
  ModifyEnvironment,
  ModifyEnvironmentManifest,
} from "@/Data/Managers/ModifyEnvironment/interface";
import { Repair, RepairManifest } from "@/Data/Managers/Repair/interface";
import {
  ResumeEnvironment,
  ResumeEnvironmentManifest,
} from "@/Data/Managers/ResumeEnvironment/interface";
import {
  TriggerDryRun,
  TriggerDryRunManifest,
} from "@/Data/Managers/TriggerDryRun/interface";

import * as CreateEnvironment from "@S/CreateEnvironment/Core/CreateEnvironmentCommand";
import * as CreateProject from "@S/CreateEnvironment/Core/CreateProjectCommand";
import * as CreateInstance from "@S/CreateInstance/Core/Command";
import * as TriggerInstanceUpdate from "@S/EditInstance/Core/Command";
import * as DeleteEnvironment from "@S/Home/Core/DeleteEnvironmentCommand";
import * as UpdateNotification from "@S/Notification/Core/Command";
import * as CreateCallback from "@S/ServiceDetails/Core/CreateCallback";
import * as DeleteCallback from "@S/ServiceDetails/Core/DeleteCallback";
import * as ClearEnvironment from "@S/Settings/Core/ClearEnvironmentCommand";

type Command =
  | ClearEnvironment.Command
  | ControlAgent
  | CreateCallback.Command
  | CreateEnvironment.Command
  | CreateInstance.Command
  | CreateProject.Command
  | DeleteCallback.Command
  | DeleteEnvironment.Command
  | Deploy
  | GenerateToken
  | GetSupportArchive
  | HaltEnvironment
  | ModifyEnvironment
  | Repair
  | ResetEnvironmentSetting
  | ResumeEnvironment
  | TriggerDryRun
  | TriggerInstanceUpdate.Command
  | UpdateEnvironmentSetting
  | UpdateNotification.Command;

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
  Deploy: DeployManifest;
  GenerateToken: GenerateTokenManifest;
  GetSupportArchive: GetSupportArchiveManifest;
  HaltEnvironment: HaltEnvironmentManifest;
  ModifyEnvironment: ModifyEnvironmentManifest;
  Repair: RepairManifest;
  ResetEnvironmentSetting: ResetEnvironmentSettingManifest;
  ResumeEnvironment: ResumeEnvironmentManifest;
  TriggerDryRun: TriggerDryRunManifest;
  TriggerInstanceUpdate: TriggerInstanceUpdate.Manifest;
  UpdateEnvironmentSetting: UpdateEnvironmentSettingManifest;
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
