import React from "react";
import { words } from "@/UI";
import { ResourceLink } from "@/UI/Components";

interface Props {
  resourceId: string | null;
  type: "managed" | "discovery";
}

/**
 * @Component that renders a link to the managed or the discovery resource
 * if the resourceId is not null or empty.
 *
 * @param resourceId : Id of the managed/discovery resource
 *
 * @returns DiscoveredResourceLink component
 */
export const DiscoveredResourceLink: React.FC<Props> = ({ resourceId, type }) => {
  if (!resourceId) {
    return <></>;
  }

  return (
    <ResourceLink
      resourceId={resourceId}
      linkText={words(`discovered_resources.show_resource.${type}`)}
    />
  );
};
