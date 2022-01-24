import React from "react";
import { PageContainer } from "@/UI/Components";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { ResourceDetailsView } from "./ResourceDetailsView";

export const Page: React.FC = () => {
  const { resourceId } = useRouteParams<"ResourceDetails">();
  return (
    <PageContainer title={words("resources.details.title")}>
      <ResourceDetailsView resourceId={resourceId} />
    </PageContainer>
  );
};
