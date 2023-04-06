import React from "react";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { act } from "react-dom/test-utils";
import { EnvironmentModifier, RemoteData } from "@/Core";
import { DefinitionMap } from "@/Core/Domain/EnvironmentSettings";
import { getStoreInstance } from "@/Data";
import { EnvironmentDetails, EnvironmentSettings } from "@/Test";
import ErrorBoundary from "../Utils/ErrorBoundary";
import { EnvironmentModifierImpl } from "./EnvironmentModifier";

const DummyComponent: React.FC<{
  environmentModifier: EnvironmentModifier;
}> = ({ environmentModifier }) => {
  return environmentModifier.useIsServerCompileEnabled() ? (
    <div aria-label="server-compile-enabled" />
  ) : (
    <div aria-label="server-compile-disabled" />
  );
};

function setup(definition: DefinitionMap) {
  const environmentId = "env";
  const store = getStoreInstance();
  store.dispatch.environment.setSettingsData({
    environment: environmentId,
    value: RemoteData.success({
      settings: {},
      definition,
    }),
  });
  const environmentModifier = EnvironmentModifierImpl();
  environmentModifier.setEnvironment(environmentId);
  const component = (
    <ErrorBoundary>
      <StoreProvider store={store}>
        <DummyComponent environmentModifier={environmentModifier} />
      </StoreProvider>
    </ErrorBoundary>
  );
  return { component, store, environmentId };
}

test("Given the environmentModifier When the server compile setting is requested Then returns the correct value", async () => {
  const { component, store, environmentId } = setup(
    EnvironmentSettings.definition
  );
  // No setting is specified, and the default is true
  store.dispatch.environment.setEnvironmentDetailsById({
    id: environmentId,
    value: RemoteData.success({ ...EnvironmentDetails.a, settings: {} }),
  });

  render(component);

  expect(
    await screen.findByRole("generic", { name: "server-compile-enabled" })
  ).toBeVisible();

  // Set the option explicitly to false
  await act(async () => {
    store.dispatch.environment.setEnvironmentDetailsById({
      id: environmentId,
      value: RemoteData.success({
        ...EnvironmentDetails.a,
        settings: { server_compile: false },
      }),
    });
  });
  expect(
    await screen.findByRole("generic", { name: "server-compile-disabled" })
  ).toBeVisible();

  // Set the option explicitly to true
  await act(async () => {
    store.dispatch.environment.setEnvironmentDetailsById({
      id: environmentId,
      value: RemoteData.success({
        ...EnvironmentDetails.a,
        settings: { server_compile: true },
      }),
    });
  });
  expect(
    await screen.findByRole("generic", { name: "server-compile-enabled" })
  ).toBeVisible();
});

test("Given the environmentModifier When the missing setting is requested Then returns false without crashing the component", async () => {
  delete EnvironmentSettings.definition.server_compile;
  const { component, store, environmentId } = setup(
    EnvironmentSettings.definition
  );
  // No setting is specified, and the dafault is missing
  store.dispatch.environment.setEnvironmentDetailsById({
    id: environmentId,
    value: RemoteData.success({ ...EnvironmentDetails.a, settings: {} }),
  });

  render(component);
  //expect to see div as the value would be false insteand of error boundary page
  expect(
    await screen.findByRole("generic", { name: "server-compile-disabled" })
  ).toBeVisible();
});
