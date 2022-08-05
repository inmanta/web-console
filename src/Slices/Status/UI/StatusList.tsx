import React, { useContext } from "react";
import { List } from "@patternfly/react-core";
import {
  ClusterIcon,
  DesktopIcon,
  IntegrationIcon,
  ModuleIcon,
  TagIcon,
} from "@patternfly/react-icons";
import { omit } from "lodash-es";
import { ServerStatus } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
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
}) => {
  const { featureManager } = useContext(DependencyContext);
  return (
    <List
      {...props}
      isPlain
      isBordered
      iconSize="large"
      className={className}
      aria-label="StatusList"
    >
      <StatusItem
        name={status.product}
        details={toDetails(
          omit(status, ["product", "extensions", "slices", "features"])
        )}
        icon={<TagIcon color="var(--pf-global--palette--blue-500)" />}
      />
      <StatusItem
        name="API"
        details={[["url", apiUrl]]}
        icon={<ClusterIcon color="var(--pf-global--palette--blue-500)" />}
      />
      <StatusItem
        name="Web Console"
        details={[["commit hash", featureManager.getCommitHash()]]}
        icon={<DesktopIcon color="var(--pf-global--palette--blue-500)" />}
      />
      {status.extensions.map((extension) => (
        <StatusItem
          key={`extension-${extension.name}`}
          name={extension.name}
          details={toDetails(omit(extension, "name"))}
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
};

const toDetails = (obj: Record<string, unknown>): [string, string][] =>
  Object.entries(obj).map(([key, value]) => [key, `${value}`]);
