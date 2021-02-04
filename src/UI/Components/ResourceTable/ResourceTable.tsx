import React from "react";
import { ResourceModel } from "@/Core";
import { Table, TableHeader, TableBody } from "@patternfly/react-table";
import { Button } from "@patternfly/react-core";
import {
  ExternalLinkAltIcon,
  CheckSquareIcon,
  TimesCircleIcon,
} from "@patternfly/react-icons";
import { HrefCreator } from "./HrefCreator";

interface Props {
  caption: string;
  hrefCreator: HrefCreator;
  resources: ResourceModel[];
}

export const ResourceTable: React.FC<Props> = ({
  caption,
  hrefCreator,
  resources,
}) => {
  const columns = ["Resource Id", "Details", "State"];
  const rows = resources.map((resource) => {
    const href = hrefCreator.create(resource.resource_id);
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

    const formattedState = (
      <>
        <StatusIcon
          state={resource.resource_state}
          key={resource.resource_id}
        />
        {resource.resource_state}
      </>
    );

    return {
      cells: [resource.resource_id, { title: linkToDetails }, formattedState],
    };
  });

  return (
    <Table
      caption={caption}
      cells={columns}
      rows={rows}
      aria-label="ResourceTable"
    >
      <TableHeader />
      <TableBody />
    </Table>
  );
};

const StatusIcon: React.FC<{ state: string }> = ({ state }) => {
  switch (state) {
    case "deployed":
      return <CheckSquareIcon color="#06c" />;
    case "failed":
      return <TimesCircleIcon color="#c9190b" />;
    default:
      return null;
  }
};
