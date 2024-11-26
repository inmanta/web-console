import React from "react";
import { Label, Spinner } from "@patternfly/react-core";
import styled from "styled-components";
import { words } from "@/UI";
import { ServiceOrderItemState, ServiceOrderState } from "../Core/Query";

/**
 * Custom label tag for orders and serviceOrderItems
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
      return <Label color="green">{status}</Label>;
    case "failed":
      return <Label color="red">{status}</Label>;
    case "in_progress":
      return (
        <Label color="blue">
          <PaddedLabel>{words("orders.status.in_progress")}</PaddedLabel>
          <Spinner size="sm" />
        </Label>
      );
    case "partial":
      return <Label color="orange">{status}</Label>;
  }
};

const PaddedLabel = styled.span`
  padding-right: 1ch;
`;
