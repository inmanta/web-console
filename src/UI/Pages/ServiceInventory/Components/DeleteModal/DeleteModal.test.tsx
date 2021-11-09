import React from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { EnvironmentDetails, RemoteData } from "@/Core";
import {
  BaseApiHelper,
  CommandResolverImpl,
  DeleteInstanceCommandManager,
  getStoreInstance,
} from "@/Data";
import { DynamicCommandManagerResolver, ServiceInstance } from "@/Test";
import { DependencyProvider, EnvironmentModifierImpl } from "@/UI/Dependency";
import { DeleteModal } from "./DeleteModal";

function setup() {
  const commandManager = new DeleteInstanceCommandManager(
    new BaseApiHelper(),
    ServiceInstance.a.environment
  );
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([commandManager])
  );
  const storeInstance = getStoreInstance();
  storeInstance.dispatch.environmentDetails.setData({
    id: ServiceInstance.a.environment,
    value: RemoteData.success({ halted: false } as EnvironmentDetails),
  });
  const environmentModifier = new EnvironmentModifierImpl();
  environmentModifier.setEnvironment(ServiceInstance.a.environment);
  return {
    component: (isDisabled = false) => (
      <DependencyProvider
        dependencies={{
          commandResolver,
          environmentModifier,
        }}
      >
        <StoreProvider store={storeInstance}>
          <DeleteModal
            id={ServiceInstance.a.id}
            version={ServiceInstance.a.version}
            isDisabled={isDisabled}
            service_entity={ServiceInstance.a.service_entity}
          />
        </StoreProvider>
      </DependencyProvider>
    ),
    storeInstance,
  };
}

describe("DeleteModal ", () => {
  it("Shows form when clicking on modal button", async () => {
    const { component } = setup();
    render(component());
    const modalButton = await screen.findByText("Delete");
    userEvent.click(modalButton);
    expect(await screen.findByText("Yes")).toBeVisible();
    expect(await screen.findByText("No")).toBeVisible();
  });
  it("Closes modal when cancelled", async () => {
    const { component } = setup();
    render(component());
    const modalButton = await screen.findByText("Delete");
    userEvent.click(modalButton);
    const noButton = await screen.findByText("No");
    userEvent.click(noButton);
    expect(screen.queryByText("Yes")).not.toBeInTheDocument();
  });
  it("Sends request when submitted", async () => {
    const { component } = setup();
    render(component());
    const modalButton = await screen.findByText("Delete");
    userEvent.click(modalButton);
    const yesButton = await screen.findByText("Yes");
    userEvent.click(yesButton);
    expect(screen.queryByText("Yes")).not.toBeInTheDocument();
    const [receivedUrl, requestInit] = fetchMock.mock.calls[0];
    expect(receivedUrl).toEqual(
      `/lsm/v1/service_inventory/${ServiceInstance.a.service_entity}/${ServiceInstance.a.id}?current_version=${ServiceInstance.a.version}`
    );
    expect(requestInit?.method).toEqual("DELETE");
  });
  it("Takes environment halted status in account", async () => {
    const { component, storeInstance } = setup();
    const { rerender } = render(component(true));
    act(() => {
      storeInstance.dispatch.environmentDetails.setData({
        id: ServiceInstance.a.environment,
        value: RemoteData.success({ halted: true } as EnvironmentDetails),
      });
    });
    rerender(component(false));
    expect(
      await screen.findByRole("button", { name: "Delete" })
    ).toBeDisabled();
  });
});
