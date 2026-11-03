import React, { useMemo, useRef } from "react";
import { Table, TableVariant, Tbody, Th, Thead, Tr } from "@patternfly/react-table";
import { getServiceTitle, words } from "@inmanta/web-console-core";
import { useExpansion } from "@inmanta/web-console-core/Common";
import { ServiceOrderItem } from "@inmanta/web-console-core/Domain/ServiceOrderModel";
import { useGetServiceModels } from "@inmanta/web-console-core/Queries/Slices/Service";
import { OrderDetailsRow } from "./OrderDetailsRow";
import { OrderDetailsTablePresenter } from "./OrderDetailsTablePresenter";

interface Props {
  tablePresenter: OrderDetailsTablePresenter;
  rows: ServiceOrderItem[];
}

/**
 * OrderDetailsTable Component. Fetches the service catalog once, so each row can name its
 * service by its `web_title`.
 *
 * @param tablePresenter  OrderDetailsTablePresenter
 * @param rows ServiceOrderItem[]
 * @returns ReactNode
 */
export const OrderDetailsTable: React.FC<Props> = ({ tablePresenter, rows, ...props }) => {
  const [isExpanded, onExpansion, expand] = useExpansion();
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  // Row content re-renders on expansion, but the row itself stays mounted, so the ref is
  // already available to scroll to (and, when needed, focus) in the same tick.
  const scrollInstanceOrderDetailsRowIntoView = (
    instanceId: string,
    { focus }: { focus: boolean }
  ) => {
    const rowElement = rowRefs.current[instanceId];

    if (rowElement) {
      rowElement.scrollIntoView({ behavior: "smooth", block: "center" });

      if (focus) {
        rowElement.focus();
      }
    }
  };

  const expandInstanceOrderDetailsRow = (instanceId: string) => {
    expand(instanceId);
    scrollInstanceOrderDetailsRowIntoView(instanceId, { focus: true });
  };

  // Only scroll when a row transitions from collapsed to expanded: its newly revealed content
  // (dependencies, config, ...) can extend well below the fold. Focus is left alone here, since
  // the toggle button the user just clicked already has it.
  const toggleInstanceOrderDetailsRow = (instanceId: string) => () => {
    const wasExpanded = isExpanded(instanceId);

    onExpansion(instanceId)();

    if (!wasExpanded) {
      scrollInstanceOrderDetailsRowIntoView(instanceId, { focus: false });
    }
  };

  const { data: serviceModels } = useGetServiceModels().useOneTime();
  const serviceModelsByName = useMemo(
    () => new Map(serviceModels?.map((serviceModel) => [serviceModel.name, serviceModel])),
    [serviceModels]
  );

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
            serviceTitle={getServiceTitle(
              row.service_entity,
              serviceModelsByName.get(row.service_entity)
            )}
            orderItems={rows}
            key={row.instance_id}
            isExpanded={isExpanded(row.instance_id)}
            onToggle={toggleInstanceOrderDetailsRow(row.instance_id)}
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
