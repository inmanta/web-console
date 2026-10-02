import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ServiceInstance, MockedDependencyProvider, EnvironmentDetails } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { ModalProvider } from "@/UI/Root/Components/ModalProvider";
import { words } from "@/UI/words";
import { DeleteAction } from "./DeleteAction";

const mockedMutate = vi.hoisted(() => vi.fn());

vi.mock("@/Data/Queries/Slices/ServiceInstance", () => ({
  useDeleteInstance: () => ({ mutate: mockedMutate }),
}));

function setup(halted: boolean = false) {
  return {
    component: (isDisabled = false) => (
      <QueryClientProvider client={testClient}>
        <MockedDependencyProvider env={{ ...EnvironmentDetails.env, halted }}>
          <ModalProvider>
            <DeleteAction
              id={ServiceInstance.a.id}
              instance_identity={
                ServiceInstance.a.service_identity_attribute_value ?? ServiceInstance.a.id
              }
              version={ServiceInstance.a.version}
              isDisabled={isDisabled}
              service_entity={ServiceInstance.a.service_entity}
            />
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
    const modalButton = await screen.findByText(words("delete"));

    await userEvent.click(modalButton);

    expect(await screen.findByText(words("yes"))).toBeVisible();
    expect(await screen.findByText(words("no"))).toBeVisible();
  });

  it("Closes modal when cancelled", async () => {
    const { component } = setup();

    render(component());

    const modalButton = await screen.findByText(words("delete"));

    await userEvent.click(modalButton);

    const noButton = await screen.findByText(words("no"));

    await userEvent.click(noButton);

    expect(screen.queryByText(words("yes"))).not.toBeInTheDocument();
  });

  it("Sends request when submitted", async () => {
    const { component } = setup();

    render(component());

    const modalButton = await screen.findByText(words("delete"));

    await userEvent.click(modalButton);

    const yesButton = await screen.findByText(words("yes"));

    await userEvent.click(yesButton);

    expect(mockedMutate).toHaveBeenCalled();
  });

  it("Takes environment halted status in account", async () => {
    const { component } = setup(true);
    const { rerender } = render(component(true));

    rerender(component(false));
    expect(await screen.findByRole("menuitem", { name: words("delete") })).toBeDisabled();
  });
});
