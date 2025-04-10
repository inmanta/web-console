import { createMemoryHistory } from "history";
import { Environment } from "@/Test";
import { PrimaryRouteManager } from "@/UI/Routing";
import { EnvironmentHandlerImpl } from ".";

const routeManager = PrimaryRouteManager("");

test("EnvironmentHandler updates environment correctly", () => {
  const history = createMemoryHistory({
    initialEntries: ["/resources?env=123"],
  });
  const env = Environment.filterable[0];

  const environmentHandler = EnvironmentHandlerImpl(() => history.location, routeManager);

  environmentHandler.set(history.push, history.location, env.id);

  expect(history.location.search).toEqual(`?env=${env.id}`);
});

test("EnvironmentHandler determines selected environment correctly", () => {
  const history = createMemoryHistory();

  const environmentHandler = EnvironmentHandlerImpl(() => history.location, routeManager);

  expect(environmentHandler.determineSelected(history.location.search)).toBeUndefined();
  history.push(`?env=${Environment.filterable[0].id}`);
  expect(environmentHandler.determineSelected(history.location.search)).toBeUndefined();

  expect(environmentHandler.determineSelected(history.location.search)).toEqual(
    Environment.filterable[0]
  );

  environmentHandler.set(history.push, history.location, Environment.filterable[1].id);
  expect(environmentHandler.determineSelected(history.location.search)).toEqual(
    Environment.filterable[1]
  );
});
