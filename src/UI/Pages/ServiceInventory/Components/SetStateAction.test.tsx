import React from "react";
import { fireEvent, screen, render, act } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { EnvironmentDetails, RemoteData } from "@/Core";
import {
  TriggerSetStateCommandManager,
  CommandResolverImpl,
  BaseApiHelper,
  KeycloakAuthHelper,
  getStoreInstance,
} from "@/Data";
import {
  dependencies,
  DynamicCommandManagerResolver,
  MockEnvironmentModifier,
  ServiceInstance,
} from "@/Test";
import { DependencyProvider, EnvironmentModifierImpl } from "@/UI/Dependency";
import { SetStateAction } from "./SetStateAction";

function setup() {
  const commandManager = new TriggerSetStateCommandManager(
    new KeycloakAuthHelper(),
    new BaseApiHelper()
  );
  return {
    commandResolver: new CommandResolverImpl(
      new DynamicCommandManagerResolver([commandManager])
    ),
  };
}
function setupComponent() {
  const { commandResolver } = setup();
  return {
    component: (
      <DependencyProvider
        dependencies={{
          ...dependencies,
          commandResolver,
          environmentModifier: new MockEnvironmentModifier(),
        }}
      >
        <SetStateAction
          id={ServiceInstance.a.id}
          service_entity={ServiceInstance.a.service_entity}
          version={ServiceInstance.a.version}
          targets={ServiceInstance.a.instanceSetStateTargets}
        />
      </DependencyProvider>
    ),
  };
}

test("SetStateAction dropdown is disabled when no targets are found", async () => {
  const id = ServiceInstance.b.id;
  const { commandResolver } = setup();
  render(
    <DependencyProvider
      dependencies={{
        ...dependencies,
        commandResolver,
        environmentModifier: new MockEnvironmentModifier(),
      }}
    >
      <SetStateAction
        id={ServiceInstance.b.id}
        service_entity={ServiceInstance.b.service_entity}
        version={ServiceInstance.b.version}
        targets={[]}
      />
    </DependencyProvider>
  );
  const testid = `${id}-set-state-toggle`;
  expect(await screen.findByTestId(testid)).toBeDisabled();
});

test("SetStateAction dropdown takes environment halted status in account", async () => {
  const id = ServiceInstance.b.id;
  const { commandResolver } = setup();
  const storeInstance = getStoreInstance();
  storeInstance.dispatch.environment.setEnvironmentDetailsById({
    id: ServiceInstance.b.environment,
    value: RemoteData.success({ halted: false } as EnvironmentDetails),
  });
  const environmentModifier = new EnvironmentModifierImpl();
  environmentModifier.setEnvironment(ServiceInstance.b.environment);
  const componentWithDependencies = (targets: string[]) => (
    <DependencyProvider
      dependencies={{
        ...dependencies,
        commandResolver,
        environmentModifier,
      }}
    >
      <StoreProvider store={storeInstance}>
        <SetStateAction
          id={ServiceInstance.b.id}
          service_entity={ServiceInstance.b.service_entity}
          version={ServiceInstance.b.version}
          targets={targets}
        />
      </StoreProvider>
    </DependencyProvider>
  );
  const { rerender } = render(componentWithDependencies([]));
  act(() => {
    storeInstance.dispatch.environment.setEnvironmentDetailsById({
      id: ServiceInstance.b.environment,
      value: RemoteData.success({ halted: true } as EnvironmentDetails),
    });
  });

  rerender(componentWithDependencies(["update_started"]));
  const testid = `${id}-set-state-toggle`;
  expect(await screen.findByTestId(testid)).toBeDisabled();
});

test("SetStateAction dropdown can be expanded", async () => {
  const id = ServiceInstance.a.id;
  const { component } = setupComponent();
  render(component);
  const testid = `${id}-set-state-toggle`;

  fireEvent.click(await screen.findByTestId(testid));

  expect(await screen.findByTestId(`${id}-acknowledged`)).toBeVisible();
  expect(await screen.findByTestId(`${id}-designed`)).toBeVisible();
});

test("SetStateAction shows confirmation dialog when element is selected", async () => {
  const id = ServiceInstance.a.id;
  const { component } = setupComponent();
  render(component);
  const testid = `${id}-set-state-toggle`;

  fireEvent.click(await screen.findByTestId(testid));
  fireEvent.click(await screen.findByTestId(`${id}-acknowledged`));

  expect(await screen.findByTestId(`${id}-set-state-modal`)).toBeVisible();
});

test("SetStateAction calls onSetInstanceState when transfer is confirmed", async () => {
  const id = ServiceInstance.a.id;
  const { component } = setupComponent();
  render(component);
  const testid = `${id}-set-state-toggle`;

  fireEvent.click(await screen.findByTestId(testid));
  fireEvent.click(await screen.findByTestId(`${id}-acknowledged`));

  expect(await screen.findByTestId(`${id}-set-state-modal`)).toBeVisible();
  fireEvent.click(await screen.findByTestId(`${id}-set-state-modal-confirm`));
  expect(screen.queryByTestId(`${id}-set-state-modal`)).not.toBeInTheDocument();
  expect(fetchMock.mock.calls).toHaveLength(1);
});

test("SetStateAction closes confirmation modal when transfer is cancelled", async () => {
  const id = ServiceInstance.a.id;
  const { component } = setupComponent();
  render(component);
  const testid = `${id}-set-state-toggle`;

  fireEvent.click(await screen.findByTestId(testid));
  fireEvent.click(await screen.findByTestId(`${id}-acknowledged`));

  expect(await screen.findByTestId(`${id}-set-state-modal`)).toBeVisible();
  fireEvent.click(await screen.findByTestId(`${id}-set-state-modal-cancel`));
  expect(screen.queryByTestId(`${id}-set-state-modal`)).not.toBeInTheDocument();
  expect(fetchMock.mock.calls).toHaveLength(0);
});

test("SetStateAction shows error message when transfer not successful", async () => {
  fetchMock.mockResponseOnce(JSON.stringify({ message: "Invalid request" }), {
    status: 400,
    statusText: "Bad Request",
  });
  const id = ServiceInstance.a.id;
  const { component } = setupComponent();
  render(component);
  const testid = `${id}-set-state-toggle`;

  fireEvent.click(await screen.findByTestId(testid));
  fireEvent.click(await screen.findByTestId(`${id}-acknowledged`));

  // Modal is visible
  expect(await screen.findByTestId(`${id}-set-state-modal`)).toBeVisible();
  // Confirm transfer
  fireEvent.click(await screen.findByTestId(`${id}-set-state-modal-confirm`));
  expect(screen.queryByTestId(`${id}-set-state-modal`)).not.toBeInTheDocument();
  expect(fetchMock.mock.calls).toHaveLength(1);
  // Error message is shown
  expect(await screen.findByTestId(`${id}-error-message`)).toBeVisible();
  fireEvent.click(await screen.findByTestId(`${id}-close-error-message`));
  // Error message can be closed
  expect(screen.queryByTestId(`${id}-error-message`)).not.toBeInTheDocument();
});
