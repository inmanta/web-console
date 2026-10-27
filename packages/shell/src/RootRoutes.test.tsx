import { matchRoutes } from "react-router";
import { FeatureModule } from "@inmanta/web-console-core";
import { PrimaryRouteManager } from "@inmanta/web-console-core/Routing/PrimaryRouteManager";
import { stubRoute } from "@inmanta/web-console-test-utils";
import { createRootRoutes } from "./RootRoutes";

const resourceDetailsRoute = stubRoute("ResourceDetails");
const feature: FeatureModule = {
  id: "test",
  version: "1.0.0",
  routes: [{ route: resourceDetailsRoute, page: () => Promise.resolve(() => null) }],
};

const routeManager = PrimaryRouteManager("/console", [resourceDetailsRoute]);
const rootRoutes = createRootRoutes("/console", [feature]);

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
