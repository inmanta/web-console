import React from "react";
import styled from "styled-components";
import { CompileReportRow } from "@/Core";
import { DateWithTooltip } from "@/UI/Components";
import { words } from "@/UI/words";
import { Button, Spinner } from "@patternfly/react-core";
import { Tbody, Td, Tr } from "@patternfly/react-table";
import { InfoCircleIcon } from "@patternfly/react-icons";
import { Link } from "react-router-dom";
import { getUrl } from "@/UI/Routing";

interface Props {
  row: CompileReportRow;
}

export const CompileReportsTableRow: React.FC<Props> = ({ row }) => {
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
              pathname: getUrl("CompileDetails", {
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
