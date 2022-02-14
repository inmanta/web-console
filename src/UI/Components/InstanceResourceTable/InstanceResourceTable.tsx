import React from "react";
import { Table, TableHeader, TableBody } from "@patternfly/react-table";
import { InstanceResourceModel } from "@/Core";
import { ResourceLink } from "@/UI/Components/ResourceLink";
import { ResourceStatusLabel } from "@/UI/Components/ResourceStatus";
import { getResourceIdFromResourceVersionId } from "@/UI/Utils";

interface Props {
  resources: InstanceResourceModel[];
  "aria-label"?: string;
  id?: string;
}

export const ResourceTable: React.FC<Props> = ({ resources, id, ...props }) => {
  const columns = ["Resource Id", "State"];
  const rows = resources.map((resource) => {
    return {
      cells: [
        {
          title: (
            <ResourceLink
              resourceId={getResourceIdFromResourceVersionId(
                resource.resource_id
              )}
              linkText={resource.resource_id}
            />
          ),
        },
        { title: <ResourceStatusLabel status={resource.resource_state} /> },
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
