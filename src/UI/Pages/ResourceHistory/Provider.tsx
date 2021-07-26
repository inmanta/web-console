import React from "react";
import { useParams } from "react-router-dom";
import { PageSectionWithTitle } from "@/UI/Components";
import { Route } from "@/UI/Routing";
import { words } from "@/UI/words";
import { ResourceHistoryView } from "./ResourceHistoryView";

const Wrapper: React.FC = ({ children, ...props }) => (
  <PageSectionWithTitle {...props} title={words("history.title")}>
    {children}
  </PageSectionWithTitle>
);

export const Provider: React.FC = () => {
  const { resourceId } = useParams<Route.Params<"ResourceHistory">>();

  return (
    <Wrapper>
      <ResourceHistoryView resourceId={resourceId} />
    </Wrapper>
  );
};
