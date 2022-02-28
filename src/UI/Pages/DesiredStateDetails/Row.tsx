import React, { useContext } from "react";
import { Button } from "@patternfly/react-core";
import { InfoCircleIcon } from "@patternfly/react-icons";
import { Tbody, Tr, Td } from "@patternfly/react-table";
import { Resource } from "@/Core";
import { Link } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  row: Resource.RowFromVersion;
  version: string;
}

export const Row: React.FC<Props> = ({ row, version }) => {
  const { routeManager } = useContext(DependencyContext);
  return (
    <Tbody>
      <Tr aria-label="Resource Table Row">
        <Td dataLabel={words("resources.column.type")}>{row.type}</Td>
        <Td dataLabel={words("resources.column.agent")}>{row.agent}</Td>
        <Td dataLabel={words("resources.column.value")}>{row.value}</Td>
        <Td dataLabel={words("resources.column.requires")}>
          {row.numberOfDependencies}
        </Td>
        <Td>
          <Link
            pathname={routeManager.getUrl("DesiredStateResourceDetails", {
              resourceId: row.id,
              version,
            })}
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
