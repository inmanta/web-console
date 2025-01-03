import { ParsedNumber } from "@/Core/Language";
import { DeploymentProgress } from "./ServiceInstanceModel";
import { Uuid } from "./Uuid";

export interface DateInfo {
  full: string;
  relative: string;
  dateTimeMilliseconds: string;
}

export interface AttributesSummary {
  candidate: boolean;
  active: boolean;
  rollback: boolean;
}

export type Pairs = [string, string][];

export interface Attributes {
  candidate: Record<string, unknown> | null;
  active: Record<string, unknown> | null;
  rollback: Record<string, unknown> | null;
}

export interface Row {
  id: Uuid;
  createdAt: string;
  updatedAt: string;
  version: ParsedNumber;
  service_entity: string;
  state: string;
  environment: string;
  deploymentProgress?: DeploymentProgress | null;
  serviceIdentityValue?: string;
  deleted: boolean;
  editDisabled: boolean;
  deleteDisabled: boolean;
}

export interface State {
  name: string;
  label?: "info" | "success" | "danger" | "warning" | null;
}
