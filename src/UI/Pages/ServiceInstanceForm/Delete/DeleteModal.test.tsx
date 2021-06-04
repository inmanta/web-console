import { render, screen } from "@testing-library/react";
import React from "react";
import { DeleteModal } from "./DeleteModal";
import userEvent from "@testing-library/user-event";
import {
  CommandResolverImpl,
  DeleteInstanceCommandManager,
  BaseApiHelper,
  InstanceDeleter,
} from "@/Data";
import { DependencyProvider } from "@/UI";
import { DynamicCommandManagerResolver, ServiceInstance } from "@/Test";

function setup() {
  const commandManager = new DeleteInstanceCommandManager(
    new InstanceDeleter(new BaseApiHelper(), ServiceInstance.a.environment)
  );
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([commandManager])
  );
  return {
    component: (
      <DependencyProvider dependencies={{ commandResolver }}>
        <DeleteModal
          id={ServiceInstance.a.id}
          version={ServiceInstance.a.version}
          isDisabled={false}
          service_entity={ServiceInstance.a.service_entity}
        />
      </DependencyProvider>
    ),
  };
}

describe("DeleteModal ", () => {
  it("Shows form when clicking on modal button", async () => {
    const { component } = setup();
    render(component);
    const modalButton = await screen.findByText("Delete");
    userEvent.click(modalButton);
    expect(await screen.findByText("Yes")).toBeVisible();
    expect(await screen.findByText("No")).toBeVisible();
  });
  it("Closes modal when cancelled", async () => {
    const { component } = setup();
    render(component);
    const modalButton = await screen.findByText("Delete");
    userEvent.click(modalButton);
    const noButton = await screen.findByText("No");
    userEvent.click(noButton);
    expect(screen.queryByText("Yes")).not.toBeInTheDocument();
  });
  it("Sends request when submitted", async () => {
    const { component } = setup();
    render(component);
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
});
