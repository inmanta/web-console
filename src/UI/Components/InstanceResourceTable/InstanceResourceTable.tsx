import React, { useContext } from "react";
import { InstanceResourceModel } from "@/Core";
import { Table, TableHeader, TableBody } from "@patternfly/react-table";
import { Button } from "@patternfly/react-core";
import { ExternalLinkAltIcon } from "@patternfly/react-icons";
import { words } from "@/UI/words";
import { DependencyContext } from "@/UI/Dependency";
import { ResourceStatusCell } from "@/UI/Components/ResourceStatusCell";

interface Props {
  resources: InstanceResourceModel[];
  "aria-label"?: string;
  id?: string;
}

export const ResourceTable: React.FC<Props> = ({ resources, id, ...props }) => {
  const { urlManager } = useContext(DependencyContext);
  const columns = ["Resource Id", "Details", "State"];
  const rows = resources.map((resource) => {
    const linkToDetails = (
      <Button
        component="a"
        variant="link"
        isInline={true}
        icon={<ExternalLinkAltIcon />}
        href={urlManager.getResourceUrl(resource.resource_id)}
        target="_blank"
      >
        {words("inventory.resourcesTab.detailsLink")}
      </Button>
    );

    return {
      cells: [
        resource.resource_id,
        { title: linkToDetails },
        { title: <ResourceStatusCell state={resource.resource_state} /> },
      ],
    };
  });

  return (
    <Table cells={columns} rows={rows} aria-label={props["aria-label"]}>
      <TableHeader id={id ? `resource-table-header-${id}` : undefined} />
      <TableBody />
    </Table>
  );
};
