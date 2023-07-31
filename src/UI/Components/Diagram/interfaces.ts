import { ParsedNumber } from "@/Core";

interface ColumnData {
  name: string;
  [key: string]: string;
}
interface RouterOptions {
  padding?: number;
  sourcePadding?: number;
  targetPadding?: number;
}
interface DictDialogData {
  title: string;
  value: string;
}
interface Rule {
  name: string;
  upperLimit: ParsedNumber | null;
}
interface ConnectionRules {
  [serviceName: string]: Rule[];
}
export { ColumnData, RouterOptions, DictDialogData, Rule, ConnectionRules };
