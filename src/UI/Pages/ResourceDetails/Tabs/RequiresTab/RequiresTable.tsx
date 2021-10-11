import React, { useContext } from "react";
import { Maybe, ResourceStatus } from "@/Core";
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
import { ResourceIdParser } from "@/UI/Pages/Resources/ResourceId";
import { ResourceFilterContext } from "@/UI/Pages/Resources/ResourceFilterContext";

interface Props {
  requiresStatus: Record<string, ResourceStatus>;
  "aria-label"?: string;
}
export const RequiresTable: React.FC<Props> = ({
  requiresStatus,
  ...props
}) => {
  const { setFilter } = useContext(ResourceFilterContext);
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
            <Td
              onClick={() => {
                const parsedId = ResourceIdParser.parse(resource_id);
                if (Maybe.isNone(parsedId)) return;
                setFilter({
                  agent: [parsedId.value.agentName],
                  type: [parsedId.value.entityType],
                  value: [parsedId.value.attributeValue],
                });
              }}
              style={{ cursor: "pointer" }}
            >
              {resource_id}
            </Td>
            <Td width={15}>
              <ResourceStatusCell state={status} />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </TableComposable>
  );
};
