import { ParsedNumber } from "@/Core/Language";
import { CompileError } from "./CompileError";
import { CompileReport } from "./CompileReport";

export interface CompileDetails extends CompileReport {
  compile_data?: CompileData | null;
  reports?: CompileStageReport[];
}

export interface CompileData {
  errors: CompileError[];
}

export interface CompileStageReport {
  id: string;
  started: string;
  completed?: string;
  command: string;
  name: string;
  errstream: string;
  outstream: string;
  returncode?: ParsedNumber | null;
}

export interface CompileStageReportRow {
  id: string;
  started: string;
  completed?: string;
  shortCommand: string;
  command: string;
  name: string;
  startDelay: string;
  duration?: string;
  errstream: string;
  outstream: string;
  returncode?: ParsedNumber | null;
}
