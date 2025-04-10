import { ControlAgent, ControlAgentManifest } from "@/Data/Managers/ControlAgent/interface";
import { Deploy, DeployManifest } from "@/Data/Managers/Deploy/interface";
import { GenerateToken, GenerateTokenManifest } from "@/Data/Managers/GenerateToken/interface";
import { Repair, RepairManifest } from "@/Data/Managers/Repair/interface";
import { TriggerDryRun, TriggerDryRunManifest } from "@/Data/Managers/TriggerDryRun/interface";
import * as CreateInstance from "@S/CreateInstance/Core/Command";
import * as TriggerInstanceUpdate from "@S/EditInstance/Core/Command";
import * as CreateCallback from "@S/ServiceDetails/Core/CreateCallback";
import * as DeleteCallback from "@S/ServiceDetails/Core/DeleteCallback";

type Command =
  | ControlAgent
  | CreateCallback.Command
  | CreateInstance.Command
  | DeleteCallback.Command
  | Deploy
  | GenerateToken
  | Repair
  | TriggerDryRun
  | TriggerInstanceUpdate.Command;

export type Type = Command;

/**
 * The Manifest is just a utility that collects all the different
 * types related to all the sub commands.
 */
interface Manifest {
  ControlAgent: ControlAgentManifest;
  CreateCallback: CreateCallback.Manifest;
  CreateInstance: CreateInstance.Manifest;
  DeleteCallback: DeleteCallback.Manifest;
  Deploy: DeployManifest;
  GenerateToken: GenerateTokenManifest;
  Repair: RepairManifest;
  TriggerDryRun: TriggerDryRunManifest;
  TriggerInstanceUpdate: TriggerInstanceUpdate.Manifest;
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
