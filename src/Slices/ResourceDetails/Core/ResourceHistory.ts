import { ParsedNumber } from "@/Core/Language";

export interface ResourceHistory {
  resource_id: string;
  attribute_hash: string;
  attributes: Record<string, unknown>;
  date: string;
  requires: string[];
}

export interface ResourceHistoryRow {
  id: string;
  attribute_hash: string;
  attributes: Record<string, unknown>;
  date: string;
  numberOfDependencies: ParsedNumber;
  requires: string[];
}
