import { ParsedNumber } from "@/Core/Language";

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

export enum DesiredStateVersionStatus {
  active = "active",
  candidate = "candidate",
  retired = "retired",
  skipped_candidate = "skipped_candidate",
}

export const DesiredStateVersionStatusList = Object.values(
  DesiredStateVersionStatus,
);
