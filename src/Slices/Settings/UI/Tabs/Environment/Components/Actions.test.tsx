import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import * as envModifier from "@/UI/Dependency/EnvironmentModifier";
import { ModalProvider } from "@/UI/Root/Components/ModalProvider";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { Actions } from "./Actions";

function setup() {
  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider>
          <ModalProvider>
            <Actions environment={{ id: "env", name: "connect" }} />
          </ModalProvider>
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return { component };
}

describe("Environment Actions", () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => {
    server.close();
    jest.clearAllMocks();
  });

  test("GIVEN Environment Actions and delete modal WHEN empty or wrong env THEN delete disabled", async () => {
    const { component } = setup();

    render(component);

    await userEvent.click(await screen.findByRole("button", { name: "Delete environment" }));

    expect(
      screen.getByRole<HTMLInputElement>("textbox", {
        name: "delete environment check",
      })
    ).toHaveFocus();

    const input = screen.getByRole<HTMLInputElement>("textbox", {
      name: "delete environment check",
    });
    const deleteButton = screen.getByRole("button", { name: "delete" });

    expect(input.value).toHaveLength(0);
    expect(deleteButton).toBeDisabled();

    await userEvent.type(input, "wrong");

    expect(input.value).toMatch("wrong");
    expect(deleteButton).toBeDisabled();
  });

  test("GIVEN Environment Actions and delete modal WHEN correct env THEN delete enabled", async () => {
    const { component } = setup();

    render(component);

    await userEvent.click(await screen.findByRole("button", { name: "Delete environment" }));

    const input = screen.getByRole<HTMLInputElement>("textbox", {
      name: "delete environment check",
    });
    const deleteButton = screen.getByRole("button", { name: "delete" });

    expect(input.value).toHaveLength(0);
    expect(deleteButton).toBeDisabled();

    await userEvent.type(input, "connect");

    expect(input.value).toMatch("connect");
    expect(deleteButton).toBeEnabled();
  });

  test("GIVEN Environment Actions and delete modal WHEN correct env & delete button pressed THEN delete executed", async () => {
    let counter = 0;
    server.use(
      http.delete("/api/v2/environment/env", () => {
        counter++;
        return HttpResponse.json();
      })
    );
    const { component } = setup();

    render(component);

    await userEvent.click(await screen.findByRole("button", { name: "Delete environment" }));

    const input = screen.getByRole<HTMLInputElement>("textbox", {
      name: "delete environment check",
    });

    const deleteButton = screen.getByRole("button", { name: "delete" });

    await userEvent.type(input, "connect");

    await userEvent.click(deleteButton);

    expect(counter).toBe(1);
  });

  test("GIVEN Environment Actions and delete modal WHEN delete executed and error THEN error is shown", async () => {
    server.use(
      http.delete("/api/v2/environment/env", () => {
        return HttpResponse.json({ message: "error message" }, { status: 400 });
      })
    );
    const { component } = setup();

    render(component);

    await userEvent.click(await screen.findByRole("button", { name: "Delete environment" }));

    const input = screen.getByRole<HTMLInputElement>("textbox", {
      name: "delete environment check",
    });

    await userEvent.type(input, "connect");

    await userEvent.click(screen.getByRole("button", { name: "delete" }));

    const errorAlert = await screen.findByTestId("ErrorAlert");

    expect(within(errorAlert).getByText("error message")).toBeVisible();
  });
  test("GIVEN Environment Actions and clear modal WHEN correct env & clear button pressed THEN clear is executed", async () => {
    let counter = 0;
    server.use(
      http.delete("/api/v2/decommission/env", () => {
        counter++;
        return HttpResponse.json();
      })
    );
    const { component } = setup();
    render(component);

    await userEvent.click(await screen.findByRole("button", { name: "Clear environment" }));

    const input = screen.getByRole<HTMLInputElement>("textbox", {
      name: "clear environment check",
    });
    const clearButton = screen.getByRole("button", { name: "clear" });

    await userEvent.type(input, "connect");

    await userEvent.click(clearButton);

    expect(counter).toBe(1);
  });

  test("GIVEN Environment Actions WHEN the environment is protected THEN clear and delete are disabled", async () => {
    jest.spyOn(envModifier, "useEnvironmentModifierImpl").mockReturnValue({
      ...jest.requireActual("@/UI/Dependency/EnvironmentModifier"),
      useIsProtectedEnvironment: () => true,
    });
    const { component } = setup();

    render(component);
    expect(await screen.findByRole("button", { name: "Clear environment" })).toBeDisabled();
    expect(await screen.findByRole("button", { name: "Delete environment" })).toBeDisabled();
  });
});
