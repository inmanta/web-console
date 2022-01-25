import { AgentAction, AgentActionManifest } from "./AgentAction";
import { CreateCallback, CreateCallbackManifest } from "./CreateCallback";
import {
  CreateEnvironment,
  CreateEnvironmentManifest,
} from "./CreateEnvironment";
import { CreateInstance, CreateInstanceManifest } from "./CreateInstance";
import { CreateProject, CreateProjectManifest } from "./CreateProject";
import { DeleteCallback, DeleteCallbackManifest } from "./DeleteCallback";
import {
  DeleteEnvironment,
  DeleteEnvironmentManifest,
} from "./DeleteEnvironment";
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
import {
  TriggerInstanceUpdate,
  TriggerInstanceUpdateManifest,
} from "./TriggerInstanceUpdate";
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
  | ResetEnvironmentSetting
  | GenerateToken
  | Deploy
  | Repair
  | GetSupportArchive
  | PromoteVersion
  | AgentAction;

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
  GenerateToken: GenerateTokenManifest;
  Deploy: DeployManifest;
  Repair: RepairManifest;
  GetSupportArchive: GetSupportArchiveManifest;
  PromoteVersion: PromoteVersionManifest;
  AgentAction: AgentActionManifest;
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
