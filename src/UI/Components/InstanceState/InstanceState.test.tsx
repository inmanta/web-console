import React from "react";
import { render, screen } from "@testing-library/react";
import { InstanceState } from "./InstanceState";

test("GIVEN State label WHEN (name,label) is ('up','success') THEN name is visible", async () => {
  render(<InstanceState name="up" label="success" />);
  expect(screen.getByText("up")).toBeVisible();
});

test("GIVEN State label WHEN (name,label) is ('rejected','warning') THEN name is visible", async () => {
  render(<InstanceState name="rejected" label="warning" />);
  expect(screen.getByText("rejected")).toBeVisible();
});

test("GIVEN State label WHEN (name,label) is ('ordered',undefined) THEN name is visible", async () => {
  render(<InstanceState name="ordered" />);
  expect(screen.getByText("ordered")).toBeVisible();
});
