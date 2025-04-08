import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { getStoreInstance } from "@/Data";
import { dependencies, MockEnvironmentModifier } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { DependencyProvider } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Provider } from "./Provider";

function setup({
  details = {
    halted: false,
    server_compile: true,
    protected_environment: false,
    enable_lsm_expert_mode: false,
  },
  isToastVisible = true,
} = {}) {
  const store = getStoreInstance();

  const environmentModifier = new MockEnvironmentModifier(details);
  const afterTrigger = jest.fn();

  const component = (
    <QueryClientProvider client={testClient}>
      <StoreProvider store={store}>
        <DependencyProvider
          dependencies={{
            ...dependencies,
            environmentModifier,
          }}
        >
          <Provider afterTrigger={afterTrigger} isToastVisible={isToastVisible} />
        </DependencyProvider>
      </StoreProvider>
    </QueryClientProvider>
  );

  return { component, afterTrigger };
}
const server = setupServer(
  http.post("/api/v1/notify/env", async () => {
    return HttpResponse.json({});
  })
);

describe("CompileWidgetProvider", () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  test("GIVEN CompileButton WHEN clicked THEN triggers recompile", async () => {
    const { component, afterTrigger } = setup();

    render(component);

    const button = screen.getByRole("button", {
      name: "RecompileButton",
    });

    await userEvent.click(button);

    const toast = screen.getByTestId("ToastAlert");

    expect(toast).toBeVisible();
    expect(toast).toHaveTextContent(words("common.compileWidget.toast")(false));
    expect(afterTrigger).toHaveBeenCalled();

    expect(button).toBeEnabled();
  });

  test("GIVEN CompileButton WHEN clicked on toggle and clicked on Update & Recompile option THEN triggers recompile with update", async () => {
    const { component, afterTrigger } = setup();

    render(component);

    const widget = screen.getByRole("button", { name: "RecompileButton" });

    expect(widget).toBeVisible();

    const toggle = screen.getByRole("button", {
      name: "Toggle",
    });

    expect(toggle).toBeEnabled();

    await userEvent.click(toggle);

    const button = screen.getByRole("menuitem", {
      name: "UpdateAndRecompileButton",
    });

    await userEvent.click(button);

    const toast = screen.getByTestId("ToastAlert");

    expect(toast).toBeVisible();
    expect(toast).toHaveTextContent(words("common.compileWidget.toast")(true));

    expect(afterTrigger).toHaveBeenCalled();
  });

  test("GIVEN CompileButton WHEN environmentSetting server_compile is disabled THEN button is disabled", async () => {
    const { component } = setup({
      details: {
        halted: false,
        server_compile: false,
        protected_environment: false,
        enable_lsm_expert_mode: false,
      },
    });

    render(component);

    const button = screen.getByRole("button", { name: "RecompileButton" });

    expect(button).toBeDisabled();
  });

  test("GIVEN CompileButton WHEN 'isToastVisible' parameter is false and recompile clicked THEN toast won't appear", async () => {
    const { component } = setup({
      details: {
        halted: false,
        server_compile: true,
        protected_environment: false,
        enable_lsm_expert_mode: false,
      },
      isToastVisible: false,
    });

    render(component);

    const button = screen.getByRole("button", { name: "RecompileButton" });

    await userEvent.click(button);

    expect(screen.queryByTestId("ToastAlert")).not.toBeInTheDocument();

    expect(button).toBeEnabled();
  });
});
