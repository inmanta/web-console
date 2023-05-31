import React from "react";
import { Tbody, Tr, Td, ExpandableRowContent } from "@patternfly/react-table";
import styled from "styled-components";
import { Resource } from "@/Core";
import { ResourceLink, ResourceStatusLabel, Toggle } from "@/UI/Components";
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
      {row.numberOfDependencies > 0 ? (
        <Td>
          <Toggle
            expanded={isExpanded}
            onToggle={onToggle}
            aria-label={`Toggle-${row.id}`}
          />
        </Td>
      ) : (
        <NoToggle />
      )}
      <Td dataLabel={words("resources.column.type")}>{row.type}</Td>
      <Td dataLabel={words("resources.column.agent")}>{row.agent}</Td>
      <Td dataLabel={words("resources.column.value")}>{row.value}</Td>
      <CenteredCell dataLabel={words("resources.column.requires")}>
        {row.numberOfDependencies as React.ReactNode}
      </CenteredCell>
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

const CenteredCell = styled(Td)`
  @media (min-width: 768px) {
    padding-left: 34px !important;
  }
`;

const NoToggle = styled(Td)`
  display: none !important;
  @media (min-width: 768px) {
    display: inline-block !important;
  }
`;
