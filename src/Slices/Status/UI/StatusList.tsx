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

/**
 * Renders a list of status items, including product status, API status, web console status, extensions, and slices.
 *
 * @props {Props} props - The properties for the status list component.
 * @prop {ServerStatus} status - The server status object
 * @prop {string} apiUrl - The API URL to display in the status list.
 * @prop {string} [className] - Optional additional class name for the list.
 * @returns {React.FC<Props>} The rendered status list component.
 */
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

type DetailKey = string;

type DetailValue = Record<string, string> | string;
export type DetailTuple = [DetailKey, DetailValue];

/**
 * Converts a Record<string, unknown> to an array of key-value pairs where values are either strings or nested records with string values.
 *
 * This function iterates over the entries of the provided record and converts each value to a string. If a value is a nested record, it recursively converts all nested values to strings.
 * We know from the core team that we can safely assume that we don't need to handle nested records more than one level deep.
 *
 * @param {Record<string, unknown>} obj - The record to convert.
 * @returns {DetailTuple[]} An array of key-value pairs where values are either strings or nested records with string values.
 */
const toDetails = (obj: Record<string, unknown>): DetailTuple[] =>
  Object.entries(obj).map(([key, value]) => {
    return [
      key,
      isRecord(value) ? stringifyRecordAttributes(value) : `${value}`,
    ];
  });

/**
 * Converts all attributes of a Record<string, unknown> to strings.
 *
 * This function iterates over the entries of the provided record and converts each value to a string.
 *
 * @param {Record<string, unknown>} obj - The record whose attributes are to be converted to strings.
 * @returns {Record<string, string>} A new record with all values converted to strings.
 */
const stringifyRecordAttributes = (
  obj: Record<string, unknown>,
): Record<string, string> => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, String(value)]),
  );
};

/**
 * Type guard to check if a value is a Record<string, unknown>.
 *
 * This function checks if the provided value is an object, is not null, and is not an array.
 *
 * @param {unknown} value - The value to check.
 * @returns {value is Record<string, unknown>} True if the value is a Record<string, unknown>, otherwise false.
 */
const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};
