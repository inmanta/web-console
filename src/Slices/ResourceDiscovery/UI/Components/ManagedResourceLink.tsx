import React from "react";
import { ResourceLink } from "@/UI/Components";

interface Props {
  resourceUri: string | null;
}

/**
 * @Component that renders a link to the managed resource
 * or a "-" if the resourceUri is null or empty.
 *
 * managed_resource_uri comes in format : /api/v2/resource/<rid>
 *
 * @param resourceUri : API URI of the managed resource
 *
 * @returns ManagedResourceLink component
 */
export const ManagedResourceLink: React.FC<Props> = ({ resourceUri }) => {
  if (!resourceUri) {
    return <>-</>;
  }

  const rid = resourceUri.split("/").pop();

  if (!rid) {
    return <>-</>;
  }

  return <ResourceLink resourceId={rid} />;
};
