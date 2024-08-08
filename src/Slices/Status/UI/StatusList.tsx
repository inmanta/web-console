import React, { useContext } from "react";
import { Icon, List } from "@patternfly/react-core";
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
          omit(status, ["product", "extensions", "slices", "features"]),
        )}
        icon={
          <Icon style={{ color: "var(--pf-v5-global--palette--blue-500)" }}>
            <TagIcon />
          </Icon>
        }
      />
      <StatusItem
        name="API"
        details={[["url", apiUrl]]}
        icon={
          <Icon style={{ color: "var(--pf-v5-global--primary-color--200)" }}>
            <ClusterIcon />
          </Icon>
        }
      />
      <StatusItem
        name="Web Console"
        details={[["commit hash", featureManager.getCommitHash()]]}
        icon={
          <Icon style={{ color: "var(--pf-v5-global--palette--blue-500)" }}>
            <DesktopIcon />
          </Icon>
        }
      />
      {status.extensions.map((extension) => (
        <StatusItem
          key={`extension-${extension.name}`}
          name={extension.name}
          details={toDetails(omit(extension, "name"))}
          icon={
            <Icon
              style={{ color: "var(--pf-v5-global--palette--light-blue-400)" }}
            >
              <IntegrationIcon />
            </Icon>
          }
          category="extension"
        />
      ))}
      {status.slices.map((slice) => (
        <StatusItem
          key={`slice-${slice.name}`}
          name={slice.name}
          details={toDetails(slice.status)}
          icon={
            <Icon style={{ color: "var(--pf-v5-global--palette--green-500)" }}>
              <ModuleIcon />
            </Icon>
          }
          category="component"
        />
      ))}
    </List>
  );
};

const toDetails = (obj: Record<string, unknown>): [string, string][] =>
  Object.entries(obj).map(([key, value]) => [key, `${value}`]);
