import React from "react";
import {
  DescriptionList,
  DescriptionListTerm,
  DescriptionListGroup,
  DescriptionListDescription,
} from "@patternfly/react-core";
import styled from "styled-components";
import { ServiceOrder } from "@/Slices/Orders/Core/Query";
import { OrderProgressBar } from "@/Slices/Orders/UI/OrderProgressBar";
import { OrderStatusLabel } from "@/Slices/Orders/UI/OrderStatusLabel";
import { words } from "@/UI";
import { DateWithTooltip } from "@/UI/Components";

interface Props {
  serviceOrder: ServiceOrder;
}

/**
 * Heading component displaying the high level information if the order.
 *
 * @param serviceOrder ServiceOrder
 * @returns ReactNode
 */
export const OrderDetailsHeading: React.FC<Props> = ({ serviceOrder }) => {
  return (
    <>
      <DescriptionList
        isHorizontal
        columnModifier={{
          default: "2Col",
        }}
        horizontalTermWidthModifier={{
          default: "20ch",
        }}
        aria-label="OrderDetails-Heading"
      >
        <DescriptionListGroup aria-label="OrderState">
          <DescriptionListTerm>
            {words("orders.column.status")}
          </DescriptionListTerm>
          <DescriptionListDescription>
            <OrderStatusLabel status={serviceOrder.status.state} />
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup aria-label="OrderCreatedAt">
          <DescriptionListTerm>
            {words("orders.column.created_at")}
          </DescriptionListTerm>
          <DescriptionListDescription>
            <DateWithTooltip timestamp={serviceOrder.created_at} />
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup aria-label="OrderDescription">
          <DescriptionListTerm>
            {words("orders.column.description")}
          </DescriptionListTerm>
          <DescriptionListDescription>
            {serviceOrder.description || serviceOrder.id}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup aria-label="OrderCompletedAt">
          <DescriptionListTerm>
            {words("orders.column.completed_at")}
          </DescriptionListTerm>
          <DescriptionListDescription>
            {serviceOrder.completed_at ? (
              <DateWithTooltip timestamp={serviceOrder.completed_at} />
            ) : (
              ""
            )}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
      <ProgressDescriptionList
        isHorizontal
        horizontalTermWidthModifier={{
          default: "20ch",
        }}
        aria-label="OrderDetails-Heading-Progress"
      >
        <DescriptionListGroup aria-label="OrderProgress">
          <DescriptionListTerm>
            {words("orders.column.progress")}
          </DescriptionListTerm>
          <DescriptionListDescription>
            <OrderProgressBar
              showTotal
              serviceOrderItems={serviceOrder.service_order_items}
            />
          </DescriptionListDescription>
        </DescriptionListGroup>
      </ProgressDescriptionList>
    </>
  );
};

const ProgressDescriptionList = styled(DescriptionList)`
  padding-bottom: 3em;
  padding-top: 1.5em;
  max-width: 800px;
`;
