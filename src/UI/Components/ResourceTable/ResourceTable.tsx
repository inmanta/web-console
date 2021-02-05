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
import { words } from "@/UI/words";

interface Props {
  hrefCreator: HrefCreator;
  resources: ResourceModel[];
}

export const ResourceTable: React.FC<Props> = ({ hrefCreator, resources }) => {
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
        {words("inventory.resourcesTab.detailsLink")}
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
    <Table cells={columns} rows={rows} aria-label="ResourceTable">
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
