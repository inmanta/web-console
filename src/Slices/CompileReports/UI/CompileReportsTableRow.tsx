import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Button } from "@patternfly/react-core";
import { Tbody, Td, Tr } from "@patternfly/react-table";
import { DateWithTooltip } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { CompileReportRow } from "@S/CompileReports/Core/Domain";
import { CompileStatusLabel } from "./Components";

interface Props {
  row: CompileReportRow;
}

export const CompileReportsTableRow: React.FC<Props> = ({ row }) => {
  const { routeManager } = useContext(DependencyContext);

  return (
    <Tbody isExpanded={false}>
      <Tr aria-label="Compile Reports Table Row">
        <Td width={10} dataLabel={words("compileReports.columns.requested")}>
          <DateWithTooltip timestamp={row.requested} />
        </Td>
        <Td
          modifier="fitContent"
          dataLabel={words("compileReports.columns.status")}
        >
          <CompileStatusLabel status={row.status} />
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
        <Td modifier="fitContent" isActionCell>
          <Link
            to={{
              pathname: routeManager.getUrl("CompileDetails", {
                id: row.id,
              }),
              search: location.search,
            }}
          >
            <Button variant="link">
              {words("compileReports.links.details")}
            </Button>
          </Link>
        </Td>
      </Tr>
    </Tbody>
  );
};
