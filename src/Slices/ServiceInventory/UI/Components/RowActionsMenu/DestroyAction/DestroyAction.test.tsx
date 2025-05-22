import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ServiceInventoryContext } from "@/Slices/ServiceInventory/UI/ServiceInventory";
import { ServiceInstance, MockedDependencyProvider, EnvironmentDetails } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { words } from "@/UI";
import { ModalProvider } from "@/UI/Root/Components/ModalProvider";
import { DestroyAction } from "./DestroyAction";

const mockedMutate = jest.fn();

//mock is used to assert correct function call
jest.mock("@/Data/Queries/Slices/ServiceInstance/useDestroyInstance", () => ({
  useDestroyInstance: () => ({ mutate: mockedMutate }),
}));

function setup(halted: boolean = false) {
  return {
    component: () => (
      <QueryClientProvider client={testClient}>
        <MockedDependencyProvider env={{ ...EnvironmentDetails.env, halted }}>
          <ModalProvider>
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
              }}
            >
              <DestroyAction
                id={ServiceInstance.a.id}
                instance_identity={
                  ServiceInstance.a.service_identity_attribute_value ?? ServiceInstance.a.id
                }
                version={ServiceInstance.a.version}
                service_entity={ServiceInstance.a.service_entity}
              />
            </ServiceInventoryContext.Provider>
          </ModalProvider>
        </MockedDependencyProvider>
      </QueryClientProvider>
    ),
  };
}

describe("DeleteModal ", () => {
  it("Shows form when clicking on modal button", async () => {
    const { component } = setup();

    render(component());
    const modalButton = await screen.findByText(words("inventory.destroyInstance.button"));

    await userEvent.click(modalButton);

    expect(await screen.findByText(words("yes"))).toBeVisible();
    expect(await screen.findByText(words("no"))).toBeVisible();
  });

  it("Closes modal when cancelled", async () => {
    const { component } = setup();

    render(component());
    const modalButton = await screen.findByText(words("inventory.destroyInstance.button"));

    await userEvent.click(modalButton);

    const noButton = await screen.findByText(words("no"));

    await userEvent.click(noButton);

    expect(screen.queryByText(words("yes"))).not.toBeInTheDocument();
  });

  it("Sends request when submitted", async () => {
    const { component } = setup();

    render(component());
    const modalButton = await screen.findByText(words("inventory.destroyInstance.button"));

    await userEvent.click(modalButton);

    const yesButton = await screen.findByText(words("yes"));

    await userEvent.click(yesButton);

    expect(screen.queryByText(words("yes"))).not.toBeInTheDocument();
    expect(mockedMutate).toHaveBeenCalled();
  });

  it("Doesn't take environment halted status in account", async () => {
    const { component } = setup(true);
    const { rerender } = render(component());

    rerender(component());
    expect(await screen.findByText(words("inventory.destroyInstance.button"))).toBeEnabled();
  });
});
