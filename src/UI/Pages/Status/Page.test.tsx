import React from "react";
import { render, screen } from "@testing-library/react";
import { dependencies, ServerStatus } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { Page } from "./Page";

test("GIVEN StatusPage THEN shows server status", async () => {
  dependencies.statusManager.setServerStatus(ServerStatus.withLsm);

  render(
    <DependencyProvider dependencies={{ ...dependencies }}>
      <Page />
    </DependencyProvider>
  );

  expect(screen.getByRole("list", { name: "StatusList" })).toBeVisible();
  expect(
    screen.getByRole("listitem", {
      name: "StatusItem-Inmanta Service Orchestrator",
    })
  ).toBeVisible();
  expect(
    screen.getByRole("listitem", {
      name: "StatusItem-lsm",
    })
  ).toBeVisible();
  expect(
    screen.getByRole("listitem", {
      name: "StatusItem-lsm.database",
    })
  ).toBeVisible();
});
