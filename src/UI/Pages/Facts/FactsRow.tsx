import React, { useContext } from "react";
import { Button } from "@patternfly/react-core";
import { Tbody, Tr, Td } from "@patternfly/react-table";
import { Fact } from "@/Core";
import { Link } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  row: Pick<Fact, "name" | "updated" | "value" | "resource_id">;
}

export const FactsRow: React.FC<Props> = ({ row }) => {
  const { routeManager } = useContext(DependencyContext);
  return (
    <Tbody>
      <Tr aria-label="FactsRow">
        <Td dataLabel={words("resources.column.type")}>{row.name}</Td>
        <Td dataLabel={words("resources.column.agent")}>{row.updated}</Td>
        <Td dataLabel={words("resources.column.value")}>{row.value}</Td>
        <Td>
          <Link
            pathname={routeManager.getUrl("ResourceDetails", {
              resourceId: row.resource_id,
            })}
          >
            <Button variant="link" isInline>
              {row.resource_id}
            </Button>
          </Link>
        </Td>
      </Tr>
    </Tbody>
  );
};
