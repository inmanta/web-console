import React, { useContext } from "react";
import { Route, Switch } from "react-router-dom";
import { useDocumentTitle } from "@/UI/Routing";
import { DependencyContext } from "..";
import { NotFound } from "./NotFound";
import { PrimaryPageManager } from "./PrimaryPageManager";

export const PageRouter: React.FC = () => {
  const { routeManager } = useContext(DependencyContext);
  const pages = new PrimaryPageManager(
    routeManager.getRouteDictionary()
  ).getPages();

  return (
    <Switch>
      {pages.map(({ path, label, kind, component }) => (
        <Route
          path={path}
          exact
          component={component}
          key={kind}
          title={label}
        />
      ))}
      <PageNotFound title={"404 Page Not Found"} />
    </Switch>
  );
};

const PageNotFound = ({ title }: { title: string }) => {
  useDocumentTitle(title);
  return <Route component={NotFound} />;
};
