import React from "react";
import { PageSectionWithTitle } from "@/UI/Components";
import { words } from "@/UI/words";
import { ResourceDetailsView } from "./ResourceDetailsView";
import { useRouteParams } from "@/UI/Routing";

export const Page: React.FC = () => {
  const { resourceId } = useRouteParams<"ResourceDetails">();
  return (
    <PageSectionWithTitle title={words("resources.details.title")}>
      <ResourceDetailsView resourceId={resourceId} />
    </PageSectionWithTitle>
  );
};
