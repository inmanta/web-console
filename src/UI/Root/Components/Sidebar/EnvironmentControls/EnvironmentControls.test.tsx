import { act } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { axe } from "jest-axe";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { QueryControlProvider } from "@/Data/Queries";
import { EnvironmentDetails, MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { ModalProvider } from "../../ModalProvider";
import { EnvironmentControls } from "./EnvironmentControls";

function setup() {
  const component = (
    <QueryClientProvider client={testClient}>
      <QueryControlProvider>
        <ModalProvider>
          <TestMemoryRouter initialEntries={["/?env=123"]}>
            <MockedDependencyProvider>
              <EnvironmentControls />
            </MockedDependencyProvider>
          </TestMemoryRouter>
        </ModalProvider>
      </QueryControlProvider>
    </QueryClientProvider>
  );

  return {
    component,
  };
}

describe("EnvironmentControls", () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("GIVEN EnvironmentControls WHEN rendered THEN it should be accessible", async () => {
    server.use(
      http.get("/api/v2/environment/c85c0a64-ed45-4cba-bdc5-703f65a225f7", () => {
        return HttpResponse.json({ data: EnvironmentDetails.a });
      })
    );

    const { component } = setup();
    const { container } = render(component);

    await act(async () => {
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  test("EnvironmentControls halt the environment when clicked and the environment is running", async () => {
    server.use(
      http.get("/api/v2/environment/c85c0a64-ed45-4cba-bdc5-703f65a225f7", () => {
        return HttpResponse.json({ data: EnvironmentDetails.a });
      }),
      http.post("/api/v2/actions/environment/halt", () => {
        return HttpResponse.json();
      })
    );
    const dispatchEventSpy = vi.spyOn(document, "dispatchEvent");

    const { component } = setup();

    render(component);

    const stopButton = await screen.findByText("STOP");

    expect(stopButton).toBeVisible();

    await userEvent.click(stopButton);

    await userEvent.click(await screen.findByText("Yes"));

    expect(dispatchEventSpy).toHaveBeenCalledTimes(3);
  });

  test("EnvironmentControls don\\t trigger backend call when dialog is not confirmed", async () => {
    const requestSpy = vi.fn();

    server.use(
      http.get("/api/v2/environment/c85c0a64-ed45-4cba-bdc5-703f65a225f7", () => {
        return HttpResponse.json({ data: EnvironmentDetails.a });
      }),
      http.post("/api/v2/actions/environment/halt", () => {
        requestSpy();
        return HttpResponse.json();
      })
    );
    const { component } = setup();

    render(component);
    const stopButton = await screen.findByText("STOP");

    expect(stopButton).toBeVisible();

    await userEvent.click(stopButton);

    await userEvent.click(await screen.findByText("No"));

    expect(requestSpy).not.toHaveBeenCalled();
  });

  test("EnvironmentControls resume the environment when clicked and the environment is halted", async () => {
    server.use(
      http.get("/api/v2/environment/c85c0a64-ed45-4cba-bdc5-703f65a225f7", () => {
        return HttpResponse.json({ data: EnvironmentDetails.halted });
      }),
      http.post("/api/v2/actions/environment/resume", () => {
        return HttpResponse.json();
      })
    );
    const dispatchEventSpy = vi.spyOn(document, "dispatchEvent");

    const { component } = setup();

    render(component);

    expect(await screen.findByText("Operations halted")).toBeVisible();

    const start = await screen.findByText("Resume");

    expect(start).toBeVisible();

    await userEvent.click(start);

    await userEvent.click(await screen.findByText("Yes"));

    expect(dispatchEventSpy).toHaveBeenCalledTimes(3);
  });
});
