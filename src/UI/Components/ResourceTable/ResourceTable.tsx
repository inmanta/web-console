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
  resources: Pick<ResourceModel, "resource_id" | "resource_state">[];
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
    <Table caption={caption} cells={columns} rows={rows}>
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
