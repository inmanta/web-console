import React, { useRef } from "react";
import { Table, TableVariant, Tbody, Th, Thead, Tr } from "@patternfly/react-table";
import { useExpansion } from "@/Data";
import { ServiceOrderItem } from "@/Slices/Orders/Core/Types";
import { words } from "@/UI";
import { OrderDetailsRow } from "./OrderDetailsRow";
import { OrderDetailsTablePresenter } from "./OrderDetailsTablePresenter";

interface Props {
  tablePresenter: OrderDetailsTablePresenter;
  rows: ServiceOrderItem[];
}

/**
 * OrderDetailsTable Component
 *
 * @param tablePresenter  OrderDetailsTablePresenter
 * @param rows ServiceOrderItem[]
 * @returns ReactNode
 */
export const OrderDetailsTable: React.FC<Props> = ({ tablePresenter, rows, ...props }) => {
  const [isExpanded, onExpansion, expand] = useExpansion();
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  const expandInstanceOrderDetailsRow = (instanceId: string) => {
    expand(instanceId);
    // Row content re-renders on expansion, but the row itself stays mounted, so the ref is
    // already available to scroll to and focus in the same tick.
    const rowElement = rowRefs.current[instanceId];

    if (rowElement) {
      rowElement.scrollIntoView({ behavior: "smooth", block: "center" });
      rowElement.focus();
    }
  };

  const heads = tablePresenter.getColumnHeads().map(({ apiName, displayName }) => {
    return <Th key={apiName}>{displayName}</Th>;
  });

  return (
    <Table {...props} variant={TableVariant.compact}>
      <Thead>
        <Tr>
          <Th
            style={{ width: "15px" }}
            aria-hidden
            screenReaderText={words("common.emptyColumnHeader")}
          />
          {heads}
        </Tr>
      </Thead>
      <Tbody>
        {rows.map((row) => (
          <OrderDetailsRow
            row={row}
            key={row.instance_id}
            isExpanded={isExpanded(row.instance_id)}
            onToggle={onExpansion(row.instance_id)}
            numberOfColumns={tablePresenter.getNumberOfColumns()}
            rowRef={(element) => {
              rowRefs.current[row.instance_id] = element;
            }}
            expandInstanceOrderDetailsRow={expandInstanceOrderDetailsRow}
          />
        ))}
      </Tbody>
    </Table>
  );
};
