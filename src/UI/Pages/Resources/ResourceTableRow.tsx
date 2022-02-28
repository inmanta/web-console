import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Button } from "@patternfly/react-core";
import {
  AngleDownIcon,
  AngleRightIcon,
  InfoCircleIcon,
} from "@patternfly/react-icons";
import { Tbody, Tr, Td, ExpandableRowContent } from "@patternfly/react-table";
import { Resource } from "@/Core";
import { RequiresTableWithData, ResourceStatusLabel } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  row: Resource.Row;
  isExpanded: boolean;
  onToggle: () => void;
  numberOfColumns: number;
}

export const ResourceTableRow: React.FC<Props> = ({
  row,
  isExpanded,
  onToggle,
  numberOfColumns,
}) => {
  const { routeManager } = useContext(DependencyContext);
  return (
    <Tbody>
      <Tr aria-label="Resource Table Row">
        <Td dataLabel={words("resources.column.type")}>{row.type}</Td>
        <Td dataLabel={words("resources.column.agent")}>{row.agent}</Td>
        <Td dataLabel={words("resources.column.value")}>{row.value}</Td>
        <Td dataLabel={words("resources.column.requires")}>
          <Button
            variant="link"
            icon={isExpanded ? <AngleDownIcon /> : <AngleRightIcon />}
            iconPosition="left"
            isDisabled={row.numberOfDependencies <= 0}
            onClick={onToggle}
          >
            {row.numberOfDependencies}
          </Button>
        </Td>
        <Td dataLabel={words("resources.column.deployState")}>
          <ResourceStatusLabel status={row.deployState} />
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
      {isExpanded && (
        <Tr isExpanded={isExpanded}>
          <Td colSpan={numberOfColumns}>
            <ExpandableRowContent>
              <RequiresTableWithData id={row.id} />
            </ExpandableRowContent>
          </Td>
        </Tr>
      )}
    </Tbody>
  );
};
