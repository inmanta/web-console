import React from "react";
import { useParams } from "react-router-dom";
import { RouteParams } from "@/Core";
import { PageSectionWithTitle } from "@/UI/Components";
import { words } from "@/UI/words";
import { ResourceDetailsView } from "./ResourceDetailsView";

export const Page: React.FC = () => {
  const { resourceId } = useParams<RouteParams<"ResourceDetails">>();
  return (
    <PageSectionWithTitle title={words("resources.details.title")}>
      <ResourceDetailsView resourceId={resourceId} />
    </PageSectionWithTitle>
  );
};
