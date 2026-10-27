import { ParsedNumber } from "@inmanta/web-console-core/Language";
import { CompileError } from "./CompileError";
import { CompileReport } from "./CompileReport";

export interface CompileDetails extends CompileReport {
  compile_data?: CompileData | null;
  reports?: CompileStageReport[];
}

interface CompileData {
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
