import React from "react";
import { words } from "@/UI";
import { ResourceLink } from "@/UI/Components";
import { ButtonVariant } from "@patternfly/react-core";

interface Props {
  resourceUri: string | null;
  resourceType: "managed" | "discovery";
  buttonType?: ButtonVariant;
}

/**
 * @Component that renders a link to the managed or the discovery resource
 * or a "-" if the resourceUri is null or empty.
 *
 * uris comes in format : /api/v2/resource/<rid>
 *
 * @param resourceUri : API URI of the managed/discovery resource
 * @param type : type of the resource
 *
 * @returns DiscoveredResourceLink component
 */
export const DiscoveredResourceLink: React.FC<Props> = ({ resourceUri, resourceType, buttonType = ButtonVariant.link }) => {
  if (!resourceUri) {
    return <></>;
  }

  const rid = extractResourceLink(resourceUri);

  if (!rid) {
    return <></>;
  }

  return (
    <ResourceLink
      resourceId={rid}
      linkText={words(`discovered_resources.show_resource.${resourceType}`)}
      variant={buttonType}
    />
  );
};

// example url : /api/v2/resource/cloudflare::dns_record::CnameRecord[https://api.cloudflare.com/client/v4/,name=artifacts.ssh.inmanta.com]
// We only want to keep the adress to the resource, which is everything that comes after /api/v2/resource/
const extractResourceLink = (uri: string): string | null => {
  const regex = /\/api\/v2\/resource\/(.+)/;
  const match = uri.match(regex);

  return match ? match[1] : null;
};
