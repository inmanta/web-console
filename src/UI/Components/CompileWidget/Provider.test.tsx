import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { EnvironmentDetails, MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { words } from "@/UI/words";
import { Provider } from "./Provider";

function setup({ serverCompileEnabled = true } = {}) {
  const afterTrigger = vi.fn();

  const component = (
    <QueryClientProvider client={testClient}>
      <MockedDependencyProvider
        env={{
          ...EnvironmentDetails.env,
          settings: { ...EnvironmentDetails.env.settings, server_compile: serverCompileEnabled },
        }}
      >
        <Provider afterTrigger={afterTrigger} />
      </MockedDependencyProvider>
    </QueryClientProvider>
  );

  return { component, afterTrigger };
}
const server = setupServer(
  http.post("/api/v1/notify/c85c0a64-ed45-4cba-bdc5-703f65a225f7", async () => {
    return HttpResponse.json({});
  })
);

describe("CompileWidgetProvider", () => {
  beforeAll(() => server.listen());
  afterAll(() => {
    server.close();
    vi.clearAllMocks();
  });

  test("GIVEN CompileButton WHEN clicked THEN triggers recompile", async () => {
    const { component, afterTrigger } = setup();

    render(component);

    const button = screen.getByRole("button", {
      name: "RecompileButton",
    });

    await userEvent.click(button);

    const toast = await screen.findByTestId("info-message");

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

    const toast = await screen.findByTestId("info-message");

    expect(toast).toBeVisible();
    expect(toast).toHaveTextContent(words("common.compileWidget.toast")(true));

    expect(afterTrigger).toHaveBeenCalled();
  });

  test("GIVEN CompileButton WHEN recompile clicked THEN toast appears", async () => {
    const { component } = setup();

    render(component);

    const button = screen.getByRole("button", { name: "RecompileButton" });

    await userEvent.click(button);

    expect(screen.queryByTestId("info-message")).toBeInTheDocument();

    expect(button).toBeEnabled();
  });

  test("GIVEN CompileButton WHEN environmentSetting server_compile is disabled THEN button is disabled", async () => {
    const { component } = setup({
      serverCompileEnabled: false,
    });

    render(component);

    const button = screen.getByRole("button", { name: "RecompileButton" });

    expect(button).toBeDisabled();
  });

  test("GIVEN CompileButton WHEN recompile fails THEN error message is shown", async () => {
    const { component } = setup();

    server.use(
      http.post("/api/v1/notify/c85c0a64-ed45-4cba-bdc5-703f65a225f7", async () => {
        return HttpResponse.error();
      })
    );

    render(component);

    const button = screen.getByRole("button", { name: "RecompileButton" });

    await userEvent.click(button);

    const errorMessage = await screen.findByTestId("error-message");

    expect(errorMessage).toBeVisible();
    expect(errorMessage).toHaveTextContent("Error");
  });
});
