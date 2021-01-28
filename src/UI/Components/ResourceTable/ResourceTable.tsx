import React from "react";
import { IResourceModel } from "@app/Models/LsmModels";
import { Table, TableHeader, TableBody } from "@patternfly/react-table";
import { Button } from "@patternfly/react-core";
import {
  ExternalLinkAltIcon,
  CheckSquareIcon,
  TimesCircleIcon,
} from "@patternfly/react-icons";

export type SlimResourceModel = Pick<
  IResourceModel,
  "resource_id" | "resource_state"
>;

interface Props {
  resources: SlimResourceModel[];
  environmentId: string;
  instanceId: string;
}

export const ResourceTable: React.FC<Props> = ({
  resources,
  environmentId,
  instanceId,
}) => {
  const columns = ["Resource Id", "Details", "State"];
  const rows = resources.map((resource) => {
    const href = getHrefFromResourceId(environmentId, resource.resource_id);
    const linkToDetails = (
      <Button
        component="a"
        variant="link"
        isInline={true}
        icon={<ExternalLinkAltIcon />}
        href={href}
        target="_blank"
      >
        Jump to Details
      </Button>
    );
    const Icon = getStatusIcon(resource.resource_state);
    const formattedState = (
      <React.Fragment>
        {" "}
        {<Icon key={resource.resource_id} />} {resource.resource_state}
      </React.Fragment>
    );
    return {
      cells: [resource.resource_id, { title: linkToDetails }, formattedState],
    };
  });

  return (
    <Table
      caption={`Resources for instance with id ${instanceId}`}
      cells={columns}
      rows={rows}
    >
      <TableHeader />
      <TableBody />
    </Table>
  );
};

export function getStatusIcon(resourceState: string): React.FC {
  switch (resourceState) {
    case "deployed":
      return () => <CheckSquareIcon color="#06c" />;
    case "failed":
      return () => <TimesCircleIcon color="#c9190b" />;
    default:
      return () => <></>;
  }
}

const LENGTH_OF_VERSION_PREFIX = 3;

function getHrefFromResourceId(environmentId, resourceId: string): string {
  const indexOfVersionSeparator = resourceId.lastIndexOf(",");
  const resourceName = resourceId.substring(0, indexOfVersionSeparator);
  const version = resourceId.substring(
    indexOfVersionSeparator + LENGTH_OF_VERSION_PREFIX,
    resourceId.length
  );
  const baseUrl = process.env.API_BASEURL ? process.env.API_BASEURL : "";
  const url = `${baseUrl}/dashboard/#!/environment/${environmentId}/version/${version}/${encodeURI(
    resourceName
  ).replace(/\//g, "~2F")}`;
  return url;
}
