import { LabelProps } from "@patternfly/react-core";
import { Resource } from "@/Core";

export const labelColorConfig: Record<
  Resource.Status,
  NonNullable<LabelProps["status"] | LabelProps["color"]>
> = {
  [Resource.Status.deployed]: "success",
  [Resource.Status.skipped]: "teal",
  [Resource.Status.skipped_for_undefined]: "teal",
  [Resource.Status.cancelled]: "teal",
  [Resource.Status.failed]: "danger",
  [Resource.Status.unavailable]: "warning",
  [Resource.Status.undefined]: "warning",
  [Resource.Status.deploying]: "info",
  [Resource.Status.available]: "grey",
  [Resource.Status.dry]: "purple",
  [Resource.Status.orphaned]: "purple",
};

// Color config that will match the Resource.Status to a valid Patternfly color. This is used in the Progress bar.
export const colorConfig: Record<Resource.Status, string> = {
  [Resource.Status.deployed]:
    "var(--pf-t--global--color--status--success--default)",
  [Resource.Status.skipped]:
    "var(--pf-t--global--color--status--custom--default)",
  [Resource.Status.skipped_for_undefined]:
    "var(--pf-t--global--color--status--custom--default)",
  [Resource.Status.cancelled]:
    "var(--pf-t--global--color--status--custom--default)",
  [Resource.Status.failed]:
    "var(--pf-t--global--color--status--danger--default)",
  [Resource.Status.unavailable]:
    "var(--pf-t--global--color--status--warning--default)",
  [Resource.Status.undefined]:
    "var(--pf-t--global--color--status--warning--default)",
  [Resource.Status.deploying]:
    "var(--pf-t--global--color--status--unread--default)",
  [Resource.Status.available]:
    "var(--pf-t--global--color--nonstatus--gray--default)",
  [Resource.Status.dry]: "var(--pf-t--global--color--status--info--default)",
  [Resource.Status.orphaned]:
    "var(--pf-t--global--color--status--info--default)",
};
