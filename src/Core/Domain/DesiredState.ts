import { DesiredStateVersionStatus } from "./DesiredStateVersionStatus";

interface DesiredStateLabel {
  name: string;
  message: string;
}

export interface DesiredStateVersion {
  version: number;
  date: string;
  total: number;
  labels: DesiredStateLabel[];
  status: DesiredStateVersionStatus;
}
