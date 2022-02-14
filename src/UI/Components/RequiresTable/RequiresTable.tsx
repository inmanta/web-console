import React from "react";
import {
  Tbody,
  TableComposable,
  TableVariant,
  Th,
  Thead,
  Tr,
  Td,
} from "@patternfly/react-table";
import { Resource } from "@/Core";
import { ResourceLink } from "@/UI/Components/ResourceLink";
import { ResourceStatusLabel } from "@/UI/Components/ResourceStatus";
import { words } from "@/UI/words";

interface Props {
  requiresStatus: Record<string, Resource.Status>;
  "aria-label"?: string;
}
export const RequiresTable: React.FC<Props> = ({
  requiresStatus,
  ...props
}) => (
  <TableComposable
    aria-label={props["aria-label"]}
    variant={TableVariant.compact}
  >
    <Thead>
      <Tr>
        <Th>{words("resources.requires.resourceId")}</Th>
        <Th width={15}>{words("resources.requires.deployState")}</Th>
      </Tr>
    </Thead>
    <Tbody>
      {Object.entries(requiresStatus).map(([resource_id, status], idx) => (
        <Tr key={idx}>
          <Td>
            <ResourceLink resourceId={resource_id} />
          </Td>
          <Td width={15}>
            <ResourceStatusLabel status={status} />
          </Td>
        </Tr>
      ))}
    </Tbody>
  </TableComposable>
);
