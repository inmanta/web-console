import { render, screen } from "@testing-library/react";
import React from "react";
import { DeleteModal } from "./DeleteModal";
import userEvent from "@testing-library/user-event";

describe("DeleteModal", () => {
  it("Shows delete modal", async () => {
    render(
      <DeleteModal
        instanceId={"id1"}
        instanceVersion={5}
        isDisabled={false}
        serviceName={"test_service"}
      />
    );
    expect(await screen.findByText("Delete")).toBeVisible();
  });
  it("Shows form when clicking on modal button", async () => {
    render(
      <DeleteModal
        instanceId={"id1"}
        instanceVersion={5}
        isDisabled={false}
        serviceName={"test_service"}
      />
    );
    const modalButton = await screen.findByText("Delete");
    userEvent.click(modalButton);
    expect(await screen.findByText("Yes")).toBeVisible();
    expect(await screen.findByText("No")).toBeVisible();
  });
  it("Closes modal when cancelled", async () => {
    render(
      <DeleteModal
        instanceId={"id1"}
        instanceVersion={5}
        isDisabled={false}
        serviceName={"test_service"}
      />
    );
    const modalButton = await screen.findByText("Delete");
    userEvent.click(modalButton);
    const noButton = await screen.findByText("No");
    userEvent.click(noButton);
    expect(screen.queryByText("Yes")).not.toBeInTheDocument();
  });
});
