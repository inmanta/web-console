import React from "react";
import { Tbody, Td, Tr } from "@patternfly/react-table";
import { Parameter } from "@/Core";
import { DateWithTooltip } from "@/UI/Components";
import { CellWithCopy } from "@/UI/Components/TreeTable/TreeRow/CellWithCopy";
import { words } from "@/UI/words";

interface Props {
  row: Parameter;
}

export const ParametersTableRow: React.FC<Props> = ({ row }) => (
  <Tbody isExpanded={false}>
    <Tr aria-label="Parameters Table Row">
      <Td dataLabel={words("parameters.columns.name")} width={20}>
        {row.name}
      </Td>
      <Td dataLabel={words("parameters.columns.updated")} width={10}>
        {row.updated ? <DateWithTooltip timestamp={row.updated} /> : ""}
      </Td>
      <Td dataLabel={words("parameters.columns.source")} width={10}>
        {row.source}
      </Td>
      <CellWithCopy
        label={words("parameters.columns.value")}
        value={row.value}
        className={"pf-v5-m-truncate"}
      />
    </Tr>
  </Tbody>
);
