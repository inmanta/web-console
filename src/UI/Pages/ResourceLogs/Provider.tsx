import React from "react";
import { useParams } from "react-router-dom";
import { PageSectionWithTitle } from "@/UI/Components";
import { Route } from "@/UI/Routing";
import { words } from "@/UI/words";
import { View } from "./View";

export const Provider: React.FC = () => {
  const { resourceId } = useParams<Route.Params<"ResourceLogs">>();

  return (
    <PageSectionWithTitle title={words("resources.logs.title")}>
      <View resourceId={resourceId} />
    </PageSectionWithTitle>
  );
};
