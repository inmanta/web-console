import React, { useContext } from "react";
import { InstanceResourceModel } from "@/Core";
import { Table, TableHeader, TableBody } from "@patternfly/react-table";
import { Button } from "@patternfly/react-core";
import { words } from "@/UI/words";
import { ResourceStatusCell } from "@/UI/Components/ResourceStatusCell";
import { Link } from "@/UI/Components/Link";
import { DependencyContext } from "@/UI/Dependency";
import { getResourceIdFromResourceVersionId } from "@/UI/Utils";

interface Props {
  resources: InstanceResourceModel[];
  "aria-label"?: string;
  id?: string;
}

export const ResourceTable: React.FC<Props> = ({ resources, id, ...props }) => {
  const { routeManager } = useContext(DependencyContext);
  const columns = ["Resource Id", "Details", "State"];
  const rows = resources.map((resource) => {
    const linkToDetails = (
      <Link
        pathname={routeManager.getUrl("ResourceDetails", {
          resourceId: getResourceIdFromResourceVersionId(resource.resource_id),
        })}
        envOnly
      >
        <Button variant="secondary" isInline>
          {words("inventory.resourcesTab.detailsLink")}
        </Button>
      </Link>
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
