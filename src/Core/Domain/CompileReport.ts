import { DateInfo } from "./InventoryTable";

export interface CompileReport {
  id: string;
  remote_id?: string;
  environment: string;
  requested: string;
  started?: string | null;
  completed?: string | null;
  success?: boolean;
  do_export: boolean;
  force_update: boolean;
  metadata: Record<string, unknown>;
  environment_variables: Record<string, string>;
  version: number;
}

export interface CompileReportRow {
  id: string;
  requested: DateInfo;
  completed?: string | null;
  success?: boolean;
  inProgress: boolean;
  message: string;
  waitTime: string;
  compileTime: string;
}
