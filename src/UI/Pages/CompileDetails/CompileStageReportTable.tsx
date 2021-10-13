import { CompileStageReport } from "@/Core";
import { useExpansion } from "@/Data";
import { MomentDatePresenter } from "@/UI/Utils";
import {
  TableComposable,
  TableVariant,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import React from "react";
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

  const [isExpanded, onExpansion] = useExpansion();

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
          isExpanded={isExpanded(row.id)}
          onToggle={onExpansion(row.id)}
          numberOfColumns={tablePresenter.getNumberOfColumns()}
        />
      ))}
    </TableComposable>
  );
};
