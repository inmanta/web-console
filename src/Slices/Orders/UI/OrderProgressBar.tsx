import React from "react";
import {
  t_global_icon_color_status_danger_default,
  t_global_color_brand_default,
  t_global_icon_color_status_success_default,
} from "@patternfly/react-tokens";
import { words } from "@/UI";
import { LegendBar, LegendItemDetails } from "@/UI/Components";
import { ServiceOrderItem } from "../Core/Types";

interface Props {
  serviceOrderItems: ServiceOrderItem[];
  showTotal?: boolean;
}

/**
 * OrderProgress Component
 *
 * Displays the states for the ServiceOrderItems in the form of a progress-bar.
 *
 * @param serviceOrderItems ServiceOrderItem[]
 * @param showTotal boolean
 * @returns ReactNode
 */
export const OrderProgressBar: React.FC<Props> = ({ serviceOrderItems, showTotal = false }) => {
  const done = getTotalDoneState(serviceOrderItems || []);

  return (
    <LegendBar
      items={fromProgressToItems(serviceOrderItems)}
      {...(showTotal && {
        total: {
          format: (total) => `${done} / ${total}`,
        },
      })}
    />
  );
};

/**
 * Returns how many items are completed/failed on the total amount of serviceOrderItems
 *
 * @param items ServiceOrderItem[]
 * @returns number
 */
const getTotalDoneState = (items: ServiceOrderItem[]) => {
  const done: number = items.filter((item) => {
    return item.status.state === "completed" || item.status.state === "failed";
  }).length;

  return done;
};

/**
 * Processes the different states of the service_order_items into an array or LegendItemDetails.
 * the value in each object is the total amount of items that have that specific state.
 *
 * @param items ServiceOrderItem[]
 * @returns LegendItemDetails[]
 */
const fromProgressToItems = (items: ServiceOrderItem[]): LegendItemDetails[] => {
  return [
    {
      id: "acknowledged",
      label: words("orders.status.acknowledged"),
      value: Number(items.filter((item) => item.status.state === "acknowledged").length),
      backgroundColor: t_global_icon_color_status_success_default.var,
    },
    {
      id: "failed",
      label: words("orders.status.failed"),
      value: Number(items.filter((item) => item.status.state === "failed").length),
      backgroundColor: t_global_icon_color_status_danger_default.var,
    },
    {
      id: "completed",
      label: words("orders.status.completed"),
      value: Number(items.filter((item) => item.status.state === "completed").length),
      backgroundColor: t_global_icon_color_status_success_default.var,
    },
    {
      id: "in_progress",
      label: words("orders.status.in_progress"),
      value: Number(items.filter((item) => item.status.state === "in_progress").length),
      backgroundColor: t_global_color_brand_default.var,
    },
  ].filter((item) => item.value > 0);
};
