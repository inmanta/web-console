import React from "react";
import { useParams } from "react-router-dom";
import { PageSectionWithTitle } from "@/UI/Components";
import { Route } from "@/UI/Routing";
import { words } from "@/UI/words";
import { ResourceDetailsView } from "./ResourceDetailsView";

export const Provider: React.FC = () => {
  const { resourceId } = useParams<Route.Params<"ResourceDetails">>();
  return (
    <PageSectionWithTitle title={words("resources.details.title")}>
      <ResourceDetailsView resourceId={resourceId} />
    </PageSectionWithTitle>
  );
};
