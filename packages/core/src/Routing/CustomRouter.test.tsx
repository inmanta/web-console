import React from "react";
import { Outlet } from "react-router";
import { render, screen } from "@testing-library/react";
import { stubRoute } from "@inmanta/web-console-test-utils/Inject/stubRoute";
import CustomRouter from "./CustomRouter";
import { PrimaryRouteManager } from "./PrimaryRouteManager";
import { useRouteParams } from "./Utils";

const routeManager = PrimaryRouteManager("/console", [stubRoute("ResourceDetails")]);
const { path: resourceDetailsPath } = routeManager.getRoute("ResourceDetails");

const ResourceIdProbe: React.FC = () => {
  const { resourceId } = useRouteParams<"ResourceDetails">();

  return <div data-testid="resource-id">{resourceId}</div>;
};

const renderAt = (url: string) => {
  globalThis.history.pushState({}, "", url);

  return render(
    <CustomRouter
      layout={
        <div data-testid="layout">
          <Outlet />
        </div>
      }
      routes={[{ path: resourceDetailsPath, element: <ResourceIdProbe /> }]}
    />
  );
};

test.each`
  description                    | resourceId
  ${"a single-line resource id"} | ${"std::File[agent1,path=/tmp/file]"}
  ${"a multi-line resource id"}  | ${'exec::Run[agent1,command=sh -c "set -e\n/usr/bin/true\r\n/usr/bin/false"]'}
`(
  "GIVEN $description WHEN the ResourceDetails url is opened THEN the route renders inside the layout with the decoded id",
  async ({ resourceId }) => {
    renderAt(`${routeManager.getUrl("ResourceDetails", { resourceId })}?env=aaa`);

    expect(await screen.findByTestId("layout")).toContainElement(
      await screen.findByTestId("resource-id")
    );
    expect(screen.getByTestId("resource-id")).toHaveTextContent(resourceId, {
      normalizeWhitespace: false,
    });
  }
);
