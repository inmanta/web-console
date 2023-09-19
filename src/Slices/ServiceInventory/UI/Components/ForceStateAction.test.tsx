import React from "react";
import { screen, render, act } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { EnvironmentDetails, RemoteData } from "@/Core";
import {
  TriggerForceStateCommandManager,
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
import { ForceStateAction } from "./ForceStateAction";

function setup() {
  const commandManager = TriggerForceStateCommandManager(
    new KeycloakAuthHelper(),
    new BaseApiHelper(),
  );
  return {
    commandResolver: new CommandResolverImpl(
      new DynamicCommandManagerResolver([commandManager]),
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
        <ForceStateAction
          id={ServiceInstance.a.id}
          instance_identity={
            ServiceInstance.a.service_identity_attribute_value ??
            ServiceInstance.a.id
          }
          service_entity={ServiceInstance.a.service_entity}
          version={ServiceInstance.a.version}
          possibleInstanceStates={["up", "deleting"]}
        />
      </DependencyProvider>
    ),
  };
}
describe("ForceStateAction", () => {
  it("dropdown doesn't takes environment halted status in account", async () => {
    const id = ServiceInstance.b.id;
    const { commandResolver } = setup();
    const storeInstance = getStoreInstance();
    storeInstance.dispatch.environment.setEnvironmentDetailsById({
      id: ServiceInstance.b.environment,
      value: RemoteData.success({ halted: false } as EnvironmentDetails),
    });
    const environmentModifier = EnvironmentModifierImpl();
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
          <ForceStateAction
            id={ServiceInstance.b.id}
            instance_identity={
              ServiceInstance.b.service_identity_attribute_value ??
              ServiceInstance.b.id
            }
            service_entity={ServiceInstance.b.service_entity}
            version={ServiceInstance.b.version}
            possibleInstanceStates={targets}
          />
        </StoreProvider>
      </DependencyProvider>
    );
    const { rerender } = render(componentWithDependencies([]));
    await act(async () => {
      storeInstance.dispatch.environment.setEnvironmentDetailsById({
        id: ServiceInstance.b.environment,
        value: RemoteData.success({ halted: true } as EnvironmentDetails),
      });
    });

    rerender(componentWithDependencies(["update_started"]));
    const testid = `${id}-force-state-toggle`;
    expect(await screen.findByTestId(testid)).toBeEnabled();
  });

  it("dropdown can be expanded", async () => {
    const id = ServiceInstance.a.id;
    const { component } = setupComponent();
    render(component);
    const testid = `${id}-force-state-toggle`;

    await act(async () => {
      await userEvent.click(await screen.findByTestId(testid));
    });
    expect(await screen.findByTestId(`${id}-up-expert`)).toBeVisible();
    expect(await screen.findByTestId(`${id}-deleting-expert`)).toBeVisible();
  });

  it("shows confirmation dialog when element is selected", async () => {
    const id = ServiceInstance.a.id;
    const { component } = setupComponent();
    render(component);
    const testid = `${id}-force-state-toggle`;

    await act(async () => {
      await userEvent.click(await screen.findByTestId(testid));
    });
    await act(async () => {
      await userEvent.click(await screen.findByTestId(`${id}-deleting-expert`));
    });
    expect(await screen.findByTestId(`${id}-state-modal`)).toBeVisible();
  });

  it("calls onSetInstanceState when transfer is confirmed", async () => {
    const id = ServiceInstance.a.id;
    const { component } = setupComponent();
    render(component);
    const testid = `${id}-force-state-toggle`;

    await act(async () => {
      await userEvent.click(await screen.findByTestId(testid));
    });
    await act(async () => {
      await userEvent.click(await screen.findByTestId(`${id}-deleting-expert`));
    });

    expect(await screen.findByTestId(`${id}-state-modal`)).toBeVisible();
    await act(async () => {
      await userEvent.click(
        await screen.findByTestId(`${id}-state-modal-confirm`),
      );
    });
    expect(screen.queryByTestId(`${id}-state-modal`)).not.toBeInTheDocument();
    expect(fetchMock.mock.calls).toHaveLength(1);
  });

  it("closes confirmation modal when transfer is cancelled", async () => {
    const id = ServiceInstance.a.id;
    const { component } = setupComponent();
    render(component);
    const testid = `${id}-force-state-toggle`;

    await act(async () => {
      await userEvent.click(await screen.findByTestId(testid));
    });
    await act(async () => {
      await userEvent.click(await screen.findByTestId(`${id}-deleting-expert`));
    });
    expect(await screen.findByTestId(`${id}-state-modal`)).toBeVisible();
    await act(async () => {
      await userEvent.click(
        await screen.findByTestId(`${id}-state-modal-cancel`),
      );
    });
    expect(screen.queryByTestId(`${id}-state-modal`)).not.toBeInTheDocument();
    expect(fetchMock.mock.calls).toHaveLength(0);
  });

  it("shows error message when transfer not successful", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ message: "Invalid request" }), {
      status: 400,
      statusText: "Bad Request",
    });
    const id = ServiceInstance.a.id;
    const { component } = setupComponent();
    render(component);
    const testid = `${id}-force-state-toggle`;

    await act(async () => {
      await userEvent.click(await screen.findByTestId(testid));
    });
    await act(async () => {
      await userEvent.click(await screen.findByTestId(`${id}-deleting-expert`));
    });

    // Modal is visible
    expect(await screen.findByTestId(`${id}-state-modal`)).toBeVisible();
    // Confirm transfer
    await act(async () => {
      await userEvent.click(
        await screen.findByTestId(`${id}-state-modal-confirm`),
      );
    });
    expect(screen.queryByTestId(`${id}-state-modal`)).not.toBeInTheDocument();
    expect(fetchMock.mock.calls).toHaveLength(1);
    // Error message is shown
    expect(await screen.findByTestId(`${id}-error-message`)).toBeVisible();
    await act(async () => {
      await userEvent.click(
        await screen.findByTestId(`${id}-close-error-message`),
      );
    });
    // Error message can be closed
    expect(screen.queryByTestId(`${id}-error-message`)).not.toBeInTheDocument();
  });
});
