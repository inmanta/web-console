import { Diff } from "@/Core/Domain/Diff";
import { ParsedNumber } from "@/Core/Language";

export interface Model extends Progress {
  id: string;
  environment: string;
  model: ParsedNumber;
  date: string;
}

export interface Report {
  summary: Model;
  diff: Diff.Resource[];
}

export interface Progress {
  total: ParsedNumber;
  todo: ParsedNumber;
}
