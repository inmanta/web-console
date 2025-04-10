import React from "react";
import { Description, PageContainer } from "@/UI/Components";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { DetailsProvider } from "./DetailsProvider";

export const Page: React.FC = () => {
  const { version, resourceId } = useRouteParams<"DesiredStateResourceDetails">();

  return (
    <PageContainer pageTitle={words("desiredState.resourceDetails.title")}>
      <Description>{resourceId}</Description>
      <DetailsProvider version={version} resourceId={resourceId} />
    </PageContainer>
  );
};
