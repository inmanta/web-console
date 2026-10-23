import { CompileStatus } from "@/Core/Domain/CompileStatus";

export interface CompileReportRow {
  id: string;
  requested: string;
  completed?: string | null;
  message: string;
  waitTime: string;
  compileTime: string;
  status: CompileStatus;
}
