import React from "react";
import { Tbody, Tr, Td } from "@patternfly/react-table";
import { ResourceRow } from "@/Core";
import { words } from "@/UI/words";
import { Link } from "react-router-dom";
import { getUrl } from "@/UI/Routing";
import { Button } from "@patternfly/react-core";
import { InfoCircleIcon } from "@patternfly/react-icons";

interface Props {
  row: ResourceRow;
}

export const ResourceTableRow: React.FC<Props> = ({ row }) => (
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
            pathname: getUrl("ResourceDetails", { resourceId: row.id }),
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
