import React from "react";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { act } from "react-dom/test-utils";
import { EnvironmentModifier, RemoteData } from "@/Core";
import { getStoreInstance } from "@/Data";
import { EnvironmentDetails, EnvironmentSettings } from "@/Test";
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

function setup() {
  const environmentId = "env";
  const store = getStoreInstance();
  store.dispatch.environment.setSettingsData({
    environment: environmentId,
    value: RemoteData.success({
      settings: {},
      definition: EnvironmentSettings.definition,
    }),
  });
  const environmentModifier = new EnvironmentModifierImpl();
  environmentModifier.setEnvironment(environmentId);
  const component = (
    <StoreProvider store={store}>
      <DummyComponent environmentModifier={environmentModifier} />
    </StoreProvider>
  );
  return { component, store, environmentId };
}

test("Given the environmentModifier When the server compile setting is requested Then returns the correct value", async () => {
  const { component, store, environmentId } = setup();
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
