import { ReactNode } from "react";
import { CubeIcon, ShieldAltIcon, TrafficLightIcon } from "@patternfly/react-icons";
import { t_global_icon_size_font_xl } from "@patternfly/react-tokens";
import { Resource } from "@/Core";

/** Color config which maps onto every specific compound status record. */
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

/** Maps each compound resource status to a numeric priority value. */
export const statusPriority: Record<Resource.CompoundStatus, number> = {
  // --- BlockedStatus ---
  [Resource.BlockedStatus.not_blocked]: 0,
  [Resource.BlockedStatus.blocked]: 1,
  [Resource.BlockedStatus.temporarily_blocked]: 2,
  // --- ComplianceStatus ---
  [Resource.ComplianceStatus.compliant]: 0,
  [Resource.ComplianceStatus.has_update]: 2,
  [Resource.ComplianceStatus.non_compliant]: 1,
  [Resource.ComplianceStatus.undefined]: 3,
  // --- LastHandlerRunStatus ---
  [Resource.LastHandlerRunStatus.successful]: 0,
  [Resource.LastHandlerRunStatus.failed]: 1,
  [Resource.LastHandlerRunStatus.new]: 2,
  [Resource.LastHandlerRunStatus.skipped]: 3,
};

export const iconStyle = {
  width: t_global_icon_size_font_xl.value,
  height: t_global_icon_size_font_xl.value,
  color: "var(--pf-t--color--gray--50)",
};

/** Icons for every category of compound status. */
export const statusGroupIcons: Record<"blocked" | "compliance" | "lastHandlerRun", ReactNode> = {
  blocked: <TrafficLightIcon style={iconStyle} />,
  compliance: <ShieldAltIcon style={iconStyle} />,
  lastHandlerRun: <CubeIcon style={iconStyle} />,
};
