import React, { useContext } from "react";
import { useNavigate } from "react-router";
import { Button, Icon, Tooltip } from "@patternfly/react-core";
import { ExclamationTriangleIcon } from "@patternfly/react-icons";
import { ServiceOrderItem } from "@/Slices/Orders/Core/Types";
import { TextWithCopy } from "@/UI/Components";
import { CopyMultiOptions } from "@/UI/Components/CopyMultiOptions";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { getInstanceDisplayName } from "./getInstanceDisplayName";

interface Props {
  row: ServiceOrderItem;
}

/**
 * Displays the instance_id of a service_order_item, or its service identity
 * attribute value when the status provides one, same as the Instance rows
 * on the Service Inventory table.
 *
 * Navigates to the instance details page when clicked. If the order item is a create action
 * that failed before the instance could be created (EXECUTION_SKIPPED or INVALID_ORDER_ITEM),
 * there is no instance to navigate to, so the id is shown as plain text with a warning icon.
 *
 * @param row ServiceOrderItem
 * @returns ReactNode
 */
export const OrderInstanceLink: React.FC<Props> = ({ row }) => {
  const { routeManager } = useContext(DependencyContext);
  const navigate = useNavigate();

  const instanceDisplayName = getInstanceDisplayName(row);
  const displayValue = instanceDisplayName || row.instance_id;

  const instanceDetailsUrl = routeManager.useUrl("InstanceDetails", {
    service: row.service_entity,
    instance: instanceDisplayName || row.instance_id,
    instanceId: row.instance_id,
  });

  const instanceWasNeverCreated =
    row.action === "create" &&
    (row.status.failure_type === "EXECUTION_SKIPPED" ||
      row.status.failure_type === "INVALID_ORDER_ITEM");

  const content = instanceWasNeverCreated ? (
    <>
      {displayValue}{" "}
      <Tooltip content={words("orders.row.instanceCreationFailed")}>
        <Icon status="warning">
          <ExclamationTriangleIcon />
        </Icon>
      </Tooltip>
    </>
  ) : (
    <Button variant="link" isInline onClick={() => navigate(instanceDetailsUrl)}>
      {displayValue}
    </Button>
  );

  if (instanceDisplayName) {
    return (
      <>
        {content}
        <CopyMultiOptions
          options={[instanceDisplayName, row.instance_id]}
          tooltipContent={words("serviceIdentity.copy")}
        />
      </>
    );
  }

  return (
    <TextWithCopy value={row.instance_id} tooltipContent={words("serviceIdentity.copy")}>
      {content}
    </TextWithCopy>
  );
};
