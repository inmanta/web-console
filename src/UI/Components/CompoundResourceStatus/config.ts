import { Resource } from "@/Core";

export const colorConfig: Record<Resource.CompoundStatus, string> = {
  [Resource.CompoundStatus.blocked]: "var(--pf-t--color--red--60)",
  [Resource.CompoundStatus.non_compliant]: "var(--pf-t--color--red--60)",
  [Resource.CompoundStatus.failed]: "var(--pf-t--color--red--60)",

  [Resource.CompoundStatus.not_blocked]: "var(--pf-t--color--green--50)",
  [Resource.CompoundStatus.compliant]: "var(--pf-t--color--green--50)",
  [Resource.CompoundStatus.successful]: "var(--pf-t--color--green--50)",

  [Resource.CompoundStatus.temporarily_blocked]: "var(--pf-t--color--orange--40)",
  [Resource.CompoundStatus.has_update]: "var(--pf-t--color--orange--40)",

  [Resource.CompoundStatus.undefined]: "var(--pf-t--color--gray--40)",
  [Resource.CompoundStatus.skipped]: "var(--pf-t--color--gray--40)",

  [Resource.CompoundStatus.new]: "var(--pf-t--color--blue--50)",
};

export const statusPriority: Record<Resource.CompoundStatus, number> = {
  // Success = 0 (first)
  [Resource.CompoundStatus.successful]: 0,
  [Resource.CompoundStatus.compliant]: 0,
  [Resource.CompoundStatus.not_blocked]: 0,
  // Danger = 1 (second)
  [Resource.CompoundStatus.failed]: 1,
  [Resource.CompoundStatus.non_compliant]: 1,
  [Resource.CompoundStatus.blocked]: 1,
  // Update/new/temp_blocked = 2 (thirth)
  [Resource.CompoundStatus.has_update]: 2,
  [Resource.CompoundStatus.temporarily_blocked]: 2,
  [Resource.CompoundStatus.new]: 2,
  // Undefined, skipped comes last
  [Resource.CompoundStatus.skipped]: 3,
  [Resource.CompoundStatus.undefined]: 3,
};

export const iconStyle = {
  width: "1.25rem",
  height: "1.25rem",
  color: "var(--pf-t--color--gray--50)",
};
