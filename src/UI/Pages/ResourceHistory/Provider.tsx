import React from "react";
import { useParams } from "react-router-dom";
import { PageSectionWithTitle } from "@/UI/Components";
import { Route } from "@/UI/Routing";
import { words } from "@/UI/words";
import { ResourceHistoryView } from "./ResourceHistoryView";

export const Provider: React.FC = () => {
  const { resourceId } = useParams<Route.Params<"ResourceHistory">>();

  return (
    <PageSectionWithTitle title={words("resources.history.title")}>
      <ResourceHistoryView resourceId={resourceId} />
    </PageSectionWithTitle>
  );
};
