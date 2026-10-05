import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { ServiceModel } from "@/Core";
import { REFETCH_INTERVAL } from "@/Data/Queries";
import { MockedDependencyProvider, Service } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { words } from "@/UI/words";
import { ServiceProvider } from "./ServiceProvider";

const Wrapper: React.FC<{ name: string; children?: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);

const Dependant: React.FC<{ service: ServiceModel }> = ({ service }) => (
  <div aria-label="Dependant">{service.name}</div>
);

function setup() {
  return (
    <QueryClientProvider client={testClient}>
      <MockedDependencyProvider>
        <ServiceProvider serviceName={Service.a.name} Wrapper={Wrapper} Dependant={Dependant} />
      </MockedDependencyProvider>
    </QueryClientProvider>
  );
}

describe("ServiceProvider", () => {
  const server = setupServer();

  beforeAll(() => {
    server.listen();
  });
  afterEach(() => {
    vi.useRealTimers();
    server.resetHandlers();
    testClient.clear();
  });
  afterAll(() => {
    server.close();
  });

  test("GIVEN ServiceProvider WHEN the service request fails THEN shows the error view and Retry refetches", async () => {
    const errorMessage = "boom";

    server.use(
      http.get(`/lsm/v1/service_catalog/${Service.a.name}`, () =>
        HttpResponse.json({ message: errorMessage }, { status: 500 })
      )
    );

    render(setup());

    expect(await screen.findByRole("region", { name: "ServiceProvider-Failed" })).toBeVisible();
    expect(screen.getByText(errorMessage)).toBeVisible();

    server.use(
      http.get(`/lsm/v1/service_catalog/${Service.a.name}`, () =>
        HttpResponse.json({ data: Service.a })
      )
    );

    await userEvent.click(screen.getByRole("button", { name: words("retry") }));

    expect(await screen.findByLabelText("Dependant")).toHaveTextContent(Service.a.name);
    expect(
      screen.queryByRole("region", { name: "ServiceProvider-Failed" })
    ).not.toBeInTheDocument();
  });

  test("GIVEN ServiceProvider with a loaded service WHEN a later poll fails THEN keeps showing the service", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    server.use(
      http.get(`/lsm/v1/service_catalog/${Service.a.name}`, () =>
        HttpResponse.json({ data: Service.a })
      )
    );

    render(setup());

    expect(await screen.findByLabelText("Dependant")).toHaveTextContent(Service.a.name);

    server.use(
      http.get(`/lsm/v1/service_catalog/${Service.a.name}`, () =>
        HttpResponse.json({ message: "boom" }, { status: 500 })
      )
    );

    await act(() => vi.advanceTimersByTimeAsync(REFETCH_INTERVAL));

    expect(testClient.getQueryCache().getAll()[0].state.status).toBe("error");
    expect(screen.getByLabelText("Dependant")).toHaveTextContent(Service.a.name);
    expect(
      screen.queryByRole("region", { name: "ServiceProvider-Failed" })
    ).not.toBeInTheDocument();
  });
});
