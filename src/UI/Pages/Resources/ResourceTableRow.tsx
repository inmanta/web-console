import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Button } from "@patternfly/react-core";
import { InfoCircleIcon } from "@patternfly/react-icons";
import { Tbody, Tr, Td } from "@patternfly/react-table";
import { ResourceRow } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  row: ResourceRow;
}

export const ResourceTableRow: React.FC<Props> = ({ row }) => {
  const { routeManager } = useContext(DependencyContext);
  return (
    <Tbody isExpanded={false}>
      <Tr aria-label="Resource Table Row">
        <Td dataLabel={words("resources.column.type")}>{row.type}</Td>
        <Td dataLabel={words("resources.column.agent")}>{row.agent}</Td>
        <Td dataLabel={words("resources.column.value")}>{row.value}</Td>
        <Td dataLabel={words("resources.column.numberOfDependencies")}>
          {row.numberOfDependencies}
        </Td>
        <Td dataLabel={words("resources.column.deployState")}>
          {row.deployState}
        </Td>
        <Td>
          <Link
            to={{
              pathname: routeManager.getUrl("ResourceDetails", {
                resourceId: row.id,
              }),
              search: location.search,
            }}
          >
            <Button variant="secondary" isSmall icon={<InfoCircleIcon />}>
              {words("compileReports.links.details")}
            </Button>
          </Link>
        </Td>
      </Tr>
    </Tbody>
  );
};
