import { ParsedNumber } from "@/Core/Language";

export interface DryRun {
  id: string;
  environment: string;
  model: ParsedNumber;
  date: string;
  total: ParsedNumber;
  todo: ParsedNumber;
}
