import React from "react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { render, screen } from "@testing-library/react";
import { RouteKind } from "@/Core";
import { PrimaryRouteManager } from "./PrimaryRouteManager";
import { useRouteParams } from "./Utils";

const routeManager = PrimaryRouteManager("");

function makeProbe<K extends RouteKind>() {
  return function ParamsProbe() {
    const params = useRouteParams<K>();

    return <div data-testid="params">{JSON.stringify(params)}</div>;
  };
}

function renderAtUrl(routePath: string, element: React.ReactElement, url: string) {
  const router = createMemoryRouter([{ path: routePath, element }], {
    initialEntries: [url],
  });

  return render(<RouterProvider router={router} />);
}

function getRenderedParams(): Record<string, string> {
  return JSON.parse(screen.getByTestId("params").textContent ?? "{}");
}

const InstanceDetailsProbe = makeProbe<"InstanceDetails">();
const { path: instanceDetailsPath } = routeManager.getRoute("InstanceDetails");

test("GIVEN a route param containing a literal '%' WHEN read via useRouteParams THEN the original value is returned without throwing", () => {
  const url = routeManager.getUrl("InstanceDetails", {
    service: "basic-service",
    instance: "100%",
    instanceId: "100%",
  });

  expect(() => renderAtUrl(instanceDetailsPath, <InstanceDetailsProbe />, url)).not.toThrow();

  const params = getRenderedParams();

  expect(params.instance).toEqual("100%");
  expect(params.instanceId).toEqual("100%");
});

test("GIVEN a route param containing a space WHEN written with getUrl and read back with useRouteParams THEN the value is decoded exactly once", () => {
  const url = routeManager.getUrl("InstanceDetails", {
    service: "basic-service",
    instance: "Parent 1",
    instanceId: "Parent 1",
  });

  renderAtUrl(instanceDetailsPath, <InstanceDetailsProbe />, url);

  const params = getRenderedParams();

  expect(params.instance).toEqual("Parent 1");
  expect(params.instanceId).toEqual("Parent 1");
});

const ResourceDetailsProbe = makeProbe<"ResourceDetails">();
const { path: resourceDetailsPath } = routeManager.getRoute("ResourceDetails");

test.each`
  description                                          | resourceId
  ${"namespaced type, brackets, comma, equals, slash"} | ${"std::File[agent1,path=/etc/motd]"}
  ${"nested namespace with multiple attributes"}       | ${"std::testing::NullResource[internal,name=test,other=value]"}
  ${"path attribute with spaces"}                      | ${"std::File[internal,path=/tmp/dir with spaces/file.txt]"}
  ${"value ending in a bare '%'"}                      | ${"std::File[agent1,path=/etc/config%]"}
  ${"value containing a '%XX'-looking sequence"}       | ${"std::File[agent1,description=100%25done]"}
  ${"unicode characters"}                              | ${"std::File[agent1,path=/etc/héllo/wörld]"}
`(
  "GIVEN a resource id with $description WHEN written with getUrl and read back with useRouteParams THEN the value round-trips exactly",
  ({ resourceId }) => {
    const url = routeManager.getUrl("ResourceDetails", { resourceId });

    expect(() => renderAtUrl(resourceDetailsPath, <ResourceDetailsProbe />, url)).not.toThrow();

    const params = getRenderedParams();

    expect(params.resourceId).toEqual(resourceId);
  }
);

const DesiredStateResourceDetailsProbe = makeProbe<"DesiredStateResourceDetails">();
const { path: desiredStateResourceDetailsPath } = routeManager.getRoute(
  "DesiredStateResourceDetails"
);

test("GIVEN multiple route params each containing complicated characters WHEN written with getUrl and read back with useRouteParams THEN every value round-trips exactly", () => {
  const version = "3";
  const resourceId = "std::testing::NullResource[internal,name=test,path=/tmp/a,b]";

  const url = routeManager.getUrl("DesiredStateResourceDetails", { version, resourceId });

  renderAtUrl(desiredStateResourceDetailsPath, <DesiredStateResourceDetailsProbe />, url);

  const params = getRenderedParams();

  expect(params.version).toEqual(version);
  expect(params.resourceId).toEqual(resourceId);
});
