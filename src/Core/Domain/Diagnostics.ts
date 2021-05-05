export interface Diagnostics {
  rejections: Rejection[];
  failures: FailureGroup[];
}
interface CompileError {
  type: string;
  message: string;
}

export interface Rejection {
  instance_version: number;
  model_version?: number;
  compile_id: string;
  errors: CompileError[];
  trace?: string;
}

interface FailureGroup {
  resource_id: string;
  failures: Failure[];
}

export interface Failure {
  instance_version: number;
  model_version: number;
  resource_id: string;
  time: Date;
  message: string;
}
