import React from "react";
import { List } from "@patternfly/react-core";
import { ServerStatus } from "@/Core";
import {
  ClusterIcon,
  IntegrationIcon,
  ModuleIcon,
  TagIcon,
} from "@patternfly/react-icons";
import { StatusItem } from "./StatusItem";

interface Props {
  status: ServerStatus;
  apiUrl: string;
  className?: string;
}

export const StatusList: React.FC<Props> = ({
  status,
  apiUrl,
  className,
  ...props
}) => (
  <List {...props} isPlain isBordered iconSize="large" className={className}>
    <StatusItem
      name={status.product}
      details={[
        ["edition", status.edition],
        ["version", status.version],
        ["license", status.license],
      ]}
      icon={<TagIcon color="var(--pf-global--palette--blue-500)" />}
    />
    <StatusItem
      name="API"
      details={[["URL", apiUrl]]}
      icon={<ClusterIcon color="var(--pf-global--palette--blue-500)" />}
    />
    {status.extensions.map((extension) => (
      <StatusItem
        key={`extension-${extension.name}`}
        name={extension.name}
        details={[
          ["version", extension.version],
          ["package", extension.package],
        ]}
        icon={
          <IntegrationIcon color="var(--pf-global--palette--light-blue-400)" />
        }
        category="extension"
      />
    ))}
    {status.slices.map((slice) => (
      <StatusItem
        key={`slice-${slice.name}`}
        name={slice.name}
        details={toDetails(slice.status)}
        icon={<ModuleIcon color="var(--pf-global--palette--green-500)" />}
        category="component"
      />
    ))}
  </List>
);

const toDetails = (obj: Record<string, unknown>): [string, string][] =>
  Object.entries(obj).map(([key, value]) => [key, `${value}`]);
