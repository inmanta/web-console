import React from "react";
import { ButtonVariant } from "@patternfly/react-core";
import { words } from "@/UI";
import { ResourceLink } from "@/UI/Components";

type ResourceType = "managed" | "discovery";

interface Props {
  resourceId: string | null;
  resourceType: ResourceType;
  buttonType?: ButtonVariant;
}

/**
 * @Component that renders a link to the managed or the discovery resource
 * or a "-" if the resourceUri is null or empty.
 *
 * uris comes in format : /api/v2/resource/<rid>
 *
 * @Props {Props} - The props of the component
 *  @prop {string | null} resourceUri - API URI of the managed/discovery resource
 *  @prop {ResourceType} resourceType - type of the resource
 *  @prop {ButtonVariant} buttonType - type of the button
 *
 * @returns {React.FC} DiscoveredResourceLink component
 */
export const DiscoveredResourceLink: React.FC<Props> = ({
  resourceId,
  resourceType,
  buttonType = ButtonVariant.link,
}) => {
  if (!resourceId) {
    return <></>;
  }

  return (
    <ResourceLink
      resourceId={resourceId}
      linkText={words(`discovered_resources.show_resource.${resourceType}`)}
      variant={buttonType}
    />
  );
};
