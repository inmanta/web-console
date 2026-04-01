import { Resource } from "@/Core";

export const colorConfig: Record<Resource.CompoundStatus, string> = {
  [Resource.BlockedStatus.blocked]: "var(--pf-t--color--red--60)",
  [Resource.ComplianceStatus.non_compliant]: "var(--pf-t--color--red--60)",
  [Resource.LastHandlerRunStatus.failed]: "var(--pf-t--color--red--60)",

  [Resource.BlockedStatus.not_blocked]: "var(--pf-t--color--green--50)",
  [Resource.ComplianceStatus.compliant]: "var(--pf-t--color--green--50)",
  [Resource.LastHandlerRunStatus.successful]: "var(--pf-t--color--green--50)",

  [Resource.BlockedStatus.temporarily_blocked]: "var(--pf-t--color--orange--40)",
  [Resource.ComplianceStatus.has_update]: "var(--pf-t--color--orange--40)",

  [Resource.ComplianceStatus.undefined]: "var(--pf-t--color--gray--40)",
  [Resource.LastHandlerRunStatus.skipped]: "var(--pf-t--color--gray--40)",

  [Resource.LastHandlerRunStatus.new]: "var(--pf-t--color--blue--50)",
};

export const statusPriority: Record<Resource.CompoundStatus, number> = {
  // Success = 0 (first)
  [Resource.LastHandlerRunStatus.successful]: 0,
  [Resource.ComplianceStatus.compliant]: 0,
  [Resource.BlockedStatus.not_blocked]: 0,
  // Danger = 1 (second)
  [Resource.LastHandlerRunStatus.failed]: 1,
  [Resource.ComplianceStatus.non_compliant]: 1,
  [Resource.BlockedStatus.blocked]: 1,
  // Update/new/temp_blocked = 2 (thirth)
  [Resource.ComplianceStatus.has_update]: 2,
  [Resource.BlockedStatus.temporarily_blocked]: 2,
  [Resource.LastHandlerRunStatus.new]: 2,
  // Undefined, skipped comes last
  [Resource.LastHandlerRunStatus.skipped]: 3,
  [Resource.ComplianceStatus.undefined]: 3,
};

export const iconStyle = {
  width: "1.25rem",
  height: "1.25rem",
  color: "var(--pf-t--color--gray--50)",
};
