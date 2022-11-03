import React from "react";
import { Button } from "@patternfly/react-core";
import { AngleDownIcon, AngleRightIcon } from "@patternfly/react-icons";
import { Tbody, Tr, Td, ExpandableRowContent } from "@patternfly/react-table";
import styled from "styled-components";
import { Resource } from "@/Core";
import { ResourceLink, ResourceStatusLabel } from "@/UI/Components";
import { words } from "@/UI/words";
import { RequiresTableWithData } from "./Components";

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
}) => (
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
          {row.numberOfDependencies as React.ReactNode}
        </Button>
      </Td>
      <Td dataLabel={words("resources.column.deployState")}>
        <ResourceStatusLabel status={row.deployState} />
      </Td>
      <StyledCell>
        <ResourceLink
          resourceId={row.id}
          linkText={words("resources.link.details")}
        />
      </StyledCell>
    </Tr>
    {isExpanded && (
      <Tr isExpanded={isExpanded}>
        <Td colSpan={numberOfColumns}>
          <ExpandableRowContent>
            <Wrapper deps={row.numberOfDependencies as number}>
              <RequiresTableWithData
                id={row.id}
                deps={row.numberOfDependencies as number}
              />
            </Wrapper>
          </ExpandableRowContent>
        </Td>
      </Tr>
    )}
  </Tbody>
);

const StyledCell = styled(Td)`
  text-align: right;
`;

const Wrapper = styled.div<{
  deps: number;
}>`
  min-height: ${(p) => p.deps * 53 + 41.5}px;
`;
