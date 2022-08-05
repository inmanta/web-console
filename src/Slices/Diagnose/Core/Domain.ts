import { ParsedNumber } from "@/Core/Language";
import { CompileError } from "../../../Core/Domain/CompileError";

export interface RawDiagnostics {
  rejections: RawRejection[];
  failures: FailureGroup[];
}

export interface Diagnostics {
  rejections: Rejection[];
  failures: FailureGroup[];
}

export interface RawRejection {
  instance_version: ParsedNumber;
  model_version?: ParsedNumber;
  compile_id: string;
  errors: CompileError[];
  trace?: string;
}

export interface Rejection {
  instance_version: ParsedNumber;
  model_version?: ParsedNumber;
  compile_id: string;
  error?: CompileError;
  trace?: string;
}

interface FailureGroup {
  resource_id: string;
  failures: Failure[];
}

export interface Failure {
  instance_version: ParsedNumber;
  model_version: ParsedNumber;
  resource_id: string;
  time: Date;
  message: string;
}
