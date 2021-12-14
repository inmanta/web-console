export enum DesiredStateVersionStatus {
  active = "active",
  candidate = "candidate",
  retired = "retired",
  skipped_candidate = "skipped_candidate",
}

export const DesiredStateVersionStatusList = Object.values(
  DesiredStateVersionStatus
);
