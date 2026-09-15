import { CompileError } from "@/Core/Domain";
import { ParsedNumber } from "@/Core/Language";
import { CompileReport } from "@/Slices/CompileReports/Core/Domain";

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
