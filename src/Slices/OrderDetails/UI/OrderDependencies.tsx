import React from "react";
import { Button, Card, Label } from "@patternfly/react-core";
import { InfoAltIcon } from "@patternfly/react-icons";
import { Table, Tbody, Td, Tr } from "@patternfly/react-table";
import { ServiceOrderItemDependencies } from "@/Slices/Orders/Core/Types";
import { OrderStatusLabel } from "@/Slices/Orders/UI/OrderStatusLabel";
import { words } from "@/UI";
import { TextWithCopy } from "@/UI/Components";

interface Props {
  dependencies: ServiceOrderItemDependencies;
  expandInstanceOrderDetailsRow?: (instanceId: string) => void;
}

/**
 * Displays the direct_dependencies from the service_order_item.
 * If the service_order_item doesn't have dependencies, it will display an Empty badge.
 *
 * Dependencies contain the ID of the instance and their matching status.
 * The instance_id only refers to an instance being part of the Order.
 *
 * Clicking a dependency row expands and focuses the matching row in the order details table.
 *
 * @param dependencies ServiceOrderItemDependencies
 * @param expandInstanceOrderDetailsRow callback invoked with the instanceId of the clicked dependency
 * @returns ReactNode
 */
export const OrderDependencies: React.FC<Props> = ({
  dependencies,
  expandInstanceOrderDetailsRow,
}) => {
  if (!Object.keys(dependencies).length) {
    return (
      <Label color="blue" variant="outline" icon={<InfoAltIcon />}>
        {words("orders.row.empty")}
      </Label>
    );
  }

  return (
    <Card>
      <Table>
        <Tbody>
          {Object.entries(dependencies).map(([instance_id, status], index) => (
            <Tr
              key={instance_id}
              aria-label={`Dependency-Row-${index}`}
              isClickable={Boolean(expandInstanceOrderDetailsRow)}
              onRowClick={
                expandInstanceOrderDetailsRow
                  ? () => expandInstanceOrderDetailsRow(instance_id)
                  : undefined
              }
            >
              <Td>
                <TextWithCopy value={instance_id} tooltipContent={words("serviceIdentity.copy")}>
                  {expandInstanceOrderDetailsRow ? (
                    <Button
                      variant="link"
                      isInline
                      onClick={(event) => {
                        event.stopPropagation();
                        expandInstanceOrderDetailsRow(instance_id);
                      }}
                    >
                      {instance_id}
                    </Button>
                  ) : (
                    instance_id
                  )}
                </TextWithCopy>
              </Td>
              <Td>
                <OrderStatusLabel status={status} />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Card>
  );
};
