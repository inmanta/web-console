import { createMemoryHistory } from "@remix-run/router";
import { renderHook } from "@testing-library/react";
import { Environment } from "@/Test";
import { PrimaryRouteManager } from "@/UI/Routing";
import { EnvironmentHandlerImpl } from ".";

const routeManager = PrimaryRouteManager("");

test("EnvironmentHandler updates environment correctly", () => {
  const history = createMemoryHistory({
    initialEntries: ["/resources?env=123"],
  });
  const env = Environment.filterable[0];

  const { result } = renderHook(() => EnvironmentHandlerImpl(() => history.location, routeManager));

  result.current.set(history.push, history.location, env.id);

  expect(history.location.search).toEqual(`?env=${env.id}`);
});

test("EnvironmentHandler uses name and Id correctly", () => {
  const history = createMemoryHistory();
  const env = Environment.filterable[0];

  const { result } = renderHook(() => EnvironmentHandlerImpl(() => history.location, routeManager));
  result.current.setAllEnvironments(Environment.filterable);
  result.current.set(history.push, history.location, env.id);

  expect(result.current.useName()).toEqual(env.name);
  expect(result.current.useId()).toEqual(env.id);
});

test("EnvironmentHandler determines selected environment correctly", () => {
  const history = createMemoryHistory();

  const { result } = renderHook(() => EnvironmentHandlerImpl(() => history.location, routeManager));

  expect(result.current.determineSelected([], history.location.search)).toBeUndefined();
  history.push(`?env=${Environment.filterable[0].id}`);
  expect(result.current.determineSelected([], history.location.search)).toBeUndefined();

  expect(result.current.determineSelected(Environment.filterable, history.location.search)).toEqual(
    Environment.filterable[0]
  );

  result.current.set(history.push, history.location, Environment.filterable[1].id);
  expect(result.current.determineSelected(Environment.filterable, history.location.search)).toEqual(
    Environment.filterable[1]
  );
});
