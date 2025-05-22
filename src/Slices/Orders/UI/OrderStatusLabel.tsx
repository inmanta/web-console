import React from "react";
import { Label, Spinner } from "@patternfly/react-core";
import { words } from "@/UI";
import { ServiceOrderItemState, ServiceOrderState } from "../Core/Types";

/**
 * Custom label tag for orders and serviceOrderItems
 *
 * When a order is in progress, the status is displayed with a spinner
 * When a order is successful, acknowledged, or completed, the status is displayed with a success color
 * When a order has failed, the status is displayed with a danger color
 *
 * @param status  ServiceOrderItemState | ServiceOrderState
 * @returns ReactNode
 */
export const OrderStatusLabel: React.FC<{
  status: ServiceOrderItemState | ServiceOrderState;
}> = ({ status }) => {
  switch (status) {
    case "acknowledged":
    case "success":
    case "completed":
      return (
        <Label status="success" variant="outline">
          {status}
        </Label>
      );
    case "failed":
      return (
        <Label status="danger" variant="outline">
          {status}
        </Label>
      );
    case "in_progress":
      return (
        <Label color="blue" icon={<Spinner size="sm" />} variant="outline">
          {words("orders.status.in_progress")}
        </Label>
      );
    case "partial":
      return <Label status="warning">{status}</Label>;
  }
};
