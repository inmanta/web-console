import { CompileStageReport, CompileStageReportRow } from "@/Core";
import { MomentDatePresenter } from "@/UI/Utils";
import {
  TableComposable,
  TableVariant,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import React from "react";
import { ExpansionManager } from "../ServiceInventory/ExpansionManager";
import { CompileStageReportTablePresenter } from "./CompileStageReportTablePresenter";
import { CompileStageReportTableRow } from "./CompileStageReportTableRow";

interface Props {
  compileStarted?: string | null;
  reports: CompileStageReport[];
}

export const CompileStageReportTable: React.FC<Props> = ({
  compileStarted,
  reports,
  ...props
}) => {
  const tablePresenter = new CompileStageReportTablePresenter(
    new MomentDatePresenter(),
    compileStarted
  );
  const rows = tablePresenter.createRows(reports);
  const heads = tablePresenter
    .getColumnHeadDisplayNames()
    .map((columnName) => <Th key={columnName}>{columnName}</Th>);

  const expansionManager = new ExpansionManager();

  const [expansionState, setExpansionState] = React.useState(
    expansionManager.create(rowsToIds(rows))
  );

  const handleExpansionToggle = (id: string) => () => {
    setExpansionState(expansionManager.toggle(expansionState, id));
  };

  React.useEffect(() => {
    setExpansionState(expansionManager.merge(expansionState, rowsToIds(rows)));
  }, [reports]);

  return (
    <TableComposable {...props} variant={TableVariant.compact}>
      <Thead>
        <Tr>
          <Th key="toggle" />
          {heads}
        </Tr>
      </Thead>
      {rows.map((row, idx) => (
        <CompileStageReportTableRow
          row={row}
          key={row.id}
          index={idx}
          isExpanded={expansionState[row.id]}
          onToggle={handleExpansionToggle(row.id)}
          numberOfColumns={tablePresenter.getNumberOfColumns()}
        />
      ))}
    </TableComposable>
  );
};

function rowsToIds(rows: CompileStageReportRow[]): string[] {
  return rows.map((row) => row.id);
}
