import React from "react";
import { ResourceStatus } from "@/Core";
import { ResourceStatusCell } from "@/UI/Components";
import { words } from "@/UI/words";
import {
  Tbody,
  TableComposable,
  TableVariant,
  Th,
  Thead,
  Tr,
  Td,
} from "@patternfly/react-table";

interface Props {
  requiresStatus: Record<string, ResourceStatus>;
  "aria-label"?: string;
}
export const RequiresTable: React.FC<Props> = ({
  requiresStatus,
  ...props
}) => {
  return (
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
            <Td>{resource_id}</Td>
            <Td width={15}>
              <ResourceStatusCell state={status} />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </TableComposable>
  );
};
