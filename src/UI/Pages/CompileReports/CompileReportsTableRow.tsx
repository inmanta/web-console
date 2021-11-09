import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Button, Spinner } from "@patternfly/react-core";
import { InfoCircleIcon } from "@patternfly/react-icons";
import { Tbody, Td, Tr } from "@patternfly/react-table";
import styled from "styled-components";
import { CompileReportRow } from "@/Core";
import { DateWithTooltip } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  row: CompileReportRow;
}

export const CompileReportsTableRow: React.FC<Props> = ({ row }) => {
  const { routeManager } = useContext(DependencyContext);
  return (
    <StyledBody
      isExpanded={false}
      $completed={row.completed}
      $success={row.success}
    >
      <Tr aria-label="Compile Reports Table Row">
        <Td dataLabel={words("compileReports.columns.inProgress")}>
          {row.inProgress && <Spinner isSVG size="md" />}
        </Td>
        <Td dataLabel={words("compileReports.columns.requested")}>
          <DateWithTooltip date={row.requested} />
        </Td>
        <Td dataLabel={words("compileReports.columns.message")}>
          {row.message}
        </Td>
        <Td dataLabel={words("compileReports.columns.waitTime")}>
          {row.waitTime}
        </Td>
        <Td dataLabel={words("compileReports.columns.compileTime")}>
          {row.compileTime}
        </Td>
        <Td dataLabel={words("compileReports.columns.actions")}>
          <Link
            to={{
              pathname: routeManager.getUrl("CompileDetails", {
                id: row.id,
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
    </StyledBody>
  );
};

const StyledBody = styled(Tbody)<{
  $completed?: string | null;
  $success?: boolean;
}>`
  ${({ $completed, $success }) =>
    !$completed
      ? ""
      : $success
      ? "background-color: var(--pf-global--palette--green-50)"
      : "background-color: var(--pf-global--palette--red-50)"};
`;
