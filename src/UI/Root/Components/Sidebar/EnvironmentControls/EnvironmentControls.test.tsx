import React, { act } from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { axe, toHaveNoViolations } from "jest-axe";
import { getStoreInstance } from "@/Data";
import { EnvironmentDetails, MockedDependencyProvider } from "@/Test";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { ModalProvider } from "../../ModalProvider";
import { EnvironmentControls } from "./EnvironmentControls";
import { setupServer } from "msw/node";
import { testClient } from "@/Test/Utils/react-query-setup";
import { QueryClientProvider } from "@tanstack/react-query";
import { HttpResponse } from "msw";
import { http } from "msw";
import { QueryControlProvider } from "@/Data/Managers/V2/helpers/QueryControlContext";

expect.extend(toHaveNoViolations);

function setup() {
  const store = getStoreInstance();

  const component = (
    <QueryClientProvider client={testClient}>
      <QueryControlProvider>
        <ModalProvider>
          <TestMemoryRouter initialEntries={["/?env=123"]}>
            <MockedDependencyProvider>
              <StoreProvider store={store}>
                <EnvironmentControls />
              </StoreProvider>
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
    const dispatchEventSpy = jest.spyOn(document, "dispatchEvent");

    const { component } = setup();

    render(component);

    const stopButton = await screen.findByText("STOP");

    expect(stopButton).toBeVisible();

    await userEvent.click(stopButton);

    await userEvent.click(await screen.findByText("Yes"));

    expect(dispatchEventSpy).toHaveBeenCalledTimes(3);
  });

  test("EnvironmentControls don\\t trigger backend call when dialog is not confirmed", async () => {
    server.use(
      http.get("/api/v2/environment/c85c0a64-ed45-4cba-bdc5-703f65a225f7", () => {
        return HttpResponse.json({ data: EnvironmentDetails.a });
      }),
      http.post("/api/v2/actions/environment/halt", () => {
        return HttpResponse.json();
      })
    );
    const { component } = setup();

    render(component);
    const stopButton = await screen.findByText("STOP");

    expect(stopButton).toBeVisible();

    await userEvent.click(stopButton);

    await userEvent.click(await screen.findByText("No"));

    expect(fetchMock.mock.calls).toHaveLength(0);
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
    const dispatchEventSpy = jest.spyOn(document, "dispatchEvent");

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
