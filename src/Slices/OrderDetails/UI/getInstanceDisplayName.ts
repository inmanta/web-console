import { ServiceOrderItem } from "@/Slices/Orders/Core/Types";

/**
 * Returns the service identity display name or attribute value for an order item,
 * or null if the item is unknown or has neither set.
 */
export function getInstanceDisplayName(row: ServiceOrderItem | undefined): string | null {
  if (!row) {
    return null;
  }

  return row.status.service_identity_attribute_value;
}
