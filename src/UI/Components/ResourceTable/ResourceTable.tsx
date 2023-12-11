import React from "react";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
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
  const columns = ["Resource", "State"];
  const rows = resources.map((resource) => {
    const resourceId = getResourceIdFromResourceVersionId(resource.resource_id);
    return {
      cells: [
        {
          title: <ResourceLink resourceId={resourceId} />,
        },
        { title: <ResourceStatusLabel status={resource.resource_state} /> },
      ],
      key: resourceId,
    };
  });

  return (
    <Table aria-label={props["aria-label"]} variant="compact">
      <Thead id={id ? `resource-table-header-${id}` : undefined}>
        <Tr>
          {columns.map((col) => (
            <Th key={col}>{col}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {rows.map((row) => (
          <Tr key={row.key}>
            {row.cells.map((cell, index) => (
              <Td key={`${row.key}${index}`}>{cell.title}</Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};
