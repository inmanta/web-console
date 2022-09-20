import React from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either, EnvironmentDetails, RemoteData } from "@/Core";
import {
  CommandManagerResolver,
  CommandResolverImpl,
  getStoreInstance,
  KeycloakAuthHelper,
} from "@/Data";
import { DeferredApiHelper, dependencies, ServiceInstance } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { GetInstancesContext } from "../../GetInstancesContext";
import { DeleteModal } from "./DeleteModal";

function setup() {
  const apiHelper = new DeferredApiHelper();
  const authHelper = new KeycloakAuthHelper();
  const storeInstance = getStoreInstance();
  storeInstance.dispatch.environment.setEnvironmentDetailsById({
    id: ServiceInstance.a.environment,
    value: RemoteData.success({ halted: false } as EnvironmentDetails),
  });

  dependencies.environmentModifier.setEnvironment(
    ServiceInstance.a.environment
  );

  const commandResolver = new CommandResolverImpl(
    new CommandManagerResolver(storeInstance, apiHelper, authHelper)
  );
  const refetch = jest.fn();
  return {
    component: (isDisabled = false) => (
      <StoreProvider store={storeInstance}>
        <DependencyProvider
          dependencies={{
            ...dependencies,
            commandResolver,
          }}
        >
          <GetInstancesContext.Provider value={{ refetch }}>
            <DeleteModal
              id={ServiceInstance.a.id}
              instance_identity={
                ServiceInstance.a.service_identity_attribute_value ??
                ServiceInstance.a.id
              }
              version={ServiceInstance.a.version}
              isDisabled={isDisabled}
              service_entity={ServiceInstance.a.service_entity}
            />
          </GetInstancesContext.Provider>
        </DependencyProvider>
      </StoreProvider>
    ),
    storeInstance,
    apiHelper,
    refetch,
  };
}

describe("DeleteModal ", () => {
  it("Shows form when clicking on modal button", async () => {
    const { component } = setup();
    render(component());
    const modalButton = await screen.findByText("Delete");
    await userEvent.click(modalButton);
    expect(await screen.findByText("Yes")).toBeVisible();
    expect(await screen.findByText("No")).toBeVisible();
  });
  it("Closes modal when cancelled", async () => {
    const { component } = setup();
    render(component());
    const modalButton = await screen.findByText("Delete");
    await userEvent.click(modalButton);
    const noButton = await screen.findByText("No");
    await userEvent.click(noButton);
    expect(screen.queryByText("Yes")).not.toBeInTheDocument();
  });
  it("Sends request when submitted", async () => {
    const { component, apiHelper, refetch } = setup();
    render(component());
    const modalButton = await screen.findByText("Delete");
    await userEvent.click(modalButton);
    const yesButton = await screen.findByText("Yes");
    await userEvent.click(yesButton);
    expect(screen.queryByText("Yes")).not.toBeInTheDocument();
    expect(apiHelper.pendingRequests[0]).toEqual({
      environment: "env",
      method: "DELETE",
      url: `/lsm/v1/service_inventory/${ServiceInstance.a.service_entity}/${ServiceInstance.a.id}?current_version=${ServiceInstance.a.version}`,
    });
    await apiHelper.resolve(Either.right(null));
    expect(refetch).toHaveBeenCalled();
  });
  it("Takes environment halted status in account", async () => {
    const { component, storeInstance } = setup();
    const { rerender } = render(component(true));
    act(() => {
      storeInstance.dispatch.environment.setEnvironmentDetailsById({
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
