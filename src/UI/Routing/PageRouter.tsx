import React, { useContext } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { NotFound } from "@/UI/Pages";
import { useDocumentTitle } from "./useDocumentTitle";
import { pages } from "./Page";
import { getUrl } from "./Utils";

import { DependencyManagerContext, DependencyProvider } from "@/UI/Dependency";

export const PageRouterWithDependencies: React.FC<{ environment: string }> = ({
  environment,
}) => {
  const dependencyManager = useContext(DependencyManagerContext);
  const dependencies = dependencyManager.getDependencies(environment);

  return (
    <DependencyProvider dependencies={dependencies}>
      <PageRouter />
    </DependencyProvider>
  );
};

const PageRouter: React.FC = () => (
  <Switch>
    {pages.map(({ path, label, kind, component }) => (
      <Route path={path} exact component={component} key={kind} title={label} />
    ))}
    <Route
      exact={true}
      path="/"
      component={() => <Redirect to={getUrl("Catalog", undefined)} />}
    />
    <PageNotFound title={"404 Page Not Found"} />
  </Switch>
);

const PageNotFound = ({ title }: { title: string }) => {
  useDocumentTitle(title);
  return <Route component={NotFound} />;
};
