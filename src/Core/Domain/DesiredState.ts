import { ParsedNumber } from "@/Core/Language";
import { DesiredStateVersionStatus } from "./DesiredStateVersionStatus";

interface DesiredStateLabel {
  name: string;
  message: string;
}

export interface DesiredStateVersion {
  version: ParsedNumber;
  date: string;
  total: ParsedNumber;
  labels: DesiredStateLabel[];
  status: DesiredStateVersionStatus;
}
