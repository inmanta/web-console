import { ParsedNumber } from "@inmanta/web-console-core/Language";

export interface ResourceHistoryRow {
  id: string;
  attribute_hash: string;
  attributes: Record<string, unknown>;
  date: string;
  numberOfDependencies: ParsedNumber;
  requires: string[];
}
