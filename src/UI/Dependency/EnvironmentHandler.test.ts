import { createMemoryHistory } from "history";
import { RemoteData } from "@/Core";
import { getStoreInstance } from "@/Data";
import { Environment } from "@/Test";
import { PrimaryRouteManager } from "@/UI/Routing";
import { EnvironmentHandlerImpl } from ".";

const routeManager = new PrimaryRouteManager("");

test("EnvironmentHandler updates environment correctly", () => {
  const history = createMemoryHistory({
    initialEntries: ["/resources?env=123"],
  });
  const store = getStoreInstance();
  const env = Environment.filterable[0];
  store
    .getActions()
    .environments.setEnvironments(RemoteData.success(Environment.filterable));

  const environmentHandler = new EnvironmentHandlerImpl(
    history.location,
    (path) => history.push(path),
    routeManager
  );
  environmentHandler.set(env.id);

  expect(history.location.search).toEqual(`?env=${env.id}`);
});

test("EnvironmentHandler determines selected environment correctly", () => {
  const history = createMemoryHistory();

  const environmentHandler = new EnvironmentHandlerImpl(
    history.location,
    (path) => history.push(path),
    routeManager
  );

  expect(
    environmentHandler.determineSelected(
      RemoteData.notAsked(),
      history.location.search
    )
  ).toBeUndefined();
  history.push(`?env=${Environment.filterable[0].id}`);
  expect(
    environmentHandler.determineSelected(
      RemoteData.notAsked(),
      history.location.search
    )
  ).toBeUndefined();

  expect(
    environmentHandler.determineSelected(
      RemoteData.success(Environment.filterable),
      history.location.search
    )
  ).toEqual(Environment.filterable[0]);

  environmentHandler.set(Environment.filterable[1].id);
  expect(
    environmentHandler.determineSelected(
      RemoteData.success(Environment.filterable),
      history.location.search
    )
  ).toEqual(Environment.filterable[1]);
});
