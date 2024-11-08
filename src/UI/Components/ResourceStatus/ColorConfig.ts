import { LabelProps } from "@patternfly/react-core";
import { Resource } from "@/Core";

export const labelColorConfig: Record<
  Resource.Status,
  NonNullable<LabelProps["color"]>
> = {
  [Resource.Status.deployed]: "green",
  [Resource.Status.skipped]: "teal",
  [Resource.Status.skipped_for_undefined]: "teal",
  [Resource.Status.cancelled]: "teal",
  [Resource.Status.failed]: "red",
  [Resource.Status.unavailable]: "orange",
  [Resource.Status.undefined]: "orange",
  [Resource.Status.deploying]: "blue",
  [Resource.Status.available]: "grey",
  [Resource.Status.dry]: "purple",
  [Resource.Status.orphaned]: "purple",
};

export const colorConfig: Record<Resource.Status, string> = {
  [Resource.Status.deployed]: "var(--pf-t--chart--color--green--100)",
  [Resource.Status.skipped]: "var(--pf-t--global--border--color--nonstatus--teal--default)",
  [Resource.Status.skipped_for_undefined]:
    "var(--pf-t--global--border--color--nonstatus--teal--default)",
  [Resource.Status.cancelled]: "var(--pf-t--global--border--color--nonstatus--teal--default)",
  [Resource.Status.failed]: "var(--pf-t--global--icon--color--status--danger--default)",
  [Resource.Status.unavailable]: "var(--pf-t--global--icon--color--status--warning--default)",
  [Resource.Status.undefined]: "var(--pf-t--global--icon--color--status--warning--default)",
  [Resource.Status.deploying]: "var(--pf-t--global--color--brand--default)",
  [Resource.Status.available]: "var(--pf-t--global--background--color--disabled--default)",
  [Resource.Status.dry]: "var(--pf-t--global--color--nonstatus--purple--default)",
  [Resource.Status.orphaned]: "var(--pf-t--global--color--nonstatus--purple--defaultd)",
};
