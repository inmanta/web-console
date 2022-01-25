import React from "react";
import { PageContainer } from "@/UI/Components";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { DetailsProvider } from "./DetailsProvider";

export const Page: React.FC = () => {
  const { resourceId } = useRouteParams<"DesiredStateResourceDetails">();

  return (
    <PageContainer title={words("desiredState.resourceDetails.title")}>
      <DetailsProvider resourceId={resourceId} />
    </PageContainer>
  );
};
