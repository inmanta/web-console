import React from "react";
import { Card, Label } from "@patternfly/react-core";
import { InfoAltIcon } from "@patternfly/react-icons";
import { Table, Tbody, Td, Tr } from "@patternfly/react-table";
import { ServiceOrderItemDependencies } from "@/Slices/Orders/Core/Types";
import { OrderStatusLabel } from "@/Slices/Orders/UI/OrderStatusLabel";
import { words } from "@/UI";
import { TextWithCopy } from "@/UI/Components";

interface Props {
  dependencies: ServiceOrderItemDependencies;
}

/**
 * Displays the direct_dependencies from the service_order_item.
 * If the service_order_item doesn't have dependencies, it will display an Empty badge.
 *
 * Dependencies contain the ID of the instance and their matching status.
 * The instance_id only refers to an instance being part of the Order.
 *
 * @param dependencies ServiceOrderItemDependencies
 * @returns ReactNode
 */
export const OrderDependencies: React.FC<Props> = ({ dependencies }) => {
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
            <Tr key={instance_id} aria-label={`Dependency-Row-${index}`}>
              <Td>
                <TextWithCopy value={instance_id} tooltipContent={words("serviceIdentity.copy")} />
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
