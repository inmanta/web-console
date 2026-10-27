import React from "react";
import { words } from "@inmanta/web-console-core";
import { useRouteParams } from "@inmanta/web-console-core/Routing";
import { Description } from "@inmanta/web-console-ui/Components/Description";
import { PageContainer } from "@inmanta/web-console-ui/Components/PageContainer";
import { DetailsProvider } from "./DetailsProvider";

export const Page: React.FC = () => {
  const { version, resourceId } = useRouteParams<"DesiredStateResourceDetails">();

  return (
    <PageContainer
      pageTitle={words("desiredState.resourceDetails.title")}
      hasOverflowScroll
      aria-label={words("desiredState.resourceDetails.title")}
    >
      <Description>{resourceId}</Description>
      <DetailsProvider version={version} resourceId={resourceId} />
    </PageContainer>
  );
};
