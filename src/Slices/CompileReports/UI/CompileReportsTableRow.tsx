import React, { useContext } from "react";
import { Link } from "react-router";
import { Button } from "@patternfly/react-core";
import { Tbody, Td, Tr } from "@patternfly/react-table";
import { CompileReportRow } from "@/Slices/CompileReports/Core/Types";
import { words } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { DateWithTooltip } from "@inmanta/web-console-ui/Components/DateWithTooltip";
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
        <Td modifier="fitContent" dataLabel={words("status")}>
          <CompileStatusLabel status={row.status} />
        </Td>
        <Td dataLabel={words("message")}>{row.message}</Td>
        <Td dataLabel={words("compileReports.columns.waitTime")}>{row.waitTime}</Td>
        <Td dataLabel={words("compileReports.columns.compileTime")}>{row.compileTime}</Td>
        <Td modifier="fitContent" isActionCell>
          <Link
            to={{
              pathname: routeManager.getUrl("CompileDetails", {
                id: row.id,
              }),
              search: location.search,
            }}
          >
            <Button variant="link">{words("showDetails")}</Button>
          </Link>
        </Td>
      </Tr>
    </Tbody>
  );
};
