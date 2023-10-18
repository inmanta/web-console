import { LabelProps } from "@patternfly/react-core";
import { Resource } from "@/Core";

export const labelColorConfig: Record<
  Resource.Status,
  NonNullable<LabelProps["color"]>
> = {
  [Resource.Status.deployed]: "green",
  [Resource.Status.skipped]: "cyan",
  [Resource.Status.skipped_for_undefined]: "cyan",
  [Resource.Status.cancelled]: "cyan",
  [Resource.Status.failed]: "red",
  [Resource.Status.unavailable]: "orange",
  [Resource.Status.undefined]: "orange",
  [Resource.Status.deploying]: "blue",
  [Resource.Status.available]: "grey",
  [Resource.Status.dry]: "purple",
  [Resource.Status.orphaned]: "purple",
};

export const colorConfig: Record<Resource.Status, string> = {
  [Resource.Status.deployed]: "var(--pf-v5-global--success-color--100)",
  [Resource.Status.skipped]: "var(--pf-v5-global--palette--cyan-100)",
  [Resource.Status.skipped_for_undefined]:
    "var(--pf-v5-global--palette--cyan-100)",
  [Resource.Status.cancelled]: "var(--pf-v5-global--palette--cyan-100)",
  [Resource.Status.failed]: "var(--pf-v5-global--danger-color--100)",
  [Resource.Status.unavailable]: "var(--pf-v5-global--warning-color--100)",
  [Resource.Status.undefined]: "var(--pf-v5-global--warning-color--100)",
  [Resource.Status.deploying]: "var(--pf-v5-global--info-color--100)",
  [Resource.Status.available]: "var(--pf-v5-global--disabled-color--200)",
  [Resource.Status.dry]: "var(--pf-v5-global--palette--purple-300)",
  [Resource.Status.orphaned]: "var(--pf-v5-global--palette--purple-300)",
};
