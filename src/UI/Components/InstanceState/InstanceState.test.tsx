import React from "react";
import { InstanceState } from "./InstanceState";
import { render, screen } from "@testing-library/react";

test("GIVEN State label WHEN (name,label) is ('up', 'success') THEN name is visible", async () => {
  render(<InstanceState name="up" label="success" />);
  const label = screen.getByRole("generic", { name: "InstanceState-up" });
  expect(label).toBeVisible();
});

test("GIVEN State label WHEN (name,label) is ('rejected', 'warning') THEN name is visible", async () => {
  render(<InstanceState name="rejected" label="warning" />);
  const label = screen.getByRole("generic", { name: "InstanceState-rejected" });
  expect(label).toBeVisible();
});

test("GIVEN State label WHEN (name,label) is ('ordered', null) THEN name is visible", async () => {
  render(<InstanceState name="ordered" />);
  const label = screen.getByRole("generic", { name: "InstanceState-ordered" });
  expect(label).toBeVisible();
});
