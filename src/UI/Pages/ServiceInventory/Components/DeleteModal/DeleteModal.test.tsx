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
  return {
    component: (isDisabled = false) => (
      <StoreProvider store={storeInstance}>
        <DependencyProvider
          dependencies={{
            ...dependencies,
            commandResolver,
          }}
        >
          <DeleteModal
            id={ServiceInstance.a.id}
            version={ServiceInstance.a.version}
            isDisabled={isDisabled}
            service_entity={ServiceInstance.a.service_entity}
          />
        </DependencyProvider>
      </StoreProvider>
    ),
    storeInstance,
    apiHelper,
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
    const { component, apiHelper } = setup();
    render(component());
    const modalButton = await screen.findByText("Delete");
    userEvent.click(modalButton);
    const yesButton = await screen.findByText("Yes");
    userEvent.click(yesButton);
    expect(screen.queryByText("Yes")).not.toBeInTheDocument();
    expect(apiHelper.pendingRequests[0]).toEqual({
      environment: "env",
      method: "DELETE",
      url: `/lsm/v1/service_inventory/${ServiceInstance.a.service_entity}/${ServiceInstance.a.id}?current_version=${ServiceInstance.a.version}`,
    });
    await apiHelper.resolve(Either.right(null));
    expect(apiHelper.pendingRequests[0]).toEqual({
      environment: "env",
      method: "GET",
      url: `/lsm/v1/service_inventory/${ServiceInstance.a.service_entity}?include_deployment_progress=True&limit=20&&sort=created_at.desc`,
    });
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
