import { PrimaryRouteManager } from "@inmanta/web-console-core/Routing/PrimaryRouteManager";
import { stubbedRoutes } from "@inmanta/web-console-test-utils/Inject/stubRoute";
import { app } from "./app";

const routeManager = PrimaryRouteManager("", app.routes);

const stubs: [string, { path: string; parent?: string }][] = Object.entries(stubbedRoutes);

test.each(stubs)(
  "GIVEN the stubbed %s route THEN its path and parent are those of the app's route",
  (kind, stubbed) => {
    const { path, parent } = routeManager.getRoute(kind as keyof typeof stubbedRoutes);

    expect({ path, parent }).toEqual({ path: stubbed.path, parent: stubbed.parent });
  }
);
