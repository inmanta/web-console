import React from "react";
import { render, screen } from "@testing-library/react";
import { PageContainer } from "./PageContainer";

test("Given a PageContainer without actions, then only the title is rendered", () => {
  render(
    <PageContainer pageTitle="My Page">
      <div>content</div>
    </PageContainer>
  );

  expect(screen.getByRole("heading", { level: 1, name: "My Page" })).toBeVisible();
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
  expect(screen.getByText("content")).toBeVisible();
});

test("Given a PageContainer with actions, then the title and actions are rendered side by side", () => {
  render(
    <PageContainer pageTitle="My Page" actions={<button>Actions</button>}>
      <div>content</div>
    </PageContainer>
  );

  const title = screen.getByRole("heading", { level: 1, name: "My Page" });
  const actionsButton = screen.getByRole("button", { name: "Actions" });

  expect(title).toBeVisible();
  expect(actionsButton).toBeVisible();
  // Title and actions should be siblings within the same flex row, not nested inside each other.
  expect(title.parentElement?.parentElement).toBe(actionsButton.parentElement?.parentElement);
});
