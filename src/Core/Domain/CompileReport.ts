import { ParsedNumber } from "@/Core/Language";
import { CompileStatus } from "./CompileStatus";

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
  version: ParsedNumber;
}

export interface CompileReportRow {
  id: string;
  requested: string;
  completed?: string | null;
  message: string;
  waitTime: string;
  compileTime: string;
  status: CompileStatus;
}
