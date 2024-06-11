import React from "react";
import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either, EnvironmentDetails, RemoteData } from "@/Core";
import {
  CommandManagerResolverImpl,
  CommandResolverImpl,
  getStoreInstance,
  KeycloakAuthHelper,
} from "@/Data";
import { ServiceInventoryContext } from "@/Slices/ServiceInventory/UI/ServiceInventory";
import { DeferredApiHelper, dependencies, ServiceInstance } from "@/Test";
import { words } from "@/UI";
import { DependencyProvider } from "@/UI/Dependency";
import { DeleteAction } from "./DeleteAction";

function setup() {
  const apiHelper = new DeferredApiHelper();
  const authHelper = new KeycloakAuthHelper();
  const storeInstance = getStoreInstance();
  storeInstance.dispatch.environment.setEnvironmentDetailsById({
    id: ServiceInstance.a.environment,
    value: RemoteData.success({ halted: false } as EnvironmentDetails),
  });

  dependencies.environmentModifier.setEnvironment(
    ServiceInstance.a.environment,
  );

  const commandResolver = new CommandResolverImpl(
    new CommandManagerResolverImpl(storeInstance, apiHelper, authHelper),
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
          <ServiceInventoryContext.Provider
            value={{
              labelFiltering: {
                danger: [],
                warning: [],
                success: [],
                info: [],
                no_label: [],
                onClick: jest.fn(),
              },

              refetch,
            }}
          >
            <DeleteAction
              id={ServiceInstance.a.id}
              instance_identity={
                ServiceInstance.a.service_identity_attribute_value ??
                ServiceInstance.a.id
              }
              version={ServiceInstance.a.version}
              isDisabled={isDisabled}
              service_entity={ServiceInstance.a.service_entity}
            />
          </ServiceInventoryContext.Provider>
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
    const modalButton = await screen.findByText(words("delete"));
    await act(async () => {
      await userEvent.click(modalButton);
    });

    expect(await screen.findByText(words("yes"))).toBeVisible();
    expect(await screen.findByText(words("no"))).toBeVisible();
  });
  it("Closes modal when cancelled", async () => {
    const { component } = setup();
    render(component());

    const modalButton = await screen.findByText(words("delete"));
    await act(async () => {
      await userEvent.click(modalButton);
    });

    const noButton = await screen.findByText(words("no"));
    await act(async () => {
      await userEvent.click(noButton);
    });

    expect(screen.queryByText(words("yes"))).not.toBeInTheDocument();
  });
  it("Sends request when submitted", async () => {
    const { component, apiHelper, refetch } = setup();
    render(component());

    const modalButton = await screen.findByText(words("delete"));
    await act(async () => {
      await userEvent.click(modalButton);
    });

    const yesButton = await screen.findByText(words("yes"));
    await act(async () => {
      await userEvent.click(yesButton);
    });

    expect(screen.queryByText(words("yes"))).not.toBeInTheDocument();
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
    await act(async () => {
      storeInstance.dispatch.environment.setEnvironmentDetailsById({
        id: ServiceInstance.a.environment,
        value: RemoteData.success({ halted: true } as EnvironmentDetails),
      });
    });
    rerender(component(false));
    expect(
      await screen.findByRole("menuitem", { name: words("delete") }),
    ).toBeDisabled();
  });
});
