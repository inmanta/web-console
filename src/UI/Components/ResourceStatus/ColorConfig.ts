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
  [Resource.Status.deploying]: "blue",
  [Resource.Status.available]: "grey",
  [Resource.Status.dry]: "purple",
  [Resource.Status.orphaned]: "purple",
};
