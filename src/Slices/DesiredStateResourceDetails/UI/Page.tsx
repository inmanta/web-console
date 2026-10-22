import React from "react";
import { words } from "@/Core";
import { Description } from "@/UI/Components/Description";
import { PageContainer } from "@/UI/Components/PageContainer";
import { useRouteParams } from "@/UI/Routing";
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
