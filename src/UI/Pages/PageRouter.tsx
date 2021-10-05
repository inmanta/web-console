import React from "react";
import { Route, Switch } from "react-router-dom";
import { NotFound } from "./NotFound";
import { pages } from "./Pages";
import { useDocumentTitle } from "@/UI/Routing";

export const PageRouter: React.FC = () => (
  <Switch>
    {pages.map(({ path, label, kind, component }) => (
      <Route path={path} exact component={component} key={kind} title={label} />
    ))}
    <PageNotFound title={"404 Page Not Found"} />
  </Switch>
);

const PageNotFound = ({ title }: { title: string }) => {
  useDocumentTitle(title);
  return <Route component={NotFound} />;
};
