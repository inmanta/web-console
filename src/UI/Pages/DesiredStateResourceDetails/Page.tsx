import React from "react";
import { PageSectionWithTitle } from "@/UI/Components";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { DetailsProvider } from "./DetailsProvider";

export const Page: React.FC = () => {
  const { resourceId } = useRouteParams<"DesiredStateResourceDetails">();

  return (
    <PageSectionWithTitle title={words("desiredState.resourceDetails.title")}>
      <DetailsProvider resourceId={resourceId} />
    </PageSectionWithTitle>
  );
};
