import React from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { InstanceStateLabel } from "./InstanceStateLabel";

test("GIVEN State label WHEN (name,label) is ('up','success') THEN name is visible", async () => {
  render(<InstanceStateLabel name="up" label="success" />);
  expect(screen.getByText("up")).toBeVisible();
});

test("GIVEN State label WHEN (name,label) is ('rejected','warning') THEN name is visible", async () => {
  render(<InstanceStateLabel name="rejected" label="warning" />);
  expect(screen.getByText("rejected")).toBeVisible();
});

test("GIVEN State label WHEN (name,label) is ('ordered',undefined) THEN name is visible", async () => {
  render(<InstanceStateLabel name="ordered" />);
  expect(screen.getByText("ordered")).toBeVisible();
});

test("GIVEN State label WHEN the state has a web_label annotation THEN the annotation is shown instead of the raw name", async () => {
  render(<InstanceStateLabel name="creating" annotations={{ web_label: "Creating" }} />);

  expect(screen.getByText("Creating")).toBeVisible();
  expect(screen.queryByText("creating")).not.toBeInTheDocument();
});

test("GIVEN State label WHEN the state has a web_icon annotation THEN the icon is rendered", async () => {
  render(
    <InstanceStateLabel
      name="creating"
      annotations={{ web_label: "Creating", web_icon: "FaCogs" }}
    />
  );

  expect(screen.getByTestId("FaCogs")).toBeVisible();
});

test("GIVEN State label WHEN the state has a web_description annotation THEN it is shown as a tooltip on hover", async () => {
  render(
    <InstanceStateLabel
      name="creating"
      annotations={{ web_label: "Creating", web_description: "The service is being deployed." }}
    />
  );

  const badge = screen.getByText("Creating");

  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

  await userEvent.hover(badge);

  expect(await screen.findByRole("tooltip")).toHaveTextContent("The service is being deployed.");
});

test("GIVEN State label WHEN the state has a status color and a web_icon THEN the icon is colored to match the status instead of the neutral default (issue #7094)", async () => {
  render(
    <InstanceStateLabel name="failed" label="danger" annotations={{ web_icon: "FaExclamationTriangle" }} />
  );

  const iconWrapper = await screen.findByTestId("FaExclamationTriangle");
  const icon = iconWrapper.querySelector("svg");

  expect(icon).toHaveStyle({
    color: "var(--pf-t--global--icon--color--status--danger--default)",
  });
});

test("GIVEN State label WHEN the state has annotations but no status color THEN a badge is still rendered", async () => {
  render(<InstanceStateLabel name="creating" annotations={{ web_label: "Creating" }} />);

  expect(screen.getByText("Creating").closest(".pf-v6-c-label")).toBeInTheDocument();
});
