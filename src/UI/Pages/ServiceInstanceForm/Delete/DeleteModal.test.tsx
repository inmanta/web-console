import { render, screen } from "@testing-library/react";
import React from "react";
import { DeleteModal } from "./DeleteModal";
import userEvent from "@testing-library/user-event";
import { BaseApiHelper, InstanceDeleter } from "@/Infra";
import {
  CommandResolverImpl,
  DeleteInstanceCommandManager,
  DependencyProvider,
} from "@/UI";
import { DynamicCommandManagerResolver } from "@/Test";

function setup() {
  const commandManager = new DeleteInstanceCommandManager(
    new InstanceDeleter(new BaseApiHelper(), "env1")
  );
  return {
    commandResolver: new CommandResolverImpl(
      new DynamicCommandManagerResolver([commandManager])
    ),
  };
}

describe("DeleteModal", () => {
  it("Shows delete modal", async () => {
    const { commandResolver } = setup();
    render(
      <DependencyProvider dependencies={{ commandResolver }}>
        <DeleteModal
          instanceId={"id1"}
          instanceVersion={5}
          isDisabled={false}
          serviceName={"test_service"}
        />
      </DependencyProvider>
    );
    expect(await screen.findByText("Delete")).toBeVisible();
  });
  it("Shows form when clicking on modal button", async () => {
    const { commandResolver } = setup();
    render(
      <DependencyProvider dependencies={{ commandResolver }}>
        <DeleteModal
          instanceId={"id1"}
          instanceVersion={5}
          isDisabled={false}
          serviceName={"test_service"}
        />
      </DependencyProvider>
    );
    const modalButton = await screen.findByText("Delete");
    userEvent.click(modalButton);
    expect(await screen.findByText("Yes")).toBeVisible();
    expect(await screen.findByText("No")).toBeVisible();
  });
  it("Closes modal when cancelled", async () => {
    const { commandResolver } = setup();
    render(
      <DependencyProvider dependencies={{ commandResolver }}>
        <DeleteModal
          instanceId={"id1"}
          instanceVersion={5}
          isDisabled={false}
          serviceName={"test_service"}
        />
      </DependencyProvider>
    );
    const modalButton = await screen.findByText("Delete");
    userEvent.click(modalButton);
    const noButton = await screen.findByText("No");
    userEvent.click(noButton);
    expect(screen.queryByText("Yes")).not.toBeInTheDocument();
  });
  it("Sends request when submitted", async () => {
    const { commandResolver } = setup();
    render(
      <DependencyProvider dependencies={{ commandResolver }}>
        <DeleteModal
          instanceId={"id1"}
          instanceVersion={5}
          isDisabled={false}
          serviceName={"test_service"}
        />
      </DependencyProvider>
    );
    const modalButton = await screen.findByText("Delete");
    userEvent.click(modalButton);
    const yesButton = await screen.findByText("Yes");
    userEvent.click(yesButton);
    expect(screen.queryByText("Yes")).not.toBeInTheDocument();
    const [receivedUrl, requestInit] = fetchMock.mock.calls[0];
    expect(receivedUrl).toEqual(
      "/lsm/v1/service_inventory/test_service/id1?current_version=5"
    );
    expect(requestInit?.method).toEqual("DELETE");
  });
});
