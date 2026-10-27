import { matchRoutes } from "react-router";
import { features, routes } from "@/appFeatures";
import { PrimaryRouteManager } from "@inmanta/web-console-core/Routing/PrimaryRouteManager";
import { createRootRoutes } from "./RootRoutes";

const routeManager = PrimaryRouteManager("/console", routes);
const rootRoutes = createRootRoutes("/console", features);

const matchLeaf = (url: string) => matchRoutes(rootRoutes, url)?.at(-1);

test.each`
  description                    | resourceId
  ${"a single-line resource id"} | ${"std::File[agent1,path=/tmp/file]"}
  ${"a multi-line resource id"}  | ${'exec::Run[agent1,command=sh -c "set -e\n/usr/bin/true\r\n/usr/bin/false"]'}
`(
  "GIVEN $description WHEN matching the ResourceDetails url THEN the ResourceDetails route matches with the decoded id",
  ({ resourceId }) => {
    const leaf = matchLeaf(routeManager.getUrl("ResourceDetails", { resourceId }));

    expect(leaf?.route.id).toEqual("ResourceDetails");
    expect(leaf?.params.resourceId).toEqual(resourceId);
  }
);

test("GIVEN an unknown url WHEN matching THEN the not-found route matches", () => {
  expect(matchLeaf("/console/does-not-exist")?.route.path).toEqual("*");
});
